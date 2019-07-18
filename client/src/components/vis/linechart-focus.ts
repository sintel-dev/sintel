import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pip-client';
import { LineChartDataEle } from './data.interface';
import { colorSchemes } from '../../services/globals';
import { Event } from '../../services/rest-server.interface';
import dataProcessor from '../../services/data-processor';


export interface Option {
    // layout
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    errorHeight?: number;
    // animation
    duration?: number;
    delay?: number;
    // axis
    xDomain?: [number, number];
    yDomain?: [number, number];
    // functions
    tooltip?: boolean;
    smooth?: boolean;
    context?: boolean;
    windows?: Array<[number, number, number, string]>;  // start_time, stop_time, score, event_id
    offset?: number;
    xAxis?: boolean;
    yAxis?: boolean;
}

export class LineChartFocus extends pip.Events {

    public option: Option = {
        // layout
        height: null,
        width: null,
        margin: { top: 25, right: 5, bottom: 15, left: 35 },
        errorHeight: 80,
        // animation
        duration: 750,
        delay: 50,
        // axis
        xDomain: null,
        yDomain: null,
        // functions
        tooltip: false,
        smooth: false,
        windows: null,
        context: false,
        xAxis: true,
        yAxis: true,
        offset: 0
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private defaultHeight = 300;

    constructor(
        ele: HTMLElement,
        private data: LineChartDataEle[],
        option?: Option
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        self.option.width = self.option.width === null ? $(ele).innerWidth() : self.option.width;
        self.option.height = self.option.height === null ? self.defaultHeight : self.option.height;

        self.svgContainer
            .style('overflow-x', 'hidden')
            .style('overflow-y', 'hidden');

        // append svg to <div>
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('class', 'multi-line-chart-focus')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.plot();
    }

    private plot() {
        let self = this;
        const option = self.option;
        const [w, h] = [
            option.width - option.margin.left - option.margin.right,
            option.height - option.margin.top - option.margin.bottom,
        ];

        // define axis scale
        let { x, y, ye } = self.getScale(w, h);
        let copyX = x.copy();

        let chart = self.svg.append<SVGGElement>('g')
            .attr('transform', `translate(${option.margin.left},${option.margin.top})`);

        // plot axis
        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y);
        let axisG = chart.append('g')
            .attr('transform', `translate(0, ${option.errorHeight})`);

        if (option.xAxis) {
            axisG.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', `translate(0, ${h - option.errorHeight})`)
                .call(xAxis);
        }

        if (option.yAxis) {
            axisG.append('g')
                .attr('class', 'axis axis--y')
                .call(yAxis.ticks(5, ',f'));
        }

        // function used to plot line
        let line = d3.line<[number, number]>()
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        let clip = chart.append('defs')
            .append('clipPath')
            .attr('id', 'focusClip')
            .append('rect')
            .attr('width', w)
            .attr('height', h + option.errorHeight)
            .attr('x', 0)
            .attr('y', -option.errorHeight);

        let focus = chart.append('g')
            .attr('class', 'focus')
            .attr('transform', `translate(0, ${option.errorHeight})`)
            .attr('clip-path', 'url(#focusClip)');

        focus.append('g')
            .attr('class', 'line-group')
            .selectAll('.line')
            .data(self.data)
            .enter().append('path')
            .attr('class', 'line')
            .style('stroke', d => colorSchemes.getColorCode('dname'))
            .attr('d', d => line(d.timeseries));

        let area = d3.area<[number, number]>()
            .x(function(d) { return x(d[0]); })
            .y0(function(d) { return -ye(d[1]) / 2 - option.errorHeight / 2; })
            .y1(function(d) { return ye(d[1]) / 2 - option.errorHeight / 2; });

        let {editor, updateX, enableEditor,
             disableEditor, makeEditable} = self.addEventEditor(focus, w, h , x);
        disableEditor();

        let { zoom, enableZoom, disableZoom, resetZoom } = self.addZoom(w, h);
        zoom.on('zoom', zoomHandler);
        enableZoom();

        // let { brush, enableBrush, disableBrush, makeWindowEditable } = self.addBrush(focus, w, h, x);
        // disableBrush();

        let {highlightUpdate} = self.addHighlights(h - option.errorHeight, x, line);

        // ************  events  ************
        let savedZoom = d3.zoomIdentity;
        self.on('data:update', dataUpdateHandler);

        self.on('brush:update', brushUpdateHandler);

        self.on('zoomPanMode', () => {
            enableZoom();
            disableEditor();
        });

        self.on('addEventMode', () => {
            if (self.data.length > 1) { return; }
            // only execute when there is only one timeseries
            disableZoom();
            enableEditor();
        });

        let assessMode = false;
        self.on('showPrediction', () => {
            if (self.data.length > 1) { return; }
            // only execute when there is only one timeseries
            assessMode = !assessMode;
            if (assessMode) {
                focus.append('path')
                    .datum(self.data[0].timeseriesPred)
                    .attr('class', 'line2')
                    .attr('d', line);

                focus.append('path')
                    .datum(self.data[0].timeseriesErr)
                    .attr('class', 'error')
                    .attr('d', area);
            } else {
                focus.select('.line2').remove();
                focus.select('.error').remove();
            }
        });

        self.on('event:update', eventUpdateHandler);

        self.on('event:modify', eventModifyHandler);

        // ************  event handlers  ************
        function zoomHandler() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') { return; } // ignore zoom-by-brush

            let t = d3.event.transform;
            savedZoom = t;

            x.domain(t.rescaleX(copyX).domain());

            // update normal line
            focus.selectAll<any, LineChartDataEle>('.line')
                .attr('d', d => line(d.timeseries));

            // update prediction curve
            if (assessMode) {
                focus.select('.line2').attr('d', line);
                focus.select('.error').attr('d', area);
            }

            // update highlighted windows
            _.each(self.data, (d, i) => {
                highlightUpdate(d.windows, d.timeseries, x, 'dname', i, d.datarun, d.dataset);
            });

            // update x axis
            axisG.select('.axis--x').call(xAxis);

            pip.content.trigger('focus:zoom', x.range().map(t.invertX, t));
        }

        function dataUpdateHandler(newData: LineChartDataEle[]) {
            self.data = newData;
            let sc = self.getScale(w, h);
            [x, y, ye] = [sc.x, sc.y, sc.ye];
            copyX = x.copy();
            x.domain(savedZoom.rescaleX(copyX).domain());
            updateX(x);

            // define animation
            let t = d3.transition()
                .duration(option.duration)
                .ease(d3.easeLinear);

            let uf = focus.selectAll<any, LineChartDataEle>('.line')
                .data(self.data);
            uf.enter().append('path')
                .attr('class', 'line')
                .merge(uf)
                .style('stroke', d => colorSchemes.getColorCode('dname'))
                .style('opacity', 0.6)
                .transition(t)
                .attr('d', d => line(d.timeseries));

            uf.exit().remove();

            if (assessMode) {
                focus.select('.line2')
                    .datum(self.data[0].timeseriesPred)
                    .transition(t)
                    .attr('d', line);

                focus.select('.error')
                    .datum(self.data[0].timeseriesErr)
                    .transition(t)
                    .attr('d', area);
            }

            // clean all original windows
            self.svg.selectAll('.window').remove();
            _.each(self.data, (d, i) => {
                highlightUpdate(d.windows, d.timeseries, x, 'dname', i, d.datarun.id, d.dataset.name);
            });

            xAxis = d3.axisBottom(x);
            yAxis = d3.axisLeft(y);
            axisG.select('.axis--x').call(xAxis);
            axisG.select('.axis--y').call(yAxis.ticks(5, ',f'));

            // setTimeout(resetZoom, option.duration);
        }

        function brushUpdateHandler(msg) {
            x.domain(msg.xDomain);

            self.svg.select('.zoom').call(
                zoom.transform,
                msg.transform
            );
        }

        async function eventUpdateHandler() {
            if (self.data.length > 1) { return; }
            // only execute when there is only one timeseries
            let newWindows = await dataProcessor.loadEventData(
                self.data[0].datarun.id,
                _.map(self.data[0].timeseries, d => d[0]),
                self.option.offset
                // self.data[0].offset
            );
            enableZoom();
            disableEditor();

            self.data[0].windows = newWindows as any;
            self.svg.selectAll('.window').remove();
            _.each(self.data, (d, i) => {
                highlightUpdate(d.windows, d.timeseries, x, 'dname', i, d.datarun.id, d.dataset.name);
            });
        }

        function eventModifyHandler(event: Event) {
            console.log('modify', event);
            if (self.data.length > 1) { return; }
            // only execute when there is only one timeseries
            let data = self.data[0];
            const idx = _.findIndex(data.windows, d => d[3] === event.id);
            const x0 = x(data.timeseries[data.windows[idx][0]][0]);
            const x1 = x(data.timeseries[data.windows[idx][1]][0]);
            disableZoom();
            makeEditable(x0, x1, event);
        }
    }

    private addEventEditor(g, w, h, x) {
        let self = this;
        let modifiedEvent: Event = null;
        let option = self.option;
        let s;

        let fx = x;

        let brush = d3.brushX()
            .extent([[0, 0], [w, h - option.errorHeight]])
            .on('brush end', () => { s = d3.event.selection; });

        let brushG = g.append('g')
            .attr('class', 'brush')
            .call(clickcancel())    // for double click accuracy
            .call(brush)
            .call(brush.move, [0, 0]);

        let enableEditor = () => {
            brushG.select('.overlay').attr('width', w);
            brushG
                .call(brush)
                .call(brush.move, [10, 150]);
        };

        let disableEditor = () => {
            brushG
                .call(brush.move, [0, 0]);
            brushG.select('.overlay').attr('width', 0);
            brushG.on('.brush', null);
        };

        let makeEditable = (x0, x1, event: Event) => {
            modifiedEvent = event;
            brushG.select('.overlay').attr('width', w);
            brushG
                .call(brush)
                .call(brush.move, [x0, x1]);
        };

        let updateX = (newX) => {
            fx = newX;
        };

        brushG.on('dblclick', () => {
            const [start_time, stop_time] = [fx.invert(s[0]), fx.invert(s[1])];
            let data = self.data[0].timeseries;
            // find the closed index
            let i = 0, startIdx = 0, stopIdx = data.length - 1;
            while (i < data.length) {
                if (start_time - data[i][0] < 0) {
                    startIdx = i - 1;
                    break;
                }
                i += 1;
            }
            // i = startIdx
            while (i < data.length) {
                if (stop_time - data[i][0] < 0) {
                    stopIdx = i;
                    break;
                }
                i += 1;
            }

            if (_.isNull(modifiedEvent)) {
                pip.modal.trigger('comment:new', {
                    id: 'new',
                    score: 0,
                    start_time: data[startIdx][0],
                    stop_time: data[stopIdx][0],
                    datarun: self.data[0].datarun.id,
                    dataset: self.data[0].dataset.name,
                    offset: self.option.offset
                });
            } else {
                pip.modal.trigger('comment:start', {
                    id: modifiedEvent.id,
                    score: modifiedEvent.score,
                    start_time: data[startIdx][0],
                    stop_time: data[stopIdx][0],
                    datarun: self.data[0].datarun.id,
                    dataset: self.data[0].dataset.name,
                    offset: self.option.offset
                });
                modifiedEvent = null;
            }
        });

        return {
            editor: brush,
            updateX, enableEditor, disableEditor, makeEditable
        };

        function clickcancel() {
            // we want to a distinguish single/double click
            // details http://bl.ocks.org/couchand/6394506
            let dispatcher = d3.dispatch('click', 'dblclick');
            function cc(selection) {
                let down, tolerance = 5, last, wait = null, args;
                // euclidean distance
                function dist(a, b) {
                    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
                }
                selection.on('mousedown', function () {
                    down = d3.mouse(document.body);
                    last = +new Date();
                    args = arguments;
                });
                selection.on('mouseup', function () {
                    if (dist(down, d3.mouse(document.body)) > tolerance) {
                        return;
                    } else {
                        if (wait) {
                            window.clearTimeout(wait);
                            wait = null;
                            dispatcher.apply('dblclick', this, args);
                        } else {
                            wait = window.setTimeout((function () {
                                return function () {
                                    dispatcher.apply('click', this, args);
                                    wait = null;
                                };
                            })(), 300);
                        }
                    }
                });
            }
            // Copies a variable number of methods from source to target.
            let d3rebind = function (target, source, ...args) {
                let i = 1, n = args.length, method;
                while (++i < n) { target[method = arguments[i]] = d3_rebind(target, source, source[method]); }
                return target;
            };

            // Method is assumed to be a standard D3 getter-setter:
            // If passed with no arguments, gets the value.
            // If passed with arguments, sets the value and returns the target.
            function d3_rebind(target, source, method) {
                return function () {
                    let value = method.apply(source, arguments);
                    return value === source ? target : value;
                };
            }
            return d3rebind(cc, dispatcher, 'on');
        }
    }

    private addZoom(w, h) {
        let self = this;
        let option = self.option;

        let zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [w, h]])
            .extent([[0, 0], [w, h]]);

        let zoomRect;
        zoomRect = self.svg.append('rect')
            .attr('class', 'zoom')
            .attr('transform', `translate(${option.margin.left},${option.margin.top})`)
            .attr('width', w)
            .attr('height', h)
            .call(zoom);

        let enableZoom = () => {
            zoomRect.attr('width', w);
            zoomRect.call(zoom);
        };

        let disableZoom = () => {
            zoomRect.attr('width', 0);
            zoomRect.on('.zoom', null);
        };

        let resetZoom = () => {
            zoomRect  // .transition().duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        };

        return { zoom, enableZoom, disableZoom, resetZoom };
    }

    private addHighlights(h, x, line) {
        let self = this;
        let option = self.option;
        let hz = 25, hzp = 2;

        let scoreColor = (v: number) => {
            if (v === 0) { return '#777'; }
            let level = 0;
            for (let i = 1; i <= 4; i += 1) {
                if (v > i) { level += 1; }
            }
            return colorSchemes.severity5[level];
        };

        let highlightG = self.svg.append<SVGGElement>('g')
            .attr('class', 'highlights')
            .attr('transform', `translate(${option.margin.left},${option.margin.top + option.errorHeight})`);

        _.each(self.data, (d, i) => {
            update(d.windows, d.timeseries, x, 'dname', i, d.datarun.id, d.dataset.name);
        });

        return {
            highlightUpdate: update
        };

        function update(windows, lineData, fx, name, idx, datarun, dataset) {

            let u = highlightG
                .selectAll<SVGAElement, [number, number, number, string]>(`.window-${name}`)
                .data(windows, d => d[3]);

            u.enter().append('g')
                .attr('class', `window window-${name}`)
                .each(function (d, i) {
                    let g = d3.select(this);

                    g.append('path')
                        .attr('class', 'line-highlight');

                    // highlight with background
                    let bgRect = g.append('rect')
                        .attr('class', 'bg-highlight')
                        .attr('y', 0)
                        .attr('height', h)
                        .on('click', () => {
                            pip.modal.trigger('comment:start', {
                                id: d[3],
                                score: d[2],
                                start_time: lineData[d[0]][0],
                                stop_time: lineData[d[1]][0],
                                datarun,
                                dataset,
                                offset: self.option.offset
                            });
                        });

                    bgRect.append('title')
                        .text(`score: ${d[2]}` + '\n' +
                            'from ' + new Date(lineData[d[0]][0]).toString() + '\n' +
                            'to ' + new Date(lineData[d[1]][0]).toString()
                        );

                    // highlight with bars
                    let headerBar = g.append('rect')
                        .attr('class', 'bar-highlight')
                        .attr('y', hz * idx)
                        .attr('height', hz - hzp)
                        .on('click', () => {
                            pip.modal.trigger('comment:start', {
                                id: d[3],
                                score: d[2],
                                start_time: lineData[d[0]][0],
                                stop_time: lineData[d[1]][0],
                                datarun: datarun,
                                dataset: dataset,
                                offset: self.option.offset
                            });
                        });

                    headerBar.append('title')
                        .text(`score: ${d[2]}` + '\n' +
                            'from ' + new Date(lineData[d[0]][0]).toUTCString() + '\n' +
                            'to ' + new Date(lineData[d[1]][0]).toUTCString()
                        );

                    // g.append('text')
                    //     .attr('class', 'text-highlight')
                    //     .attr('y', 11 + 16 * idx)
                    //     .text('');
                })
                .merge(u)
                .each(function (d, i) {
                    let g = d3.select(this);

                    // let hd = _.map(_.slice(lineData, d[0], d[1] + 1), o => {
                    //     return [o[0] + self.option.offset, o[1]];
                    // })
                    let stIdx = d[0], edIdx = d[1];
                    let hd = _.slice(lineData, stIdx, edIdx + 1);
                    g.select('.line-highlight')
                        .attr('d', line(hd));

                    g.select('.bg-highlight')
                        .attr('x', fx(lineData[stIdx][0]))
                        .attr('width', Math.max(fx(lineData[edIdx][0]) - fx(lineData[stIdx][0]), 10));

                    g.select('.bar-highlight')
                        .attr('x', fx(lineData[stIdx][0]))
                        .attr('width', Math.max(fx(lineData[edIdx][0]) - fx(lineData[stIdx][0]), 10))
                        .attr('fill', scoreColor(d[2]));

                    // g.select('text')
                    //     .attr('x', fx(lineData[stIdx][0]))
                    //     .text(() => {
                    //         const tw = Math.max(fx(lineData[edIdx][0]) - fx(lineData[stIdx][0]), 10);
                    //         if (tw > 20) {
                    //             return d3.format('.4f')(d[2]);
                    //         } else {
                    //             return '';
                    //         }
                    //     });
                });

            u.exit().remove();
        }


    }

    private getScale(w, h) {
        let self = this;
        let option = self.option;

        let x, y, ye;
        x = d3.scaleTime().range([0, w]);
        if (option.xDomain) {
            x.domain(option.xDomain);
        } else {
            let mmin = Number.MAX_SAFE_INTEGER,
                mmax = Number.MIN_SAFE_INTEGER;
            _.each(self.data, d => {
                let [mm, ma] = d3.extent(d.timeseries, o => o[0]);
                mmin = mmin > mm ? mm : mmin;
                mmax = mmax < ma ? ma : mmax;
            });
            x.domain([new Date(mmin), new Date(mmax)]);
        }

        y = d3.scaleLinear().range([h - option.errorHeight, 0]);
        if (option.yDomain) {
            y.domain(option.yDomain);
        } else {
            let mmin = Number.MAX_SAFE_INTEGER,
                mmax = Number.MIN_SAFE_INTEGER;
            _.each(self.data, d => {
                let [mm, ma] = d3.extent(d.timeseries, o => o[1]);
                mmin = mmin > mm ? mm : mmin;
                mmax = mmax < ma ? ma : mmax;
            });
            y.domain([mmin, mmax]);
        }

        ye = d3.scaleLinear().range([0, option.errorHeight]);
        ye.domain(d3.extent(self.data[0].timeseriesErr, d => d[1]));
        return { x, y, ye };
    }
}

