import * as pip from '../../services/pip-client';
import { PeriodChartDataEle, LineChartDataEleInfoEle } from './data.interface';
import { colorSchemes } from '../../services/globals';
import * as _ from 'lodash';
import * as d3 from 'd3';

export interface Option {
    // svg layout
    height?: number;
    width?: number;
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    // animation
    duration?: number;
    delay?: number;
    // glyph parameters
    radius?: number;
    padding?: number;
    nCol?: number;  // number of glyphs each row
    size?: number;
    minSize?: number;
    missing?: boolean;   // whether highlight missing data
}

export class PeriodChart extends pip.Events {

    public option: Option = {
        // svg layout
        height: null,
        width: null,
        margin: { top: 30, right: 10, bottom: 5, left: 30 },
        // animation
        duration: 750,
        delay: 50,
        // glyph parameters
        nCol: null,
        padding: 8,
        size: 100,      // width = height = size (include padding)
        minSize: 12,
        missing: false
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private defaultHeight = 300;

    constructor(
        ele: HTMLElement,
        private data: PeriodChartDataEle[],
        option?: Option
    ) {
        super();
        let self = this;
        _.extend(self.option, option);
        self.svgContainer = d3.select<HTMLElement, any>(ele);

        self.option.width = self.option.width === null ?
            $(ele).innerWidth() : self.option.width;

        let { nCol, width, padding, margin } = self.option;
        if (nCol !== null) {
            self.option.size = Math.floor((width - margin.left - margin.right)
                / nCol);
        }
        self.option.nCol = Math.floor((width - margin.left - margin.right)
            / (self.option.size));

        if (self.option.height === null) {
            self.option.height = self.option.size
                * Math.ceil(data[0].info.length / self.option.nCol)
                + margin.top + margin.bottom;
        } else {
            self.option.height = self.defaultHeight;
        }

        // append svg to the container
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('class', 'multi-period-chart')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        let radialGradient = self.svg.append('defs')
            .append('radialGradient')
            .attr('id', 'blueGradient');


        radialGradient.append('stop')
            .attr('offset', '30%')
            .attr('stop-color', '#B2C1FF' );

        radialGradient.append('stop')
            .attr('offset', '90%')
            .attr('stop-color', 'rgba(216,216,216,0)' )


        self.plot();
    }

    private plot() {
        let self = this;
        const option = self.option;

        let { width, height, margin, padding, size, nCol } = self.option;

        const [w, h] = [
            width - margin.left - margin.right,
            height - margin.top - margin.bottom,
        ];

        let outerRadius = size / 2 - padding / 2,
            // innerRadius = option.minSize;
            innerRadius = Math.max(outerRadius / 6, option.minSize);

        // layout setting
        _.each(self.data, d => {
            _.each(d.info, (dd, i) => {
                dd.col = i % nCol;
                dd.row = Math.floor(i / nCol);
            });
        });

        // define circular axis scale for each glyph
        let { angle, radius, area, area0 } = self.getScale(innerRadius, outerRadius);

        // zoom
        let {zoom, zoomRect} = self.addZoom(w, h);
        zoom.on('zoom', zoomHandler);
        let zoomG = self.svg.append('g');

        let g = zoomG.append('g')
            .attr('transform', `translate(${option.margin.left},${option.margin.top})`);

        self.normalize();
        // add glyphs
        let { featurePlot } = self.addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius);

        // add labels
        let { label1, label2 } = self.addLabels(g, size);

        // ************  events  ************
        self.on('update', update);

        // ************  event handlers  ************
        function update(o: PeriodChartDataEle[]) {
            if (o !== null) {
                self.data = o;
            } else {
                o = self.data;
            }
            self.normalize();

            if (o[0].info[0].level === 'month') {
                label1.text(o[0].info[0].parent.name);
            }

            if (o[0].info[0].level === 'day') {
                label1.text(o[0].info[0].parent.name);
                label2.text(o[0].info[0].parent.parent.name);

                let [mm, yy] = [
                    o[0].info[0].parent.name,
                    o[0].info[0].parent.parent.name
                ];
                let offset = new Date(`${mm} 1, ${yy} 00:00:00`).getDay();
                let newHeight = size
                                * Math.ceil((o[0].info.length + offset) / nCol)
                                + margin.top + margin.bottom;

                self.svg.attr('height', newHeight);
                let nh = newHeight - margin.top - margin.bottom;
                zoom.translateExtent([[0, 0], [w, nh]])
                    .extent([[0, 0], [w, nh]]);

                zoomRect.attr('height', nh)
                    .call(zoom);

                _.each(self.data, d => {
                    _.each(d.info, (dd, i) => {
                        let dt = new Date(`${mm} ${i + 1}, ${yy} 00:00:00`);
                        dd.col = (i + offset) % nCol;
                        dd.row = Math.floor((i + offset) / nCol);
                        dd.name += `[${dt.toString().substring(0, 3)}]`;
                    });
                });
            } else {
                _.each(self.data, d => {
                    _.each(d.info, (dd, i) => {
                        dd.col = i % nCol;
                        dd.row = Math.floor(i / nCol);
                    });
                });
            }

            g.selectAll(`.feature-cell`).remove();
            _.each(self.data, (data, i) => {
                let _g = g.selectAll(`.feature-cell-${data.name}`).data(data.info);
                _g.enter().append('g')
                    .merge(_g as any)
                    .attr('class', `feature-cell feature-cell-${data.name}`)
                    .attr('transform', d => `translate(${d.col * size + size / 2}
                        ,${d.row * size + size / 2})`)
                    .each(function(d, count) {
                        featurePlot(d3.select(this), d, data.name, count);
                    });
                _g.exit().remove();
            });
        }

        function zoomHandler() {
            zoomG.attr('transform', d3.event.transform);
        }
    }

    private normalize() {
        let self = this;
        let mmin = Number.MAX_SAFE_INTEGER;
        let mmax = Number.MIN_SAFE_INTEGER;
        let clones = _.cloneDeep(self.data);
        _.each(clones, d => {
            for (let i = 0; i < d.info.length; i++) {
                for (let j = 0; j < d.info[i].bins.length; j++) {
                    if (d.info[i].counts[j] === 0) { continue; }
                    mmin = mmin > d.info[i].bins[j] ? d.info[i].bins[j] : mmin;
                    mmax = mmax < d.info[i].bins[j] ? d.info[i].bins[j] : mmax;
                }
            }
        });

        let nm = d3.scaleLinear()
                .domain([mmin, mmax])
                .range([0, 1]);

        _.each(clones, d => {
            for (let i = 0; i < d.info.length; i++) {
                for (let j = 0; j < d.info[i].bins.length; j++) {
                    if (d.info[i].counts[j] === 0) { continue; }
                    d.info[i].bins[j] = nm(d.info[i].bins[j]);
                }
            }
        });
        self.data = clones;
    }

    private addZoom(w, h) {
        let self = this;
        let option = self.option;

        let zoom = d3.zoom()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [w, h]])
            .extent([[0, 0], [w, h]]);

        let zoomRect;
        zoomRect = self.svg.append('rect')
            .attr('class', 'zoom')
            .attr('transform', `translate(${option.margin.left},${option.margin.top})`)
            .attr('width', w)
            .attr('height', h)
            .call(zoom);

        return {zoom, zoomRect};
    }

    private getScale(ir, or) {
        let angle = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        let radius = d3.scaleLinear()
            .range([ir, or])
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

        return { angle, radius, area, area0 };
    }

    private addLabels(g, size) {
        let self = this;
        if (self.data[0].info[0].level === 'day') {
            let names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            g.append('g')
                .attr('class', 'weekdays')
                .selectAll('.weekday-text')
                .data(_.range(7))
                .enter()
                .append('text')
                .attr('class', 'radial-text-md weekday-text')
                .attr('x', d => d * size + size / 2)
                .attr('y', -7)
                .text(d => names[d]);
        }

        let label1 = self.svg.append('text')
            .attr('class', 'radial-text-md')
            .attr('x', 1)
            .attr('y', 14)
            .text('');

        let label2 = self.svg.append('text')
            .attr('class', 'radial-text-md')
            .attr('x', 1)
            .attr('y', 30)
            .text('');

        return {label1, label2};
    }

    private addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius) {
        let self = this;
        let option = self.option;
        // plot data on each station
        _.each(self.data, (data, count) => {
            let cell = g
                .selectAll(`.feature-cell-${data.name}`)
                .data(data.info)
                .enter().append('g')
                .attr('class', `feature-cell feature-cell-${data.name}`)
                .attr('transform', d => `translate(${d.col * size + size / 2}
                    ,${d.row * size + size / 2})`)
                .each(function(d, count) {
                    featurePlot(d3.select(this), d, data.name, count);
                });

        });


        return {featurePlot};

        function featurePlot(_cell, o: LineChartDataEleInfoEle, stationName: string, count: number = 0) {


            // Extend the domain slightly to match the range of [0, 2π].
            angle.domain([0, o.bins.length - 0.05]);
            // angle.domain([0, o.bins.length - 0.88]);

            // notice all the data has been normalized to [0, 1]
            radius.domain([0, 1]);

            let path = _cell.append('path')
                .datum(o.bins)
                .attr('class', 'feature-area radial-cursor')
                .attr('id', `path_${count}`)
                // .attr('stroke', function () {
                //     return colorSchemes.getColorCode(stationName);
                // })
                // .attr('stroke-width', 1)
                // .attr('stroke-opacity', 0.7)
                // .attr('fill', function () {
                //     return colorSchemes.getColorCode(stationName);
                // })
                // .attr('fill-opacity', 0.3)
                .attr('d', area0)
                .on('click', (d) => {
                    if (o.children) {
                        self.trigger('select', o);
                    }
                });

            let clipPath = _cell.append('clipPath');
            clipPath
                .attr('id', `clip_${count}`)
                .append('use')
                .attr('xlink:href', `#path_${count}`)

            path.transition()
                .duration(option.duration)
                .attr('d', area);

            path.append('title')
                .text(o.name);


            _cell.append('circle')
                .attr('clip-path', `url(#clip_${count})`)
                .attr('class', 'wrapper')
                .attr('r', 90)
                .attr('fill', 'url(#blueGradient)')
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
                    .attr('class', 'radial-text-md')
                    .attr('x', -7)
                    .attr('y', outerRadius)
                    .text(o.name);
            }

            if (option.missing) {
                let missedData = [];
                let area00 = d3.areaRadial<number>()
                    .angle((d, i) => angle(d))
                    .innerRadius(d => radius(0))
                    .outerRadius(d => radius(0))
                    .curve(d3.curveCardinal);
                _.each(o.bins, (b, bi) => {
                    if (o.counts[bi] === 0) {
                        missedData.push(bi);
                        _cell.append('path')
                            .datum(missedData)
                            .attr('class', 'missed-bins')
                            .attr('d', area00([bi, bi + 1]))
                            .attr('fill', '#b70e13')
                            .attr('stroke', '#b70e13')
                            .attr('stroke-width', 2)
                            .attr('stroke-opacity', 0.7);
                    }
                });
            }
        }
    }
}

