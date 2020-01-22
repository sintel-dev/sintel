import * as d3 from 'd3';
import { FocusChartConstants } from './Constants';

const {
    OFFSET_WIDTH,
    OFFSET_HEIGHT,
    MIN_VALUE,
    MAX_VALUE,
    TRANSLATE_TOP,
    TRANSLATE_LEFT,
    DRAW_EVENTS_TIMEOUT,
} = FocusChartConstants;

class FocusChart {
    constructor(chartNodeID, width, height, datarun) {
        this.width = width;
        this.height = height;
        this.datarun = datarun;
        const { xCoord, yCoord } = this.getScale();

        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.chart = d3.select(`#${chartNodeID}`);
        this.transition = d3.transition().duration(DRAW_EVENTS_TIMEOUT);
    }

    getScale() {
        const { width, height, datarun } = this;
        const { timeSeries } = datarun;

        const [minTX, maxTX] = d3.extent(timeSeries, time => time[0]);
        const [minTY, maxTY] = d3.extent(timeSeries, time => time[1]);

        const xCoord = d3.scaleTime().range([0, width - OFFSET_WIDTH]);
        const yCoord = d3.scaleLinear().range([height - OFFSET_HEIGHT, 0]);

        const minX = Math.min(MIN_VALUE, minTX);
        const maxX = Math.max(MAX_VALUE, maxTX);

        const minY = Math.min(MIN_VALUE, minTY);
        const maxY = Math.max(MAX_VALUE, maxTY);

        xCoord.domain([minX, maxX]);
        yCoord.domain([minY, maxY]);

        return { xCoord, yCoord };
    }

    drawAxis() {
        const { xCoord, yCoord, width, height, transition, chart } = this;
        const xAxis = d3.axisBottom(xCoord);
        const yAxis = d3.axisLeft(yCoord);
        const isChartReady = document.querySelector('.chart-axis');

        chart.attr('width', width).attr('height', height);

        const createAxis = () => {
            const axisG = chart
                .append('g')
                .attr('class', 'chart-axis')
                .attr('transform', `translate(${TRANSLATE_LEFT}, 0)`);

            axisG
                .append('g')
                .attr('transform', `translate(0, ${height - 22})`)
                .attr('class', 'axis axis--x')
                .call(xAxis);

            axisG
                .append('g')
                .attr('class', 'axis axis--y')
                .attr('transform', `translate(0, ${TRANSLATE_TOP})`)
                .call(yAxis.ticks(5, ',f'));
        };

        const updateAxis = () => {
            chart
                .select('.axis.axis--x')
                .attr('transform', `translate(0, ${height - 22})`)
                .transition(transition)
                .call(xAxis);

            chart
                .select('.axis.axis--y')
                .attr('transform', `translate(0, ${TRANSLATE_TOP})`)
                .transition(transition)
                .call(yAxis.ticks(5, ',f'));
        };

        if (isChartReady) {
            updateAxis();
        } else {
            createAxis();
        }
    }

    drawData() {
        const { datarun, chart, xCoord, yCoord, transition, width, height } = this;
        const isChartDataReady = document.querySelector('.chart-data');

        const line = d3
            .line()
            .x(d => xCoord(d[0]))
            .y(d => yCoord(d[1]));

        const createChart = () => {
            const chartLine = chart
                .append('g')
                .attr('class', 'chart-data')
                .attr('width', width)
                .attr('height', height)
                .attr('transform', `translate(${TRANSLATE_LEFT}, ${TRANSLATE_TOP})`);

            chartLine
                .append('path')
                .attr('class', 'chart-waves')
                .transition(transition)
                .attr('d', () => line(datarun.timeSeries));
        };

        const updateChart = () => {
            d3.select('.chart-waves')
                .transition(transition)
                .attr('d', () => line(datarun.timeSeries));
        };

        if (isChartDataReady === null) {
            createChart();
        } else {
            updateChart();
        }
    }

    drawEvents() {
        const { chart, xCoord, yCoord, datarun, transition } = this;
        const { timeSeries, eventWindows } = datarun;

        const line = d3
            .line()
            .x(d => xCoord(d[0]))
            .y(d => yCoord(d[1]));

        chart.selectAll('.line-highlight').remove();
        const drawHlEvent = event => {
            chart
                .append('g')
                .attr('class', 'line-highlight ')
                .attr('transform', `translate(${TRANSLATE_LEFT}, ${TRANSLATE_TOP})`)
                .append('path')
                .transition(transition)
                .attr('d', () => line(event));
        };

        setTimeout(() => {
            eventWindows.forEach(event => drawHlEvent(timeSeries.slice(event[0], event[1] + 1)));
        }, DRAW_EVENTS_TIMEOUT);
    }

    Draw() {
        this.drawData();
        this.drawEvents();
        this.drawAxis();
    }
}

export default FocusChart;
