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
        margin: { top: 20, right: 10, bottom: 5, left: 10 },
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
        let { nCol, width, padding, margin } = self.option;
        if (nCol !== null) {
            [self.option.cw, self.option.ch, self.option.size] = [
                Math.floor((width - padding - margin.left - margin.right)
                            / nCol) - 10,
                Math.floor((width - padding - margin.left - margin.right)
                            / nCol) - 10,
                Math.floor((width - padding - margin.left - margin.right)
                            / nCol)
            ];
        }
        let { cw, ch, size } = self.option;
        console.log(cw, ch, size);
        self.option.nCol = Math.floor((width - padding - margin.left
            - margin.right) / size);
        self.option.height = ch * Math.ceil(data.length / self.option.nCol)
            + padding + margin.top + margin.bottom;
        // if (data[0].level === 'day') { self.option.height += ch; }

        // append svg to the container
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.addCharts();
    }

    private addCharts() {
        let self = this;

        let { width, height, margin, padding, cw, ch, nCol } = self.option;
        // define paint board size
        let [w, h] = [
            self.option.width - margin.left - margin.right,
            self.option.height - margin.top - margin.bottom
        ];

        // let x = d3.scaleLinear().range([padding / 2, cw - padding / 2]);

        // let y = d3.scaleLinear()
        //     .range([ch - padding / 2, padding / 2]);

        let outerRadius = ch / 2 - padding / 2,
            innerRadius = 12;

        let angle = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        let radius = d3.scaleLinear()
            .range([innerRadius, outerRadius])
            .clamp(true);

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

        let zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on('zoom', zoomed);

        let zoomRect = self.svg.append('rect')
            .attr('class', 'radial-zoom')
            .attr('width', width)
            .attr('height', height)
            .call(zoom);

        let zoomg = self.svg.append('g');

        function zoomed() {
            zoomg.attr('transform', d3.event.transform);
        }

        let g = zoomg.append('g')
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

        if (data[0].level === 'day') {
            console.log('plot weekdays');
            // add weekdays text on the top
            let names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            g.append('g')
             .attr('class', 'weekdays')
             .selectAll('.weekday-text')
             .data(_.range(7))
             .enter()
             .append('text')
             .attr('class', 'radial-text-md weekday-text')
             .attr('x', d => d * cw + cw / 2)
             .attr('y', -7)
             .text(d => names[d]);
        }


        function featurePlot(o: Data) {
            let _cell = d3.select(this);

            // Extend the domain slightly to match the range of [0, 2π].
            angle.domain([0, o.bins.length - 0.88]);
            radius.domain([0, 1]);

            let path = _cell.append('path')
                .datum(o.bins)
                .attr('class', 'feature-area radial-cursor')
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

            _cell.append('circle')
                .attr('class', 'radial-cursor')
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

            if (o.level !== 'day') {
                _cell.append('text')
                .attr('class', 'radial-text-sm')
                .attr('x', -7)
                .attr('y', outerRadius)
                .text(o.name);
            }

            let missedData = [];
            _.each(o.bins, (b, bi) => {
                if (b === -1) {
                    missedData.push(bi);   // [idx, value]
                }
            });
           _cell.selectAll('.missed-bins')
                .data(missedData)
                .enter()
                .append('circle')
                .attr('class', 'missed-bins')
                .attr('cx', bi => Math.sin(angle(bi)) * innerRadius)
                .attr('cy', bi => -Math.cos(angle(bi)) * innerRadius)
                .attr('r', 1)
                .attr('fill', 'red')
                .attr('fill-opacity', 0.6)
                .style('stroke-width', 0);
        }

        self.on('update', (o: Data[]) => {
            // calendar layout if in day level
            console.log('update', o[0].level);
            if (o[0].level === 'day') {
                let [m, y] = [o[0].parent.name, o[0].parent.parent.name];
                let offset = new Date(`${m} 1, ${y} 00:00:00`).getDay();
                let newHeight = ch * Math.ceil((data.length + offset) / nCol)
                        + padding + margin.top + margin.bottom;

                self.svg.attr('height', newHeight);
                zoom.translateExtent([[0, 0], [width, newHeight]])
                    .extent([[0, 0], [width, newHeight]]);

                zoomRect.attr('height', newHeight)
                    .call(zoom);

                _.each(o, (d, i) => {
                    let dt = new Date(`${m} ${i + 1}, ${y} 00:00:00`);
                    d.col = (i + offset) % nCol;
                    d.row = Math.floor( (i + offset) / nCol);
                    d.name += `[${dt.toString().substring(0, 3)}]`;
                });
            } else {
                _.each(o, (d, i) => {
                    d.col = i % nCol;
                    d.row = Math.floor(i / nCol);
                });
            }

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

