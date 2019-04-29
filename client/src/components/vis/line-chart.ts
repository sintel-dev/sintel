import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pip-client';
import { TimeSeriesData } from './chart-data.interface';
import dataProcessor from '../../services/data-processor';
import { Smooth } from '../../services/algorithms';
import { colorSchemes } from '../../services/globals';
import { Event } from '../../services/rest-server.interface';


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
    windows?: Array<[number, number, number, string]>;  // start_time, stop_time, score, event_id
    offset?: number;
    xAxis?: boolean;
}

export class LineChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: LineChartOption = {
        // layout
        svgHeight: 300, // used when height is not defined
        height: null,
        width: null,
        margin: { top: 5, right: 20, bottom: 5, left: 80 },
        height2: 80,
        width2: null,
        margin2: { top: 0, right: 0, bottom: 0, left: 0 },
        // animation
        duration: 750,
        delay: 50,
        // functions
        tooltip: false,
        smooth: false,
        windows: null,
        context: false,
        xAxis: false,
        offset: 0
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
        let [w, h] = [
            self.option.width - self.option.margin.left - self.option.margin.right,
            self.option.height - self.option.margin.top - self.option.margin.bottom,
        ];

        // define scale
        let x, y;
        if (self.data[0][0] === 0) { // step
            x = d3.scaleLinear().range([0, w]);
        } else {    // timestamp
            x = d3.scaleUtc().range([0, w]);
        }

        y = d3.scaleLinear().range([h, 0]);
        x.domain(d3.extent(self.data, d => new Date(d[0])));
        y.domain(d3.extent(self.data, d => d[1]));

        // define axis
        let xAxis = d3.axisBottom(x);
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
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        focus.append('text')
            .attr('class', 'text-sm')
            .attr('text-anchor', 'end')
            .attr('x', -10)
            .attr('y', 25)
            .text(self.dataset);

        let focusLine = focus.append('path')
            .datum(self.data)
            .attr('class', 'line')
            .attr('d', line);

        let focusAxis = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        if (self.option.xAxis) {
            focusAxis.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${h})`)
            .call(xAxis);
        }

        // focusAxis.append('g')
        //     .attr('class', 'axis axis--y')
        //     .call(yAxis.ticks(5, ",f"));
            // .call(yAxis.tickFormat(d3.format('.6')));


        let hUpdate = self.addHighlights(h, x, line);

        let smoothedLine = self.addSmoothedLine(x, y, line);
    }


    private addHighlights(h, x, line) {
        let self = this;

        let scoreColor = (v: number) => {
            if (v === 0) { return '#777'; }
            let level = 0;
            for (let i = 1; i <= 4; i += 1) {
                if (v > i) { level += 1; }
            }
            return colorSchemes.severity5[level];
        };

        function update(windows) {
            let u = self.svg
                .selectAll<SVGAElement, [number, number, number, number]>('.focus-windows')
                .data(windows, o => o[3]);

            u.enter().append('g')
                .attr('class', 'focus-windows')
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .attr('clip-path', 'url(#clip)')
                .each(function (d, i) {
                    let g = d3.select(this);

                    let hLine = g.append('path')
                        .attr('class', 'line-highlight')
                        .attr('d', line(_.slice(self.data, d[0], d[1] + 1)));

                    // highlight with background
                    // let hBackground = g.append('rect')
                    //     .attr('class', 'bg-highlight')
                    //     .attr('x', x(self.data[d[0]][0]))
                    //     .attr('y', 0)
                    //     .attr('width', x(self.data[d[1]][0]) - x(self.data[d[0]][0]))
                    //     .attr('height', h)
                    //     .on('click', () => {
                    //         pip.modal.trigger('comment:start', {
                    //             id: d[3],
                    //             score: d[2],
                    //             start_time: self.data[d[0]][0],
                    //             stop_time: self.data[d[1]][0],
                    //             datarun: self.datarun,
                    //             dataset: self.dataset,
                    //             offset: self.option.offset
                    //         });
                    //     });


                })
                .merge(u)
                .each(function (d, i) {
                    let g = d3.select(this);

                    g.select('.line-highlight')
                        .attr('d', line(_.slice(self.data, d[0], d[1] + 1)));

                    // g.select('.bg-highlight')
                    //     .attr('x', x(self.data[d[0]][0]))
                    //     .attr('width', x(self.data[d[1]][0]) - x(self.data[d[0]][0]));

                });

            u.exit().remove();
        }

        // plot anomalies in focusWindows
        if (self.option.windows !== null) {
            update(self.option.windows);
        }

        return update;
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

