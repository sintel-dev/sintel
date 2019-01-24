import * as pip from '../../services/pip-client';
import { PeriodData } from './chart-data.interface';
import * as _ from 'lodash';
import * as d3 from 'd3';

export interface Data extends PeriodData {
    col: number;
    row: number;
}

export interface Option {
    // layout
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    padding?: number;
    nCol?: number;
    // radial-area-chart
    cw?: number;
    ch?: number;
    size?: number;
}

export class RadialAreaChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: Option = {
        height: null,
        width: null,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        padding: 4,
        nCol: null,
        cw: 120,
        ch: 120,
        size: 140
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: PeriodData[],
        option?: Option
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        // if not specify the width, set it as the container's width
        self.option.width = self.option.width === null ?
            ele.getBoundingClientRect().width : self.option.width;

        // if not specify the height, set it as the default height
        let { ch, width, padding, size, margin } = self.option;
        self.option.nCol = Math.floor((width - padding) / size);
        self.option.height = ch * Math.ceil(data.length / self.option.nCol)
            + padding + margin.top + margin.bottom;

        // append svg to the container
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.addCharts();
    }

    private addCharts() {
        let self = this;

        let { margin, padding, cw, ch, nCol } = self.option;
        // define paint board size
        let [w, h] = [
            self.option.width - margin.left - margin.right,
            self.option.height - margin.top - margin.bottom
        ];

        let x = d3.scaleLinear().range([padding / 2, cw - padding / 2]);

        let y = d3.scaleLinear()
            .range([ch - padding / 2, padding / 2]);

        let outerRadius = ch / 2 - padding / 2,
            innerRadius = 12;

        let angle = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        let radius = d3.scaleLinear()
            .range([innerRadius, outerRadius]);

        let area = d3.areaRadial<number>()
            .angle((d, i) => angle(i))
            .innerRadius(d => radius(0))
            .outerRadius(d => radius(d))
            .curve(d3.curveCardinalClosed);

        let area0 = d3.areaRadial<number>()
            .angle((d, i) => angle(i))
            .innerRadius(d => radius(0))
            .outerRadius(d => radius(0))
            .curve(d3.curveCardinalClosed);

        let data = self.data as Data[];
        // adding row can col for data[i]
        _.each(data, (d, i) => {
            d.col = i % nCol;
            d.row = Math.floor(i / nCol);
        });

        let g = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},
                ${self.option.margin.top})`);

        let cell = g.selectAll('.feature-cell')
            .data(data)
            .enter().append('g')
            .attr('class', 'feature-cell')
            .attr('transform', function (d) {
                return 'translate(' + (d.col * cw + cw / 2) + ',' + (d.row * ch + ch / 2) + ')';
            })
            .each(featurePlot);

        function featurePlot(o: Data) {
            let _cell = d3.select(this);

            // Extend the domain slightly to match the range of [0, 2π].
            angle.domain([0, o.bins.length - 0.88]);
            radius.domain([0, 1]);

            let path = _cell.append('path')
                .datum(o.bins)
                .attr('class', 'feature-area')
                .style('fill', function () {
                    return '#637bb6';
                })
                .style('stroke', function () {
                    return '#637bb6';
                })
                .attr('d', area0)
                .on('click', (d) => {
                    // if (o.children) {
                        self.trigger('select', o);
                    // }
                });

            path.transition()
                .duration(750)
                .attr('d', area);

            path.append('title')
                .text(o.name);

            let circle = _cell.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', innerRadius)
                .style('fill', 'white')
                .style('stroke-width', 0)
                .on('click', (d) => {
                    // if (o.children) {
                        self.trigger('select', o);
                    // }
                })
                .append('title')
                .text(o.name);
        }

        self.on('update', (o: Data[]) => {
            console.log('radial-area-chart: update', o);
            _.each(o, (d, i) => {
                d.col = i % nCol;
                d.row = Math.floor(i / nCol);
            });


            g.selectAll('.feature-cell').remove();
            let gd = g.selectAll('.feature-cell').data(o);

            gd.enter().append('g')
                .merge(gd as any)
                .attr('class', 'feature-cell')
                .attr('transform', function (d) {
                    return 'translate(' + (d.col * cw + cw / 2) + ',' + (d.row * ch + ch / 2) + ')';
                })
                .each(featurePlot);

            gd.exit().remove();
        });
    }
}

