import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class DrawChart extends Component {
    componentDidMount() {
        this.drawChart();
    }

    getScale(w, h) {
      let minValue = Number.MAX_SAFE_INTEGER;
      let maxValue = Number.MIN_SAFE_INTEGER;
      const { timeSeries } = this.props.dataRun;
      const timeSeriesMin = timeSeries[0][0];
      const timeSeriesMax = timeSeries[timeSeries.length - 1][0];
      const x = d3.scaleTime().range([0, w]);
      const y = d3.scaleLinear().range([h, 0]);

      minValue = minValue > timeSeriesMin ? timeSeriesMin : minValue;
      maxValue = maxValue < timeSeriesMax ? timeSeriesMax : maxValue;
      x.domain([minValue, maxValue]);
      y.domain([-1, 1]);

      return { x, y };
    }

    drawChart() {
      const { timeSeries, eventWindows } = this.props.dataRun;
      const stroke = 'rgb(36, 116, 241, 0.7)';
      const eventStroke = '#FFCD00';
      const strokeWidth = 0.7;

      const h = 50;
      const { x, y } = this.getScale(900, h);
      const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

      const highlithedEvents = () =>
        eventWindows.map(event => timeSeries.slice(event[0], event[1] + 2));

      const svg = d3.select(`._${this.props.dataRun.id}`)
        .append('svg')
        .attr('width', '100%')
        .attr('height', h);

      svg.append('path')
        .attr('stroke', stroke)
        .attr('fill', 'transparent')
        .attr('stroke-width', strokeWidth)
        .attr('class', 'wave-data')
        .attr('d', line(timeSeries));

      highlithedEvents().map(event =>
        svg.append('path')
          .attr('stroke', eventStroke)
          .attr('fill', 'transparent')
          .attr('stroke-width', strokeWidth)
          .attr('class', 'wave-event')
          .attr('d', line(event)),
        );
    }

    render() {
      return (
        <div className={`_${this.props.dataRun.id}`} />
      );
    }
}

DrawChart.propTypes = {
  dataRun: PropTypes.object,
};

export default DrawChart;
