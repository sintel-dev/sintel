import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { getWrapperSize, getScale } from '../FocusChartUtils';
import './ShowErrors.scss';

class ShowErrors extends Component {
  componentDidMount() {
    const { width } = getWrapperSize();
    const chart = d3.select('#showErrors');
    this.setState({ chart, width, height: 90 }, () => this.drawChart());
  }

  componentDidUpdate() {
    this.resetChart();
    this.drawChart();
  }

  drawChart() {
    const { chart, width, height } = this.state;
    const { datarun } = this.props;
    const { timeseriesErr } = datarun;
    chart.attr('width', width).attr('height', height);

    const { xCoord } = getScale(width, height, timeseriesErr);

    const ye = d3.scaleLinear().range([0, height - 10]);
    ye.domain(d3.extent(timeseriesErr, d => d[1]));

    let area = d3
      .area()
      .x(function(d) {
        return xCoord(d[0]);
      })
      .y0(function(d) {
        return -ye(d[1]) / 2;
      })
      .y1(function(d) {
        return ye(d[1]) / 2;
      });

    chart
      .append('path')
      .datum(timeseriesErr)
      .attr('class', 'error')
      .attr('d', area);
  }

  resetChart() {
    const { chart } = this.state;
    chart.select('.error').remove();
  }

  render() {
    const { isOpen } = this.props;
    const active = isOpen ? 'active' : '';
    return (
      <div className="show-errors">
        <svg id="showErrors" className={active} />
      </div>
    );
  }
}

ShowErrors.propTypes = {
  datarun: PropTypes.object,
};

ShowErrors.propTypes = {
  isOpen: PropTypes.bool,
};

export default ShowErrors;
