import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getAggregationZoomValue,
  getEventInterval,
  getIsSigRawLoading,
  getSignalRawData,
} from 'src/model/selectors/aggregationLevels';
import { getWrapperSize } from '../FocusChartUtils';
import {
  getSelectedPeriodRange,
  getDatarunDetails,
  isPredictionEnabled,
  getIsAggregationActive,
} from '../../../../model/selectors/datarun';
import { FocusChartConstants } from '../Constants';
import './ShowErrors.scss';

const { TRANSLATE_TOP, TRANSLATE_LEFT, CHART_MARGIN, MIN_VALUE, MAX_VALUE } = FocusChartConstants;

class ShowErrors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: TRANSLATE_TOP,
    };
  }

  componentDidMount() {
    const { width } = getWrapperSize();

    this.setState({ width });
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAggregationActive) {
      const { aggZoomValue, isSignalRawLoading } = this.props;
      if (aggZoomValue !== prevProps.aggZoomValue && !isSignalRawLoading) {
        this.updateZoom();
      }
    }
    if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
      if (typeof this.props.periodRange.zoomValue !== 'number') {
        this.updateZoom();
      }
    }
  }

  getTimeSeriesinterval() {
    const { isAggregationActive, dataRun, signalRawData } = this.props;
    const { maxTimeSeries } = dataRun;

    if (isAggregationActive && signalRawData) {
      return signalRawData;
    }
    return maxTimeSeries;
  }

  getScale() {
    const { dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const { width, height } = this.state;

    const [minTX, maxTX] = d3.extent(this.getTimeSeriesinterval(), (time) => time[0]);
    const [minTY, maxTY] = d3.extent(maxTimeSeries, (time) => time[1]);
    const drawableWidth = width - 2 * CHART_MARGIN - TRANSLATE_LEFT;
    const drawableHeight = height - 3.5 * CHART_MARGIN;

    const xCoord = d3.scaleTime().range([0, drawableWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const minX = Math.min(MIN_VALUE, minTX);
    const maxX = Math.max(MAX_VALUE, maxTX);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  getArea() {
    const { height } = this.state;
    const { dataRun, isSignalRawLoading, isAggregationActive, signalRawData } = this.props;
    const { timeseriesErr } = dataRun;
    const { xCoord } = this.getScale();
    const yRange = d3.scaleLinear().range([0, height - 10]);
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

    let area = d3
      .area()
      .x((d) => xCoord(d[0]))
      .y0((d) => -yRange(d[1]) / 2)
      .y1((d) => yRange(d[1]) / 2);

    if (isAggregationActive) {
      if (isSignalRawLoading) {
        return null;
      }

      const startIndex = timeseriesErr.findIndex((current) => signalRawData[0][0] - current[0] < 0) - 1;
      const stopIndex = timeseriesErr.findIndex((current) => signalRawData[0] - current[0][0] < 0);

      return area(timeseriesErr.slice(startIndex, stopIndex));
    }

    return area(timeseriesErr);
  }

  updateZoom() {
    const { width, height } = this.state;
    const { dataRun, periodRange, isAggregationActive, aggZoomValue, isPredictionVisible } = this.props;
    const zoomValue = isAggregationActive ? aggZoomValue : periodRange.zoomValue;
    const { timeseriesErr, maxTimeSeries } = dataRun;
    const { xCoord } = this.getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();
    const yRange = d3.scaleLinear().range([0, height - 10]);
    const area = d3
      .area()
      .x((data) => xCoord(data[0]))
      .y0((data) => -yRange(data[1]) / 2)
      .y1((data) => yRange(data[1]) / 2);

    if (isPredictionVisible) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
      yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));

      d3.select('.err-data').datum(timeseriesErr).attr('d', area);
    }
  }

  render() {
    const { width, height } = this.state;
    const { isOpen, isPredictionVisible } = this.props;
    const active = isOpen ? 'active' : '';
    const focusChartWidth = width;
    return (
      isPredictionVisible && (
        <div className="show-errors">
          <svg id="showErrors" className={active} width={width} height={height}>
            <rect className="err-bg" width={width} />
            <clipPath id="prectionClip">
              <rect width={focusChartWidth} height={height} />
            </clipPath>
            <g clipPath="url(#prectionClip)">
              <path
                d={this.getArea()}
                className="err-data"
                style={{ transform: `translate(${TRANSLATE_LEFT}px, ${TRANSLATE_TOP / 2}px)` }}
              />
            </g>
          </svg>
        </div>
      )
    );
  }
}

ShowErrors.propTypes = {
  dataRun: PropTypes.object,
  periodRange: PropTypes.object,
};

export default connect((state) => ({
  periodRange: getSelectedPeriodRange(state),
  dataRun: getDatarunDetails(state),
  isAggregationActive: getIsAggregationActive(state),
  eventInterval: getEventInterval(state),
  isPredictionVisible: isPredictionEnabled(state),
  isSignalRawLoading: getIsSigRawLoading(state),
  signalRawData: getSignalRawData(state),
  aggZoomValue: getAggregationZoomValue(state),
}))(ShowErrors);
