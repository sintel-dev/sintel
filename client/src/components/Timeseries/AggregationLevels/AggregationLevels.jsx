import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getCurrentEventDetails, getDatarunDetails, getCurrentChartStyle } from 'src/model/selectors/datarun';
import {
  getAggregationTimeLevel,
  getSignalRawData,
  getIsSigRawLoading,
  getEventInterval,
} from 'src/model/selectors/aggregationLevels';
import {
  setAggregationLevelAction,
  getSignalRawDataAction,
  setContextValueAction,
} from 'src/model/actions/aggregationLevels';
import Loader from 'src/components/Common/Loader';
import Dropdown from 'src/components/Common/Dropdown';
import { FocusChartConstants, colorSchemes } from '../FocusChart/Constants';
import { timeIntervals } from './AggregationChart/Utils';
import './AggregationLevels.scss';

const { MIN_VALUE, MAX_VALUE, TRANSLATE_LEFT, CHART_MARGIN, TIME_INTERVALS_HEIGHT } = FocusChartConstants;
const TRANSLATE_CHART = TRANSLATE_LEFT + 20;

class AggregationLevels extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomValue: 1,
    };
  }

  componentDidMount() {
    this.props.getSignalRawData();
    this.props.toggleTooltip();
  }

  componentDidUpdate(prevProps) {
    this.initZoom();

    if (prevProps.signalRawData !== this.props.signalRawData && this.props.signalRawData !== null) {
      this.updateAxisOnZoom();
    }
  }

  getEventInterval() {
    const { dataRun, currentEventDetails } = this.props;
    const { start_time, stop_time } = currentEventDetails;
    const { timeSeries } = dataRun;
    const eventInterval = timeSeries.filter((current) => current[0] >= start_time && current[0] <= stop_time);

    const startIndex = timeSeries.findIndex((element) => start_time - element[0] < 0) - 1 - eventInterval.length;
    const stopIndex = timeSeries.findIndex((element) => stop_time - element[0] < 0) + eventInterval.length;

    const eventWrapper = timeSeries.slice(startIndex, stopIndex);
    return { eventInterval, eventWrapper, start_time, stop_time, startIndex, stopIndex };
  }

  initZoom() {
    const { width, height } = this.props;
    const zoomWidth = width - TRANSLATE_CHART - 2 * CHART_MARGIN;
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [zoomWidth, height],
      ])
      .extent([
        [0, 0],
        [zoomWidth, height],
      ])
      .on('zoom', () => zoomHandler());

    d3.select('.aggregation-zoom').call(zoom);

    const zoomHandler = () => {
      let currentZoom = d3.event.transform;
      if (currentZoom === 1) {
        return;
      }
      this.setState({
        zoomValue: currentZoom,
      });
    };

    // this.zoom = zoom;
  }

  getScale() {
    const { width, height, signalRawData } = this.props;
    const chartWidth = width - TRANSLATE_CHART - 2 * CHART_MARGIN;
    const [minTY, maxTY] = d3.extent(signalRawData, (time) => time[1]);
    const chartHeight = height - TIME_INTERVALS_HEIGHT;
    const drawableHeight = chartHeight - 3.5 * CHART_MARGIN;

    const xCoord = d3.scaleTime().range([0, chartWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const start = signalRawData[0][0];
    const stop = signalRawData[signalRawData.length - 1][0];

    const minX = Math.min(MIN_VALUE, start);
    const maxX = Math.max(MAX_VALUE, stop);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  drawLine(eventInterval) {
    const { zoomValue } = this.state;
    const { currentChartStyle } = this.props;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    line.curve(currentChartStyle === 'linear' ? d3.curveLinear : d3.curveStepBefore);

    return line(eventInterval);
  }

  updateAxisOnZoom() {
    const { zoomValue } = this.state;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    d3.select('.axis.axis--x').call(xAxis);
    d3.select('.axis.axis--y').call(yAxis).call(yAxis.ticks(5, ',f'));
  }

  renderEventArea() {
    const { zoomValue } = this.state;
    const { height, currentEventDetails, eventInterval } = this.props;
    const { timeSeries } = this.props.dataRun;
    const { start_time, stop_time } = currentEventDetails;
    const startIndex = timeSeries.findIndex((element) => start_time - element[0] < 0) - 1 - eventInterval.length;
    const stopIndex = timeSeries.findIndex((element) => stop_time - element[0] < 0) + eventInterval.length;

    const { xCoord } = this.getScale();
    const startDate = new Date(timeSeries[startIndex]).getTime();
    const stopDate = new Date(timeSeries[stopIndex]).getTime();

    const chartHeight = height - TIME_INTERVALS_HEIGHT;

    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const eventTag = colorSchemes[currentEventDetails.tag] || colorSchemes.Untagged;

    const eventWidth = Math.max(xCoord(eventInterval[eventInterval.length - 1][0]) - xCoord(eventInterval[0][0]));
    const eventHeight = chartHeight - 3.5 * CHART_MARGIN;
    const translateEvent = xCoord(eventInterval[0][0]);

    return (
      <g className="event-highight">
        <rect className="event-tag" width={eventWidth} height="10" y={0} x={translateEvent} fill={eventTag} />
        <rect className="event-area" width={eventWidth} height={eventHeight} y={0} x={translateEvent} />
      </g>
    );
  }

  drawChartData() {
    const { signalRawData, eventInterval } = this.props;
    const { width, height, currentEventDetails, isSignalRawLoading } = this.props;
    const chartWidth = width - TRANSLATE_CHART - 2 * CHART_MARGIN;
    const chartHeight = height - TIME_INTERVALS_HEIGHT; // time granulation height;
    const pathClassName = currentEventDetails.tag?.replace(/\s/g, '_').toLowerCase() || 'untagged';
    if (isSignalRawLoading) {
      return null;
    }
    return (
      width > 0 && (
        <g className="aggregation-focus" transform={`translate(${TRANSLATE_CHART}, ${CHART_MARGIN})`}>
          <defs>
            <clipPath id="aggregationClip">
              <rect width={chartWidth} height={chartHeight} />
            </clipPath>
          </defs>
          <g className="aggregation-data" clipPath="url(#aggregationClip)">
            <path className="aggregation-wawes" d={this.drawLine(signalRawData, 'eventWrapper')} />
            <path
              className={`evt-highlight aggregation-event ${pathClassName}`}
              d={this.drawLine(eventInterval, 'eventInterval')}
            />

            {this.renderEventArea()}
          </g>
          <g className="aggregation-axis">
            <g className="axis axis--x" transform={`translate(0, ${chartHeight - 3.5 * CHART_MARGIN})`} />
            <g className="axis axis--y" />
            {this.updateAxisOnZoom()}
          </g>
          <rect className="aggregation-zoom" width={chartWidth} height={chartHeight} />
        </g>
      )
    );
  }

  renderIntervalLevels() {
    const { setAggregationLevel, currentAggregationLevel, setContextInfo } = this.props;
    const contextInfoValues = [
      { value: 1, label: '1x' },
      { value: 2, label: '2x' },
      { value: 3, label: '3x' },
    ];

    const dropDownProps = {
      isMulti: false,
      closeMenuOnSelect: true,
      onChange: (event) => setContextInfo(event.value),
      placeholder: '1x',
      options: contextInfoValues,
      formatLabel: false,
    };
    return (
      <div className="aggregation-wrapper">
        <ul className="aggregation-controls">
          {timeIntervals.map((level) => (
            <li key={level}>
              <button
                type="button"
                onClick={() => setAggregationLevel(level)}
                className={currentAggregationLevel.selectedLevel === level ? 'active' : ''}
              >
                {level}
              </button>
            </li>
          ))}
          <li className="context-info">
            <span>Context info</span>
            <Dropdown {...dropDownProps} />
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const { width, height, isSignalRawLoading } = this.props;
    const chartHeight = height - TIME_INTERVALS_HEIGHT;

    return (
      <div className="aggregation-chart" id="aggregationChart" style={{ position: 'relative', width, height }}>
        {this.renderIntervalLevels()}
        <Loader isLoading={isSignalRawLoading}>
          <svg width={width} height={chartHeight}>
            {this.drawChartData()}
          </svg>
        </Loader>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    currentEventDetails: getCurrentEventDetails(state),
    dataRun: getDatarunDetails(state),
    currentChartStyle: getCurrentChartStyle(state),
    currentAggregationLevel: getAggregationTimeLevel(state),
    isSignalRawLoading: getIsSigRawLoading(state),
    signalRawData: getSignalRawData(state),
    eventInterval: getEventInterval(state),
  }),
  (dispatch) => ({
    setAggregationLevel: (periodLevel) => dispatch(setAggregationLevelAction(periodLevel)),
    getSignalRawData: () => dispatch(getSignalRawDataAction()),
    setContextInfo: (contextValue) => dispatch(setContextValueAction(contextValue)),
  }),
)(AggregationLevels);
