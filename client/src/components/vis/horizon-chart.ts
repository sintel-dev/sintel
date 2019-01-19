import * as pip from '../../services/pip-client';
import { TimeSeriesData } from './chart-data.interface';
import * as _ from 'lodash';
import * as d3 from 'd3';


export interface Option {
    // layout
    height?: number;
    width?: number;
    step?: number;   // height for each data series
    margin?: { top: number, right: number, bottom: number, left: number }; // for focus chart
    // horizon-chart config
    bands?: number;
    mode?: string;
    defined?: any;
    colorScheme?: string[];
    // data format
    normalized?: boolean;
}

export class HorizonChart extends pip.Events {

    private svg: d3.Selection<any, any, any, any>;
    private option: Option = {
        // layout
        height: null,
        width: null,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        // horizon-chart config
        step: 200,
        bands: 3,
        mode: 'mirror',
        defined: undefined,
        colorScheme: ['#d62728', '#fff', '#1f77b4'],
        // data format
        normalized: false
    };

    private svgContainer: d3.Selection<HTMLElement, any, any, any>;

    constructor(
        ele: HTMLElement,
        private data: TimeSeriesData,
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
        // self.option.height = data.length * (self.option.step) +
        //     self.option.margin.top + self.option.margin.bottom;
        self.option.height = 1 * (self.option.step) +
            self.option.margin.top + self.option.margin.bottom;

        // append svg to the container
        self.svg = self.svgContainer.append<SVGElement>('svg')
            .attr('width', self.option.width)
            .attr('height', self.option.height);

        self.addCharts();
    }

    private addCharts() {
        let self = this;

        let { step, margin } = self.option;

        // define paint board size
        let [w, h] = [
            self.option.width - margin.left - margin.right,
            self.option.height - margin.top - margin.bottom
        ];

        /* tslint:disable */
        // START horizon.js ////////////////////////////////
        let d3_ = d3 as any;
        let d3_horizonArea = d3.area();
        let d3_horizonId = 0;

        function d3_horizonTransform(bands, h, mode) {
            return mode == 'mirror'
                ? function (d) { return (d < 0 ? 'scale(1,-1)' : '') + 'translate(0,' + (d - bands) * h + ')'; }
                : function (d) { return 'translate(0,' + (d + (d < 0) - bands) * h + ')'; };
                
        }

        function horizon() {
            let bands = 1, // between 1 and 5, typically
                mode = 'mirror', // or offset
                curve = d3.curveLinear, // or basis, monotone, step-before, etc.
                x = d => d[0],
                y = d => d[1],
                w = 960,
                h = 40,
                duration = 0,
                cname = 'clip';

            let color = d3_.scaleLinear()
                .domain([-1, 0, 0, 1])
                .range(['#08519c', '#bdd7e7', '#bae4b3', '#006d2c']);

            // For each small multiple…
            function horizon(g) {
                g.each(function (d, i) {
                    let g = d3.select(this),
                        n = 2 * bands + 1,
                        xMin = Infinity,
                        xMax = -Infinity,
                        yMax = -Infinity,
                        x0, // old x-scale
                        y0, // old y-scale
                        t0,
                        id; // unique id for paths

                    // Compute x- and y-values along with extents.
                    let data = d.map(function (d, i) {
                        let xv = x.call(this, d, i),
                            yv = y.call(this, d, i);
                        if (xv < xMin) { xMin = xv; }
                        if (xv > xMax) { xMax = xv; }
                        if (-yv > yMax) { yMax = -yv; }
                        if (yv > yMax) { yMax = yv; }
                        return [xv, yv];
                    });

                    // Compute the new x- and y-scales, and transform.
                    let x1 = d3.scaleLinear().domain([xMin, xMax]).range([0, w]),
                        y1 = d3.scaleLinear().domain([0, yMax]).range([0, h * bands]),
                        t1 = d3_horizonTransform(bands, h, mode);

                    // Retrieve the old scales, if this is an update.
                    if (this.__chart__) {
                        x0 = this.__chart__.x;
                        y0 = this.__chart__.y;
                        t0 = this.__chart__.t;
                        id = this.__chart__.id;
                    } else {
                        x0 = x1.copy();
                        y0 = y1.copy();
                        t0 = t1;
                        id = ++d3_horizonId;
                    }

                    // We'll use a defs to store the area path and the clip path.
                    let defs = g.selectAll('defs')
                        .data([null]);

                    // The clip path is a simple rect.
                    defs.enter().append('defs').append('clipPath')
                        .attr('id', `${cname}_${id}`)
                        .append('rect')
                        .attr('width', w)
                        .attr('height', h);

                    defs.select('rect').transition()
                        .duration(duration)
                        .attr('width', w)
                        .attr('height', h);

                    // We'll use a container to clip all horizon layers at once.
                    g.selectAll('g')
                        .data([null])
                        .enter().append('g')
                        .attr('clip-path', `url(#${cname}_${id})`);

                    // Instantiate each copy of the path with different transforms.
                    let path = g.select('g').selectAll('path')
                        .data(d3_.range(-1, -bands - 1, -1).concat(d3.range(1, bands + 1)));

                    let d0 = d3_horizonArea
                        .curve(curve)
                        .x(function (d) { return x0(d[0]); })
                        .y0(h * bands)
                        .y1(function (d) { return h * bands - y0(d[1]); })
                        (data);

                    let d1 = d3_horizonArea
                        .x(function (d) { return x1(d[0]); })
                        .y1(function (d) { return h * bands - y1(d[1]); })
                        (data);

                    path.enter().append('path')
                        .style('fill', color)
                        .attr('transform', t0)
                        .attr('d', d0);

                    path.transition()
                        .duration(duration)
                        .style('fill', color)
                        .attr('transform', t1)
                        .attr('d', d1);

                    path.exit().transition()
                        .duration(duration)
                        .attr('transform', t1)
                        .attr('d', d1)
                        .remove();

                    // Stash the new scales.
                    this.__chart__ = { x: x1, y: y1, t: t1, id: id };
                });
                d3.timerFlush();
            }

            horizon.duration = function (x) {
                if (!arguments.length) { return duration; }
                duration = +x;
                return horizon;
            };

            horizon.bands = function (x) {
                if (!arguments.length) { return bands; }
                bands = +x;
                color.domain([-bands, -1, 1, bands]);
                return horizon;
            };

            horizon.mode = function (x) {
                if (!arguments.length) { return mode; }
                mode = x + '';
                return horizon;
            };

            horizon.colors = function (x) {
                if (!arguments.length) { return color.range(); }
                color.range(x);
                return horizon;
            };

            horizon.curve = function (x) {
                if (!arguments.length) { return curve; }
                curve = x;
                return horizon;
            };

            horizon.x = function (z) {
                if (!arguments.length) { return x; }
                x = z;
                return horizon;
            };

            horizon.y = function (z) {
                if (!arguments.length) { return y; }
                y = z;
                return horizon;
            };

            horizon.width = function (x) {
                if (!arguments.length) { return w; }
                w = +x;
                return horizon;
            };

            horizon.height = function (x) {
                if (!arguments.length) { return h; }
                h = +x;
                return horizon;
            };

            horizon.cname = function (n) {
                if (!arguments.length) { return cname; }
                cname = n + '_clip';
                return horizon;
            };

            return horizon;
        }
        // END horizon.js ////////////////////////////////
        /* tslint:enable */

        let chart: any = horizon();
        chart
            .width(w)
            .height(h)
            .bands(1)
            .mode('mirror')
            .curve(d3.curveMonotoneX)
            // .name('nm')
            .cname(self.svgContainer.attr('id'))
            // .curve(d3.curveStep)
            .colors([d3.interpolateOranges(0.6), d3.interpolateOranges(0.3),
                d3.interpolateBlues(0.3), d3.interpolateBlues(0.6)]);
            // .colors([d3.interpolateOranges(0.8), d3.interpolateOranges(0.25),
            //     d3.interpolateBlues(0.25), d3.interpolateBlues(0.8)]);


        let g = self.svg.append('g')
            .attr('transform', `translate(${self.option.margin.left},${self.option.margin.top})`)
            .append('g');

        // Render the chart.

        // normalized
        if (self.option.normalized) {
            self.data = _.cloneDeep(self.data);
            let nm = d3.scaleLinear()
                .domain(d3.extent(self.data, d => d[1])).nice()
                .range([0, 1]);
            _.each(self.data, o => { o[1] = nm(o[1]); });
        }

        let data = _.map(self.data, d => [d[0], d[1]]);
        // let data = self.genData();
        g.data([data]).call(chart);

        d3.select(self.svgContainer.node())
            .select('.horizon-bands-value').text(chart.bands());

        // Enable mode buttons.
        d3.select(self.svgContainer.node())
            .selectAll('.horizon-controls input[name=mode]')
            .on('click', function () {
                g.call(chart.duration(0).mode((this as any).value));
            });

        // Enable bands buttons.
        d3.select(self.svgContainer.node())
            .selectAll('.horizon-bands button').data([-1, 1])
            .on('click', (d) => {
                let n = Math.max(1, chart.bands() + d);
                d3.select(self.svgContainer.node())
                    .select('.horizon-bands-value').text(n);
                // hack
                g.call(chart.duration(0).bands(n + 1));
                g.call(chart.duration(0).bands(n));
                // if (chart.bands() === 1 && n === 2) {
                //     g.call(chart.duration(0).bands(3));
                //     g.call(chart.duration(0).bands(2));
                // } else {
                //     g.call(chart.duration(0).bands(n));
                // }
            });
    }

    /* tslint:disable */
    private genData() {
        // seeded-random.js ////////////////////////////////
        // A seeded random number generators adapted from:
        // http://stackoverflow.com/questions/521295/javascript-random-seeds
        function seededRandom(s) {
            let m_w = 987654321 + s;
            let m_z = 987654321 - s;
            let mask = 0xffffffff;

            return function () {
                m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
                m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;

                let result = ((m_z << 16) + m_w) & mask;
                result /= 4294967296;

                return result + 0.5;
            };
        }
        // END seeded-random.js ////////////////////////////////


        let seed = 1, t = 0;
        function random() {
            let rand = seededRandom(seed);
            let data = [];
            for (let i = -t, variance = 0; i < 1000; i++) {
                variance += (rand() - 0.5) / 10;
                // Pre-roll the random number generator's results to match where they should be at this `t`.
                if (i > 0) {
                    data.push([i, Math.cos((i + t) / 100) + variance]);
                }
            }
            return data;
        }

        return random();
    }
    /* tslint:enable */
}
