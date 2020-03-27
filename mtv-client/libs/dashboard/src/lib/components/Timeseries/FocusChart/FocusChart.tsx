import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../../../model/types';
import { getWrapperSize, getScale, drawLine } from './FocusChartUtils';
import { FocusChartConstants, colorSchemes } from './Constants';
import EventDetails from './EventDetails';
import AddEvent from './FocusChartEvents/AddEvent';
import ShowErrors from './ShowErrors';
import { setTimeseriesPeriod, setActiveEventAction } from '../../../model/actions/datarun';
import { fromMonthToIndex, maxDaysInMonth, formatDate, toTimestamp } from '../../../model/utils/Utils';
import ZoomControls from './ZoomControls';
import {
  getDatarunDetails,
  isPredictionEnabled,
  getSelectedPeriodRange,
  getIsAddingNewEvents,
  getSelectedPeriodLevel,
  getReviewPeriod,
  getZoomCounter,
  getZoomOnClickDirection,
  getIsEditingEventRange,
} from '../../../model/selectors/datarun';
import './FocusChart.scss';

const { TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

type State = {
  width?: number;
  height?: number;
  eventData?: any;
  chart?: any;
  zoomValue?: any;
  brushInstance?: any;
  brushContext?: any;
  isTooltipVisible?: boolean;
  tooltipData?: any;
  zoom?: object;
};

class FocusChart extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      isTooltipVisible: false,
      eventData: {},
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState(
      {
        width,
        height,
      },
      () => {
        this.initZoom();
      },
    );
  }

  componentDidUpdate(prevProps: Props) {
    this.renderChartAxis();

    if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
      this.updateZoom();
    }

    if (prevProps.selectedPeriod !== this.props.selectedPeriod || prevProps.reviewRange !== this.props.reviewRange) {
      this.updateChartZoomOnSelectPeriod();
    }
    if (prevProps.zoomCounter !== this.props.zoomCounter) {
      this.updateZoomOnClick();
    }

    if (prevProps.isEditingRange !== this.props.isEditingRange) {
      this.toggleZoom();
    }
  }

  private zoom: d3.zoom;

  renderEventTooltip() {
    const { eventData } = this.state;
    const startDate = formatDate(eventData.startDate);
    const endDate = formatDate(eventData.stopDate);
    const tooltipOffset = 20;

    return (
      <div
        className="tooltip-data"
        style={{ left: `${eventData.xCoord + tooltipOffset}px`, top: `${eventData.yCoord}px` }}
      >
        <ul>
          <li>
            starts:
            <span>
              {startDate.day}/{startDate.month}/{startDate.year}
            </span>
            <span>{startDate.time}</span>
          </li>
          <li>
            ends:
            <span>
              {endDate.day}/{endDate.month}/{endDate.year}
            </span>
            <span>{endDate.time}</span>
          </li>
        </ul>
      </div>
    );
  }

  renderEvents(currentEvent) {
    const { dataRun, periodRange, setActiveEvent } = this.props;
    const { timeSeries, maxTimeSeries } = dataRun;
    const { width, height } = this.state;

    const { xCoord } = getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();
    const commentHeight = height - 3.5 * CHART_MARGIN;

    let startIndex = currentEvent[0];
    let stopIndex = currentEvent[1];

    const event = timeSeries.slice(startIndex, stopIndex + 1);

    // if there's a zoom level
    if (periodRange.zoomValue !== 1) {
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const commentWidth = Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0]));
    const translateComment = xCoord(timeSeries[startIndex][0]);
    const tagColor = colorSchemes[currentEvent[4]] || colorSchemes.Untagged;

    const startDate = new Date(timeSeries[startIndex][0]);
    const stopDate = new Date(timeSeries[stopIndex][0]);

    return (
      <g
        className="line-highlight"
        key={currentEvent[3]}
        id={`_${currentEvent[3]}`}
        onClick={() => setActiveEvent(currentEvent[3])}
        onMouseMove={evt => {
          this.setState({
            isTooltipVisible: true,
            eventData: {
              xCoord: evt.clientX,
              yCoord: evt.clientY,
              startDate,
              stopDate,
            },
          });
        }}
        onMouseLeave={() => this.setState({ isTooltipVisible: false })}
      >
        <path className="evt-highlight" d={drawLine(event, periodRange, maxTimeSeries)} />
        <g className="event-comment">
          <rect className="evt-area" width={commentWidth} height={commentHeight} y={0} x={translateComment} />
          <rect className="evt-comment" height="10" width={commentWidth} y="0" x={translateComment} fill={tagColor} />
        </g>
      </g>
    );
  }

  renderChartAxis() {
    const { periodRange, dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const { width, height } = this.state;
    const { xCoord, yCoord } = getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();

    // if there's a zoom level
    if (periodRange.zoomValue !== 1) {
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }
    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    d3.select('.axis.axis--x').call(xAxis);
    d3.select('.axis.axis--y')
      .call(yAxis)
      .call(yAxis.ticks(5, ',f'));
  }

  initZoom() {
    const { width, height } = this.state;
    const zoomWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [zoomWidth, height]])
      .extent([[0, 0], [zoomWidth, height]])
      .on('zoom', () => this.zoomHandler());

    d3.select('.zoom').call(zoom);

    this.zoom = zoom;
  }

  updateZoom() {
    const { periodRange } = this.props;
    d3.select('.zoom').call(this.zoom.transform, periodRange.zoomValue);
  }

  zoomHandler() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
      return;
    }

    const { width, height } = this.state;
    const { xCoord } = getScale(width, height, this.props.dataRun.maxTimeSeries);
    let zoomValue = d3.event.transform;

    if (zoomValue === 1) {
      return;
    }

    const eventRange = xCoord.range().map(zoomValue.invertX, zoomValue);
    const periodRange = {
      eventRange: [eventRange[0] < 0 ? 0 : eventRange[0], eventRange[1]],
      zoomValue,
    };

    this.props.setPeriodRange(periodRange);
  }

  toggleZoom() {
    const { isEditingRange } = this.props;
    const zoomWidth = this.state.width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    if (isEditingRange) {
      d3.select('.zoom').attr('width', 0);
    } else {
      d3.select('.zoom').attr('width', zoomWidth);
    }
  }

  updateChartZoomOnSelectPeriod() {
    const { width, height } = this.state;
    const focusChartWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const { selectedPeriod, setPeriodRange, dataRun, reviewRange } = this.props;
    const { maxTimeSeries } = dataRun;
    const { xCoord } = getScale(width, height, maxTimeSeries);
    const { dateRangeStart, dateRangeStop } = this.getSelectedRange(selectedPeriod, reviewRange, maxTimeSeries);

    const startRange = xCoord(dateRangeStart * 1000);
    const stopRange = xCoord(dateRangeStop * 1000);

    const zoomValue = d3.zoomIdentity.scale(focusChartWidth / (stopRange - startRange)).translate(-startRange, 0);
    selectedPeriod &&
      setPeriodRange({
        eventRange: [startRange, stopRange],
        zoomValue,
      });
  }

  updateZoomOnClick() {
    const { zoomDirection } = this.props;
    const { zoom } = this;
    const zoomInstance = d3.select('.zoom');

    if (zoomDirection === 'In') {
      zoom.scaleBy(zoomInstance, 1.03);
    } else {
      zoom.scaleBy(zoomInstance, 0.95);
    }
  }

  getSelectedRange(selectedPeriod, reviewRange, maxTimeSeries) {
    let dateRangeStart = 0;
    let dateRangeStop = 0;

    if (selectedPeriod.year) {
      const { year } = selectedPeriod;
      dateRangeStart = toTimestamp(`01/01/${year} 00:00:00`);
      dateRangeStop = toTimestamp(`12/31/${year} 23:59:59`);
    }

    if (selectedPeriod.month !== '') {
      const { year, month } = selectedPeriod;
      const monthIndex = fromMonthToIndex(month);
      const maxMonthDays = maxDaysInMonth(year, monthIndex);

      dateRangeStart = toTimestamp(`${monthIndex}/01/${year} 00:00:00`);
      dateRangeStop = toTimestamp(`${monthIndex}/${maxMonthDays}/${year} 23:59:59`);
    }

    if (reviewRange === 'year') {
      dateRangeStart = maxTimeSeries[0][0] / 1000;
      dateRangeStop = maxTimeSeries[maxTimeSeries.length - 1][0] / 1000;
    }

    if (reviewRange === 'month') {
      const { year } = selectedPeriod;
      dateRangeStart = toTimestamp(`01/01/${year} 00:00:00`);
      dateRangeStop = toTimestamp(`12/31/${year} 23:59:59`);
    }

    return { dateRangeStart, dateRangeStop };
  }

  drawChartData() {
    const { width, height } = this.state;
    const { dataRun, isPredictionVisible, periodRange } = this.props;
    const { maxTimeSeries, eventWindows, timeSeries, timeseriesPred } = dataRun;
    const focusChartWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;

    return (
      width > 0 &&
      height > 0 && (
        <g className="focus" width={focusChartWidth} transform={`translate(${TRANSLATE_LEFT}, ${CHART_MARGIN})`}>
          <defs>
            <clipPath id="focusClip">
              <rect width={focusChartWidth} height={height} />
            </clipPath>
          </defs>
          <g className="chart-data" clipPath="url(#focusClip)">
            <g className="wawe-data">
              <path className="chart-wawes" d={drawLine(timeSeries, periodRange, maxTimeSeries)} />
              {isPredictionVisible && (
                <path className="predictions" d={drawLine(timeseriesPred, periodRange, maxTimeSeries)} />
              )}
            </g>
            <rect className="zoom" width={focusChartWidth} height={height} />
            {eventWindows.map(currentEvent => this.renderEvents(currentEvent))}
          </g>
          <g className="chart-axis">
            <g className="axis axis--x" transform={`translate(0, ${height - 3.5 * CHART_MARGIN})`} />
            <g className="axis axis--y" />
          </g>
          <AddEvent />
        </g>
      )
    );
  }

  render() {
    const { width, height, isTooltipVisible } = this.state;
    return (
      <div className="focus-chart" id="focusChartWrapper">
        {isTooltipVisible && this.renderEventTooltip()}
        <ShowErrors isOpen={this.props.isPredictionVisible} />
        <EventDetails />
        <svg width={width} height={height} id="focusChart">
          {this.drawChartData()}
        </svg>
        <div className="zoomControlsHolder">
          <ZoomControls />
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  dataRun: getDatarunDetails(state),
  isPredictionVisible: isPredictionEnabled(state),
  periodRange: getSelectedPeriodRange(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  selectedPeriod: getSelectedPeriodLevel(state),
  reviewRange: getReviewPeriod(state),
  zoomCounter: getZoomCounter(state),
  zoomDirection: getZoomOnClickDirection(state),
  isEditingRange: getIsEditingEventRange(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: period => dispatch(setTimeseriesPeriod(period)),
  setActiveEvent: eventID => dispatch(setActiveEventAction(eventID)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapState,
  mapDispatch,
)(FocusChart);
