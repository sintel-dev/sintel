import * as _ from 'lodash';
import * as d3 from 'd3';
import * as pip from '../../services/pip-client';
import { BarChartData } from './chart-data.interface';
import dataProcessor from '../../services/data-processor';
import { Smooth } from '../../services/algorithms';
import { colorSchemes } from '../../services/globals';
import { Event } from '../../services/rest-server.interface';


export interface BarChartOption {
    // layout
    svgHeight?: number;
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
}

export class BarChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: BarChartOption = {
        // layout
        svgHeight: 300, // default minimum height
        height: null,
        width: null,
        margin: { top: 30, right: 20, bottom: 70, left: 60 },
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: BarChartData,
        option?: BarChartOption
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        let w = ele.getBoundingClientRect().width;
        self.option.width = self.option.width === null ? w : self.option.width;
        self.option.height = self.option.height === null ? self.option.svgHeight : self.option.height;

        // scroll style inside <div> container
        self.svgContainer
            .classed('scroll-style-0', true)
            .style('overflow-x', 'hidden')
            .style('overflow-y', 'hidden');

        // append svg to <div>
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('class', 'bar-chart')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.plot();
    }

    private plot() {
        let self = this;

        // define paint board size
        let [w, h] = [
            self.option.width - self.option.margin.left - self.option.margin.right,
            self.option.height - self.option.margin.top - self.option.margin.bottom
        ];

        let x = d3.scaleBand()
            .rangeRound([0, w])
            .paddingInner(0.05)
            .domain(_.map(self.data, d => d[0]));

        const yMax = _.maxBy(self.data, d => d[1])[1];
        let y = d3.scaleLinear()
            .range([h, 0])
            .domain([0, yMax]);

        let xAxis = d3.axisBottom(x);

        let yAxis = d3.axisLeft(y)
            .ticks(5);

        let chart = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`);

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis)
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Count");
      
        console.log(self.data);
        chart.selectAll(".bar")
            .data(self.data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return h - y(d[1]); });
    }
}

