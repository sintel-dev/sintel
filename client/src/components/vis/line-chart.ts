import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pip-client';
import { TimeSeriesData } from './chart-data.interface';
import { Smooth } from '../../services/algorithms';
import { colorSchemes } from '../../services/globals';



export interface LineChartOption {
    // layout
    svgHeight?: number;
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    height2?: number;
    width2?: number;
    margin2?: { top: number, right: number, bottom: number, left: number }; // for context chart
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
    windows?: Array<[number, number, number, number]>;  // start_time, stop_time, score, event_id
}

export class LineChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: LineChartOption = {
        // layout
        svgHeight: 300, // used when height is not defined
        height: null,
        width: null,
        margin: { top: 30, right: 20, bottom: 30, left: 60 },
        height2: 80,
        width2: null,
        margin2: { top: 0, right: 20, bottom: 20, left: 60 },
        // animation
        duration: 750,
        delay: 50,
        // functions
        tooltip: false,
        smooth: false,
        context: true,
        windows: null
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: TimeSeriesData,
        private datarun: string,
        private dataset: string,
        option?: LineChartOption
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        let w = ele.getBoundingClientRect().width;
        self.option.width = self.option.width === null ? w : self.option.width;
        if (self.option.height === null) {
            self.option.height = self.option.context === true ?
                (self.option.svgHeight - self.option.height2) : self.option.svgHeight;
        }

        // scroll style inside <div> container
        self.svgContainer
            .classed('scroll-style-0', true)
            .style('overflow-x', 'hidden')
            .style('overflow-y', 'hidden');

        // append svg to <div>
        let totalHeight = self.option.context === true ?
            (self.option.height + self.option.height2) : self.option.height;
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('class', 'line-chart')
            .attr('width', self.option.width)
            .attr('height', totalHeight);

        self.addCharts();
    }

    private addCharts() {
        let self = this;

        // define paint board size
        let [w, h, h2] = [
            self.option.width - self.option.margin.left - self.option.margin.right,
            self.option.height - self.option.margin.top - self.option.margin.bottom,
            self.option.height2 - self.option.margin2.top - self.option.margin2.bottom
        ];

        // define scale
        let x, x2, y, y2;
        if (self.data[0][0] === 0) { // step
            x = d3.scaleLinear().range([0, w]);
            x2 = d3.scaleLinear().range([0, w]);
        } else {    // timestamp
            x = d3.scaleUtc().range([0, w]);
            x2 = d3.scaleUtc().range([0, w]);
        }

        y = d3.scaleLinear().range([h, 0]);
        y2 = d3.scaleLinear().range([h2, 0]);
        x.domain(d3.extent(self.data, d => new Date(d[0])));
        y.domain(d3.extent(self.data, d => d[1]));
        x2.domain(x.domain());
        y2.domain(y.domain());

        // define axis
        let xAxis = d3.axisBottom(x);
        let xAxis2 = d3.axisBottom(x2);
        let yAxis = d3.axisLeft(y);

        // function used to plot line
        let line = d3.line<[number, number]>()
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        // clip content outside the rect
        let clip = self.svg.append('defs').append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('width', w)
            .attr('height', h)
            .attr('x', 0)
            .attr('y', 0);

        let focus = self.svg.append('g')
            .attr('class', 'focus')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
            .attr('clip-path', 'url(#clip)');

        let focusLine = focus.append('path')
            .datum(self.data)
            .attr('class', 'line')
            .attr('d', line);

        let focusAxis = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        focusAxis.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${h})`)
            .call(xAxis);

        focusAxis.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis.tickFormat(d3.format('.6')));

        let { brush, enableBrush, disableBrush } = self.addBrush(focus, w, h, x);
        disableBrush();

        let { zoom, enableZoom, disableZoom } = self.addZoom(w, h);
        zoom.on('zoom', zoomed);
        enableZoom();

        let { hLines, hBackground, hBars, hText } = self.addHighlights(h, x, line);

        let smoothedLine = self.addSmoothedLine(x, y, line);

        // define context chart
        let brushContext = d3.brushX()
            .extent([[0, 0], [w, h2]])
            .on('brush end', brushed);

        let line2 = d3.line<[number, number]>()
            .x(d => x2(d[0]))
            .y(d => y2(d[1]));

        let context = self.svg.append('g')
            .attr('class', 'context')
            .attr('transform', `translate(${self.option.margin2.left},${self.option.margin2.top + self.option.height})`);

        // highlight windows in context chart
        if (self.option.context) {
            context.append('path')
                .datum(self.data)
                .attr('class', 'line')
                .attr('d', line2);

            context.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', `translate(0, ${h2})`)
                .call(xAxis2);

            context.append('g')
                .attr('class', 'brush')
                .call(brushContext)
                .call(brushContext.move, x.range());

            // plot anomalies in contextWindows
            if (self.option.windows !== null) {
                let contextWindows;

                contextWindows = self.svg.selectAll('.context-windows')
                    .data(self.option.windows)
                    .enter()
                    .append('g')
                    .attr('class', 'context-windows')
                    .attr('transform', `translate(${self.option.margin2.left},${self.option.margin2.top + self.option.height})`);

                contextWindows.append('path')
                    .datum(d => {
                        let part = _.slice(self.data, d[0], d[1]);
                        return part;
                    })
                    .attr('class', 'line-highlight')
                    .attr('d', line2);
            }
        }

        self.on('comment', () => {
            disableZoom();
            enableBrush();
        });

        self.on('uncomment', () => {
            enableZoom();
            disableBrush();
        });

        function updateFocusWindows() {
            hLines.attr('d', line);

            hBars
                .attr('x', d => x(self.data[d[0]][0]))
                .attr('width', d => Math.max(x(self.data[d[1]][0]) - x(self.data[d[0]][0]), 10));

            hBackground
                .attr('x', d => x(self.data[d[0]][0]))
                .attr('width', d => Math.max(x(self.data[d[1]][0]) - x(self.data[d[0]][0]), 10));

            hText
                .attr('x', d => x(self.data[d[0]][0]))
                .text(d => {
                    const tw = Math.max(x(self.data[d[1]][0]) - x(self.data[d[0]][0]), 5);
                    if (tw > 20) {
                        return d3.format('.4f')(d[2]);
                    } else {
                        return '';
                    }
                });
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') { return; } // ignore zoom-by-brush
            let t = d3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focusLine.attr('d', line);
            if (self.option.smooth) { smoothedLine.attr('d', line); }
            if (self.option.windows !== null && self.option.windows.length > 0) { updateFocusWindows(); }
            focusAxis.select('.axis--x').call(xAxis);
            context.select('.brush').call(brushContext.move, x.range().map(t.invertX, t));
        }

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') { return; } // ignore brush-by-zoom
            let s = d3.event.selection || x2.range();
            x.domain([x2.invert(s[0]), x2.invert(s[1])]);
            focusLine.attr('d', line);
            if (self.option.smooth) { smoothedLine.attr('d', line); }
            if (self.option.windows !== null && self.option.windows.length > 0) { hLines.attr('d', line); }
            focusAxis.select('.axis--x').call(xAxis);
            self.svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
                .scale(w / (s[1] - s[0]))
                .translate(-s[0], 0));
        }
    }

    private addBrush(g, w, h, x) {
        let self = this;
        // add brush
        let s;

        let brush = d3.brushX()
            .extent([[0, 0], [w, h]])
            .on('brush end', () => { s = d3.event.selection; });

        let brushG = g.append('g')
            .attr('class', 'brush')
            .call(clickcancel())
            .call(brush)
            .call(brush.move, [0, 0]);

        brushG.on('dblclick', () => {
            const [start_time, stop_time] = [x.invert(s[0]), x.invert(s[1])];

            // find the closed index
            let i = 0, startIdx = 0, stopIdx = self.data.length - 1;
            while (i < self.data.length) {
                if (start_time - self.data[i][0] < 0) {
                    startIdx = i - 1;
                    break;
                }
                i += 1;
            }
            // i = startIdx
            while (i < self.data.length) {
                if (stop_time - self.data[i][0] < 0) {
                    stopIdx = i;
                    break;
                }
                i += 1;
            }

            pip.modal.trigger('comment:new', {
                id: 'new',
                score: 0,
                start_time: self.data[startIdx][0],
                stop_time: self.data[stopIdx][0],
                datarun: self.datarun,
                dataset: self.dataset
            });
        });

        let enableBrush = () => {
            brushG.select('.overlay').attr('width', w);
            brushG
                .call(brush)
                .call(brush.move, [0, 0]);
        };

        let disableBrush = () => {
            brushG
                .call(brush.move, [0, 0]);
            brushG.select('.overlay').attr('width', 0);
            brushG.on('.brush', null);
        };

        return { brush, enableBrush, disableBrush };

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

        let zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [w, h]])
            .extent([[0, 0], [w, h]]);

        let zoomRect;
        zoomRect = self.svg.append('g')
            .attr('class', 'zoom')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
            .append('rect')
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

        return { zoom, enableZoom, disableZoom };
    }

    private addHighlights(h, x, line) {
        let self = this;
        let g, hLines, hBackground, hBars, hText;

        let scoreColor = (v: number) => {
            let level = 0;
            for (let i = 1; i <= 4; i += 1) {
                if (v > i) { level += 1; }
            }
            return colorSchemes.severity5[level];
        };

        // plot anomalies in focusWindows
        if (self.option.windows !== null) {

            g = self.svg.selectAll('.focus-windows')
                .data(self.option.windows)
                .enter()
                .append('g')
                .attr('class', 'focus-windows')
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .attr('clip-path', 'url(#clip)');

            hLines = g.append('path')
                .datum(d => _.slice(self.data, d[0], d[1] + 1))
                .attr('class', 'line-highlight')
                .attr('d', d => {
                    let path_ = line(d);
                    return path_;
                });

            // highlight with background
            hBackground = g.append('rect')
                .attr('class', 'bg-highlight')
                .attr('x', d => x(self.data[d[0]][0]))
                .attr('y', 0)
                .attr('width', d => Math.max(x(self.data[d[1]][0]) - x(self.data[d[0]][0]), 10))
                .attr('height', h)
                .on('click', d => {
                    pip.modal.trigger('comment:start', d[3]);
                });

            hBackground.append('title')
                .text(d => {
                    return `score: ${d[2]}` + '\n' +
                        'from ' + new Date(self.data[d[0]][0]).toUTCString() + '\n' +
                        'to ' + new Date(self.data[d[1]][0]).toUTCString();
                });

            // highlight with bars
            hBars = g.append('rect')
                .attr('class', 'bar-highlight')
                .attr('x', d => x(self.data[d[0]][0]))
                .attr('y', 0)
                .attr('width', d => Math.max(x(self.data[d[1]][0]) - x(self.data[d[0]][0]), 5))
                .attr('height', 14)
                .attr('fill', d => scoreColor(d[2]))
                .on('click', d => {
                    pip.modal.trigger('comment:start', {
                        id: d[3],
                        score: d[2],
                        start_time: self.data[d[0]][0],
                        stop_time: self.data[d[1]][0],
                        datarun: self.datarun,
                        dataset: self.dataset
                    });
                });

            hBars.append('title')
                .text(d => {
                    return `score: ${d[2]}` + '\n' +
                        'from ' + new Date(self.data[d[0]][0]).toUTCString() + '\n' +
                        'to ' + new Date(self.data[d[1]][0]).toUTCString();
                });

            // score texts
            hText = g.append('text')
                .attr('x', d => x(self.data[d[0]][0]))
                .attr('y', 10)
                .text('');
        }
        return { hLines, hBackground, hBars, hText };
    }

    private addSmoothedLine(x, y, line) {
        let self = this;
        let ySmoothed = new Smooth().loess(
            _.map(self.data, d => x(d[0])),
            _.map(self.data, d => y(d[1]))
        );

        if (self.option.smooth) {
            return self.svg.append('g')
                .attr('class', 'focus')
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .attr('clip-path', 'url(#clip)')
                .append('path')
                .datum(_.range(self.data.length).map(i => [self.data[i][0], y.invert(ySmoothed[i])]))
                .attr('class', 'line-smooth')
                .attr('d', line);
        } else {
            return null;
        }
    }
}

