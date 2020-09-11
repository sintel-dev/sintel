import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getWrapperSize, getScale } from '../FocusChartUtils';
import { getSelectedPeriodRange, getDatarunDetails } from '../../../../model/selectors/datarun';
import './ShowErrors.scss';

class ShowErrors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 90,
    };
  }

  componentDidMount() {
    const { width } = getWrapperSize();

    this.setState({ width });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
      this.updateZoom();
    }
  }

  getArea() {
    const { width, height } = this.state;
    const { timeseriesErr, maxTimeSeries } = this.props.datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);
    const yRange = d3.scaleLinear().range([0, height - 10]);
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

    let area = d3
      .area()
      .x((d) => xCoord(d[0]))
      .y0((d) => -yRange(d[1]) / 2)
      .y1((d) => yRange(d[1]) / 2);

    return area(timeseriesErr);
  }

  updateZoom() {
    const { width, height } = this.state;
    const { datarun, periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { timeseriesErr, maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();
    const yRange = d3.scaleLinear().range([0, height - 10]);
    const area = d3
      .area()
      .x((data) => xCoord(data[0]))
      .y0((data) => -yRange(data[1]) / 2)
      .y1((data) => yRange(data[1]) / 2);

    xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

    d3.select('.err-data').datum(timeseriesErr).attr('d', area);
  }

  render() {
    const { width, height } = this.state;
    const { isOpen } = this.props;
    const active = isOpen ? 'active' : '';
    return (
      <div className="show-errors">
        <svg id="showErrors" className={active} width={width} heigh={height}>
          <rect className="err-bg" width={width} />
          <path d={this.getArea()} className="err-data" />
        </svg>
      </div>
    );
  }
}

ShowErrors.propTypes = {
  datarun: PropTypes.object,
  periodRange: PropTypes.object,
};

export default connect((state) => ({
  periodRange: getSelectedPeriodRange(state),
  datarun: getDatarunDetails(state),
}))(ShowErrors);
