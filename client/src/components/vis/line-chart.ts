import * as pip from '../../services/pip-client';
import { TimeSeriesData } from './chart-data.interface';
import { Smooth } from '../../services/algorithms';
import * as _ from 'lodash';
import * as d3 from 'd3';



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
    circle?: boolean;
    circleSize?: number;
    zoom?: boolean;
    context?: boolean;
    smooth?: boolean;
    windows?: Array<[number, number]>;
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
        circle: true,
        circleSize: 2,
        zoom: true,
        context: true,
        smooth: false,
        windows: null
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: TimeSeriesData,
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
            .attr('width', self.option.width)
            .attr('height', totalHeight);

        self.addCharts();
    }

    private addCharts() {
        let self = this;
        // define paint board size

        let w = self.option.width - self.option.margin.left - self.option.margin.right;
        let h = self.option.height - self.option.margin.top - self.option.margin.bottom;
        let h2 = self.option.height2 - self.option.margin2.top - self.option.margin2.bottom;

        // define scale
        let x, x2;
        if (self.data[0][0] === 0) { // step
            x = d3.scaleLinear().range([0, w]);
            x2 = d3.scaleLinear().range([0, w]);
        } else {    // timestamp
            x = d3.scaleTime().range([0, w]);
            x2 = d3.scaleTime().range([0, w]);
        }
        let y = d3.scaleLinear().range([h, 0]);
        let y2 = d3.scaleLinear().range([h2, 0]);
        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y);
        let xAxis2 = d3.axisBottom(x2);

        x.domain(d3.extent(self.data, d => new Date(d[0])));
        y.domain(d3.extent(self.data, d => d[1]));
        x2.domain(x.domain());
        y2.domain(y.domain());

        // plot zero line
        if (y.domain()[0] < 0 && y.domain()[1] > 0) {
            // todo
        }

        // define focus chart

        let zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [w, h]])
            .extent([[0, 0], [w, h]])
            .on('zoom', zoomed);

        let line = d3.line<[number, number]>()
            .x(d => x(d[0]))
            .y(d => y(d[1]));


        let clip = self.svg.append('defs').append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('width', w)
            .attr('height', h)
            .attr('x', 0)
            .attr('y', 0);

        let focusLine = self.svg.append('g')
            .attr('class', 'focus')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
            .attr('clip-path', 'url(#clip)');

        let focusAxis = self.svg.append('g')
            .attr('class', 'focus')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        // highlight windows
        let focusWindows, focusWindowLines;
        if (self.option.windows !== null) {
            focusWindows = self.svg.selectAll('.line-highlight')
                .data(self.option.windows)
                .enter()
                .append('g')
                .attr('class', 'focus')
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .attr('clip-path', 'url(#clip)');
        }

        // define context chart

        let brush = d3.brushX()
            .extent([[0, 0], [w, h2]])
            .on('brush end', brushed);

        let line2 = d3.line<[number, number]>()
            .x(d => x2(d[0]))
            .y(d => y2(d[1]));

        let context = self.svg.append('g')
            .attr('class', 'context')
            .attr('transform', `translate(${self.option.margin2.left},${self.option.margin2.top + self.option.height})`);

        // highlight windows in context chart
        let contextWindows;
        if (self.option.windows !== null) {
            contextWindows = self.svg.selectAll('.line-highlight')
                .data(self.option.windows)
                .enter()
                .append('g')
                .attr('class', 'focus')
                .attr('transform', `translate(${self.option.margin2.left},${self.option.margin2.top + self.option.height})`);
        }

        // test smooth curve
        let smoothedLine;
        let ySmoothed = new Smooth().loess(
            _.map(self.data, d => x(d[0])),
            _.map(self.data, d => y(d[1]))
        );

        if (self.option.smooth) {
            smoothedLine = self.svg.append('g')
                .attr('class', 'focus')
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .attr('clip-path', 'url(#clip)')
                .append('path')
                .datum(_.range(self.data.length).map(i => [self.data[i][0], y.invert(ySmoothed[i])]))
                .attr('class', 'line-smooth')
                .attr('d', line);
        }

        focusAxis.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${h})`)
            .call(xAxis);

        focusAxis.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis.tickFormat(d3.format('.6')));

        focusLine.append('path')
            .datum(self.data)
            .attr('class', 'line')
            .attr('d', line);

        if (self.option.windows !== null) {
            focusWindowLines = focusWindows.append('path')
                .datum(d => {
                    let part = _.slice(self.data, d[0], d[1]);
                    return part;
                })
                .attr('class', 'line-highlight')
                .attr('d', line);
        }

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
                .call(brush)
                .call(brush.move, x.range());

            if (self.option.windows !== null) {
                contextWindows.append('path')
                    .datum(d => {
                        let part = _.slice(self.data, d[0], d[1]);
                        return part;
                    })
                    .attr('class', 'line-highlight')
                    .attr('d', line2);
            }
        }

        if (self.option.zoom) {
            self.svg.append('rect')
                .attr('class', 'zoom')
                .attr('width', w)
                .attr('height', h)
                .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
                .call(zoom);
        }

        function zoomed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') { return; } // ignore zoom-by-brush
            let t = d3.event.transform;
            x.domain(t.rescaleX(x2).domain());
            focusLine.select('.line').attr('d', line);
            if (self.option.smooth) { smoothedLine.attr('d', line); }
            if (self.option.windows !== null && self.option.windows.length > 0) { focusWindowLines.attr('d', line); }
            focusAxis.select('.axis--x').call(xAxis);
            context.select('.brush').call(brush.move, x.range().map(t.invertX, t));
        }

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') { return; } // ignore brush-by-zoom
            let s = d3.event.selection || x2.range();
            x.domain([x2.invert(s[0]), x2.invert(s[1])]);
            focusLine.select('.line').attr('d', line);
            if (self.option.smooth) { smoothedLine.attr('d', line); }
            if (self.option.windows !== null && self.option.windows.length > 0) { focusWindowLines.attr('d', line); }
            focusAxis.select('.axis--x').call(xAxis);
            self.svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
                .scale(w / (s[1] - s[0]))
                .translate(-s[0], 0));
        }
    }
}

