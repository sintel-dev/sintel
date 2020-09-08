import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getWrapperSize, getScale } from '../FocusChartUtils';
import './ShowErrors.scss';
import { getSelectedPeriodRange, getDatarunDetails } from '../../../../model/selectors/datarun';

class ShowErrors extends Component {
  componentDidMount() {
    const { width } = getWrapperSize();
    const chart = d3.select('#showErrors');

    this.setState({ chart, width, height: 90 }, () => this.initErrorChart());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.periodRange !== this.props.periodRange) {
      this.updateZoom();
    }

    if (prevProps.datarun.timeseriesErr !== this.props.datarun.timeseriesErr) {
      this.resetChart();
    }
  }

  getArea() {
    const { width, height } = this.state;
    const { timeseriesErr } = this.props.datarun;
    const { xCoord } = getScale(width, height, timeseriesErr);
    const yRange = d3.scaleLinear().range([0, height - 10]);
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

    let area = d3
      .area()
      .x((d) => xCoord(d[0]))
      .y0((d) => -yRange(d[1]) / 2)
      .y1((d) => yRange(d[1]) / 2);

    return { area };
  }

  drawPeriod() {
    const { chart, width, height } = this.state;
    const { area } = this.getArea();
    const errWrapper = chart.append('g').attr('class', 'err-group');
    chart.attr('width', width).attr('height', height);

    errWrapper.append('path').datum(this.props.datarun.timeseriesErr).attr('class', 'err-data').attr('d', area);
  }

  drawBackground() {
    const errGroup = d3.select('.err-group');
    const gradient = errGroup
      .append('linearGradient')
      .attr('id', 'waweGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#1A1B20').attr('stop-opacity', 1);

    gradient.append('stop').attr('offset', '50%').attr('stop-color', '#1A1B20').attr('stop-opacity', 0.1);

    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#1A1B20').attr('stop-opacity', 1);

    errGroup
      .append('rect')
      .attr('class', 'waweBg')
      .attr('width', '100%')
      .attr('height', '90')
      .attr('fill', 'url(#waweGradient)');
  }

  addZoom() {
    const isZoomReady = document.querySelector('.err-zoom');

    const { width, height } = this.state;
    const errGroup = d3.select('#showErrors');

    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ]);

    if (isZoomReady) {
      return { zoom };
    }

    errGroup.append('rect').attr('class', 'err-zoom').attr('width', '100%').attr('height', height);
    d3.select('.err-zoom').call(zoom);
    return { zoom };
  }

  updateZoom() {
    const { width, height } = this.state;
    const { datarun, periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { timeseriesErr } = datarun;
    const { zoom } = this.addZoom();
    const { xCoord } = getScale(width, height, timeseriesErr);
    const xCoordCopy = xCoord.copy();
    const yRange = d3.scaleLinear().range([0, height - 10]);

    // getArea() cannot be used here
    const area = d3
      .area()
      .x((data) => xCoord(data[0]))
      .y0((data) => -yRange(data[1]) / 2)
      .y1((data) => yRange(data[1]) / 2);

    xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

    d3.select('.err-data').datum(timeseriesErr).attr('d', area);
    d3.select('.err-zoom').call(zoom.transform, zoomValue);
  }

  resetChart() {
    const { chart } = this.state;
    chart.select('.err-group').remove();
    chart.select('.err-zoom').remove();
    this.initErrorChart();
  }

  initErrorChart() {
    this.addZoom();
    this.drawPeriod();
    this.drawBackground();
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
  isOpen: PropTypes.bool,
  periodRange: PropTypes.object,
};

export default connect((state) => ({
  periodRange: getSelectedPeriodRange(state),
  datarun: getDatarunDetails(state),
}))(ShowErrors);
