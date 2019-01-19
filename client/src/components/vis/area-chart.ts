import * as pip from '../../services/pip-client';
import { TimeSeriesData } from './chart-data.interface';
import * as _ from 'lodash';
import * as d3 from 'd3';



export interface ChartOption {
    // layout
    svgHeight?: number;
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    normalized?: boolean;
}

export class AreaChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: ChartOption = {
        // layout
        svgHeight: 300, // default height: used when height is not defined
        height: null,
        width: null,
        margin: { top: 20, right: 20, bottom: 30, left: 50 },
        normalized: false
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: TimeSeriesData,
        option?: ChartOption
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        // if not specify the width, set it as the container's width
        self.option.width = self.option.width === null ?
            ele.getBoundingClientRect().width : self.option.width;

        // if not specify the height, set it as the default height
        self.option.height = self.option.height === null ?
            self.option.svgHeight : self.option.height;

        // append svg to the container
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.addCharts();
    }

    private addCharts() {
        let self = this;

        // define paint board size
        let [w, h] = [
            self.option.width - self.option.margin.left - self.option.margin.right,
            self.option.height - self.option.margin.top - self.option.margin.bottom
        ];

        // normalized
        if (self.option.normalized) {
            self.data = _.cloneDeep(self.data);
            let nm = d3.scaleLinear()
                .domain(d3.extent(self.data, d => d[1])).nice()
                .range([0, 1]);
            _.each(self.data, o => { o[1] = nm(o[1]); });
        }

        // define scale
        let x = self.data[0][0] === 0 ?  // timestep or timestamp
            d3.scaleLinear().range([0, w]) : d3.scaleTime().range([0, w]);
        let y = d3.scaleLinear()
            .range([h, 0]);

        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y).tickFormat(d3.format('.6'));


        x.domain(d3.extent(self.data, d => new Date(d[0])));
        y.domain(d3.extent(self.data, d => d[1])).nice();
        // y.domain([0, d3.max(self.data, d => d[1])]).nice();
        // y.domain(d3.extent(self.data, d => d.y));


        // plot area chart
        let areaChart = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        let area = d3.area<[number, number]>()
            .x(d => x(d[0]))
            .y0(y(0))
            .y1(d => y(d[1]));

        areaChart.append('path')
            .datum(self.data)
            .attr('fill', '#637bb6')
            .attr('d', area);

        areaChart.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${h})`)
            .call(xAxis);

        areaChart.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis);
    }
}

