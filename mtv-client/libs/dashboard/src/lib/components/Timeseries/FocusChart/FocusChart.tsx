import * as d3 from 'd3';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import EventDetails from './EventDetails';
import { FocusChartConstants, colorSchemes } from './Constants';
import ZoomControls from './ZoomControls';
import {
  setTimeseriesPeriod,
  setActiveEventAction,
  isEditingEventRangeAction,
  updateEventDetailsAction,
  updateNewEventDetailsAction,
  openNewDetailsPopupAction,
} from '../../../model/actions/datarun';
import {
  getDatarunDetails,
  getSelectedPeriodRange,
  isPredictionEnabled,
  getCurrentEventDetails,
  getIsEditingEventRange,
  getUpdatedEventsDetails,
  getIsEditingEventRangeDone,
  getIsAddingNewEvents,
  getAddingNewEventStatus,
  getZoomOnClickDirection,
  getZoomCounter,
  getZoomMode,
  getNewEventDetails,
  getSelectedPeriodLevel,
  getReviewPeriod,
} from '../../../model/selectors/datarun';
import { getWrapperSize, getScale } from './FocusChartUtils';
import ShowErrors from './ShowErrors';
import './FocusChart.scss';
import { fromMonthToIndex, maxDaysInMonth, formatDate } from '../../../model/utils/Utils';

import { RootState } from '../../../model/types';

const { TRANSLATE_LEFT, DRAW_EVENTS_TIMEOUT, CHART_MARGIN } = FocusChartConstants;

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

type State = {
  width?: number;
  height?: number;
  chart?: any;
  zoomValue?: any;
  brushInstance?: any;
  brushContext?: any;
  isTooltipVisible?: boolean;
  tooltipData?: any;
};

class FocusChart extends Component<Props, State> {
  // TO be checked
  // previously use ...args here
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      isTooltipVisible: false,
      tooltipData: {},
    };

    this.zoomHandler = this.zoomHandler.bind(this);
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    const chart = d3.select('#focusChart');

    this.setState(
      {
        width,
        height,
        chart,
      },
      () => {
        this.drawChart();
      },
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.datarun && prevProps.datarun.id !== this.props.datarun.id) {
      this.drawChart();
    }

    if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
      this.updateChartOnBrush();
    }

    if (prevProps.isPredictionVisible !== this.props.isPredictionVisible) {
      this.togglePredictions();
    }

    if (prevProps.isEditingEventRange !== this.props.isEditingEventRange) {
      this.changeEventRange();
    }

    if (prevProps.isEditingEventRangeDone !== this.props.isEditingEventRangeDone) {
      // this.drawEvents();
    }
    if (prevProps.updatedEventDetails.tag !== this.props.updatedEventDetails.tag) {
      this.updateEventTagOnSave(this.props.updatedEventDetails);
    }

    if (prevProps.isAddingNewEvents !== this.props.isAddingNewEvents) {
      this.addNewEvent(this.props.isAddingNewEvents);
    }

    if (
      prevProps.datarun.events !== this.props.datarun.events ||
      this.props.datarun.eventWindows !== prevProps.datarun.eventWindows
    ) {
      this.drawEvents();
    }

    if (this.props.zoomCounter !== prevProps.zoomCounter) {
      this.zoomOnClick(this.props.zoomDirection);
    }

    if (prevProps.zoomMode !== this.props.zoomMode) {
      this.toggleZoom();
    }

    if (
      prevProps.selectedPeriodLevel !== this.props.selectedPeriodLevel ||
      prevProps.reviewRange !== this.props.reviewRange
    ) {
      this.updateChartOnPeriodChange();
    }
  }

  private zoom: any;

  private resetZoom: any;

  private zoomOnClick: any;

  drawLine(data) {
    const { width, height } = this.state;
    const { periodRange } = this.props;
    const { maxTimeSeries } = this.props.datarun;
    const { xCoord, yCoord } = getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();

    if (periodRange.zoomValue !== 1) {
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x(d => xCoord(d[0]))
      .y(d => yCoord(d[1]));

    return line(data);
  }

  drawAxis() {
    const { width, height } = this.state;
    const { maxTimeSeries } = this.props.datarun;
    const { xCoord, yCoord } = getScale(width, height, maxTimeSeries);
    const isChartReady = document.querySelector('.chart-axis');
    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    const focusGroup = d3.select('.focus');

    const createAxis = () => {
      const axisG = focusGroup.append('g').attr('class', 'chart-axis');
      axisG
        .append('g')
        .attr('transform', `translate(0, ${height - 3.5 * CHART_MARGIN})`)
        .attr('class', 'axis axis--x')
        .call(xAxis);
      axisG
        .append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis.ticks(5, ',f'));
    };

    const updateAxis = () => {
      focusGroup.select('.axis.axis--x').call(xAxis);

      focusGroup.select('.axis.axis--y').call(yAxis.ticks(5, ',f'));
    };

    if (isChartReady) {
      updateAxis();
    } else {
      createAxis();
    }
  }

  drawData() {
    const { width, height, chart } = this.state;
    const { datarun } = this.props;
    const isChartDataReady = document.querySelector('.focus');

    chart.attr('width', width).attr('height', height);

    const createChart = () => {
      const focusGroup = chart
        .append('g')
        .attr('class', 'focus')
        .attr('width', width - TRANSLATE_LEFT - 2 * CHART_MARGIN)
        .attr('transform', `translate(${TRANSLATE_LEFT}, ${CHART_MARGIN})`);

      const clipPath = focusGroup.append('defs');
      clipPath
        .append('clipPath')
        .attr('id', 'focusClip')
        .append('rect')
        .attr('width', width - TRANSLATE_LEFT - 2 * CHART_MARGIN)
        .attr('height', height);

      const chartLine = focusGroup
        .append('g')
        .attr('class', 'chart-data')
        .attr('clip-path', 'url(#focusClip)');

      const chartGroups = chartLine.append('g').attr('class', 'wawe-data');
      chartGroups
        .append('path')
        .attr('class', 'chart-waves')
        .transition()
        .duration(DRAW_EVENTS_TIMEOUT)
        .attr('d', () => this.drawLine(datarun.timeSeries));
    };

    const updateChart = () => {
      d3.select('.chart-waves')
        .transition()
        .duration(DRAW_EVENTS_TIMEOUT)
        .attr('d', () => this.drawLine(datarun.timeSeries))
        .on('end', () => this.updateChartOnBrush());
    };

    if (isChartDataReady === null) {
      createChart();
    } else {
      updateChart();
    }
  }

  drawEvents() {
    const { width, height } = this.state;
    const { datarun, setCurrentEvent, periodRange } = this.props;
    const { timeSeries, eventWindows, maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);
    const chartData = d3.select('g.chart-data');
    chartData.selectAll('.line-highlight').remove();

    if (periodRange.zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const drawHlEvent = (event, eventIndex) => {
      const lineData = chartData
        .append('g')
        .attr('class', 'line-highlight')
        .attr('id', `_${eventWindows[eventIndex][3]}`);
      const currentEvent = eventWindows[eventIndex];
      const startIndex = currentEvent[0];
      const stopIndex = currentEvent[1];
      const tagColor = colorSchemes[currentEvent[4]] || colorSchemes.Untagged;
      const currentEventID = currentEvent[3];

      // append event highlight
      lineData
        .append('path')
        .attr('class', 'evt-highlight')
        .transition()
        .duration(DRAW_EVENTS_TIMEOUT)
        .attr('d', this.drawLine(event));

      const comment = lineData.append('g').attr('class', 'event-comment');

      // append event area
      comment
        .append('rect')
        .attr('class', 'evt-area')
        .attr('height', height - 3.5 * CHART_MARGIN)
        .attr('width', Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0])))
        .attr('y', 0)
        .attr('x', xCoord(timeSeries[startIndex][0]))
        .on('mouseover, mousemove', () => {
          const startDate = new Date(timeSeries[currentEvent[0]][0]);
          const stopDate = new Date(timeSeries[currentEvent[1]][0]);
          const tooltipOffset = 20;
          this.setState({
            isTooltipVisible: true,
            tooltipData: {
              xCoord: d3.event.x + tooltipOffset,
              yCoord: d3.event.y,
              eventStartTime: startDate,
              eventEndTime: stopDate,
            },
          });
        })
        .on('mouseout', () => {
          this.setState({
            isTooltipVisible: false,
          });
        })
        .on('click', () => {
          setCurrentEvent(currentEventID);
        });

      comment
        .append('rect')
        .attr('class', 'evt-comment')
        .attr('height', 10)
        .attr('width', Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0])))
        .attr('y', 0)
        .attr('x', xCoord(timeSeries[startIndex][0]))
        .attr('fill', tagColor)
        .append('title')
        .text(
          `tag: ${currentEvent[3]}
          from ${new Date(timeSeries[currentEvent[0]][0]).toUTCString()}
          to ${new Date(timeSeries[currentEvent[1]][0]).toUTCString()}`,
        );
    };

    setTimeout(() => {
      const { zoom, resetZoom, zoomOnClick } = this.addZoom();
      this.zoom = zoom;
      this.resetZoom = resetZoom;
      this.zoomOnClick = zoomOnClick;

      chartData.selectAll('.line-highlight').remove(); // to make sure all previous events are removed
      eventWindows.forEach((event, index) => drawHlEvent(timeSeries.slice(event[0], event[1] + 1), index));
    });
  }

  togglePredictions() {
    const { isPredictionVisible, datarun } = this.props;
    const { width, height } = this.state;
    const { xCoord, yCoord } = getScale(width, height, datarun.maxTimeSeries);
    const xCoordCopy = xCoord.copy();
    const waweData = d3.select('.wawe-data');
    const line = d3
      .line()
      .x(d => xCoord(d[0]))
      .y(d => yCoord(d[1]));

    // drawing predictions at zoom level coords, if there's such
    this.state.zoomValue && xCoord.domain(this.state.zoomValue.rescaleX(xCoordCopy).domain());
    d3.select('.predictions').remove();

    isPredictionVisible &&
      waweData
        .append('path')
        .attr('class', 'predictions')
        .attr('d', () => line(datarun.timeseriesPred));
  }

  addZoom() {
    const { width, height, chart } = this.state;
    let zoomInstance;
    const chartData = d3.select('.chart-data');
    const zoomWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [zoomWidth, height]])
      .extent([[0, 0], [zoomWidth, height]])
      .on('zoom', this.zoomHandler);

    chart.selectAll('.zoom').remove();
    zoomInstance = chartData
      .append('rect')
      .attr('width', zoomWidth)
      .attr('height', height)
      .attr('class', 'zoom')
      .call(zoom);

    const enableZoom = () => {
      zoomInstance.attr('width', zoomWidth);
      zoomInstance.call(zoom);
    };

    const disableZoom = () => {
      zoomInstance.attr('width', 0);
      zoomInstance.on('.zoom', null);
    };

    const zoomOnClick = zoomDirection =>
      zoomDirection === 'In' ? zoom.scaleBy(zoomInstance, 1.03) : zoom.scaleBy(zoomInstance, 0.95);

    let resetZoom = () => {
      zoomInstance.call(zoom.transform, d3.zoomIdentity);
    };

    return { zoom, enableZoom, disableZoom, resetZoom, zoomOnClick, zoomInstance };
  }

  toggleZoom() {
    const { zoomMode } = this.props;
    const { enableZoom, disableZoom } = this.addZoom();
    if (zoomMode) {
      enableZoom();
    } else {
      disableZoom();
    }
  }

  zoomHandler() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
      return;
    }
    const { width, height } = this.state;
    const { xCoord } = getScale(width, height, this.props.datarun.maxTimeSeries);
    let zoomValue = d3.event.transform;
    if (zoomValue === 1) {
      return;
    }

    const eventRange = xCoord.range().map(zoomValue.invertX, zoomValue);
    const periodRange = {
      eventRange,
      zoomValue,
    };
    this.props.setPeriodRange(periodRange);
  }

  updateChartOnPeriodChange() {
    const { width, height } = this.state;
    const { selectedPeriodLevel, reviewRange, datarun } = this.props;
    const { maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, this.props.datarun.maxTimeSeries);
    const toTimestamp = strDate => Date.parse(strDate);
    let eventRange = [];
    let startDate = 0;
    let stopDate = 0;

    const focusChartWidth =
      document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;

    const setYearLevelView = year => {
      startDate = toTimestamp(`01/01/${year} 00:00:00`);
      stopDate = toTimestamp(`12/31/${year} 23:59:59`);
    };

    const setMonthLevelView = (year, month) => {
      const currentMonth = fromMonthToIndex(month);
      const maxMonthDays = maxDaysInMonth(year, currentMonth);
      startDate = toTimestamp(`${currentMonth}/01/${selectedPeriodLevel.year} 00:00:00`);
      stopDate = toTimestamp(`${currentMonth}/${maxMonthDays}/${selectedPeriodLevel.year} 23:59:59`);
    };

    if (selectedPeriodLevel.year) {
      setYearLevelView(selectedPeriodLevel.year);
    }

    if (selectedPeriodLevel.month) {
      const { year, month } = selectedPeriodLevel;
      setMonthLevelView(year, month);
    }

    if (reviewRange === 'month') {
      setYearLevelView(selectedPeriodLevel.year);
    }

    if (reviewRange === 'day') {
      const { year, month } = selectedPeriodLevel;
      setMonthLevelView(year, month);
    }

    if (reviewRange !== 'year') {
      const startRange = xCoord(startDate);
      const stopRange = xCoord(stopDate);
      eventRange = [startRange, stopRange];

      const zoomValue = d3.zoomIdentity
        .scale(focusChartWidth / (eventRange[1] - eventRange[0]))
        .translate(-eventRange[0], 0);
      this.props.setPeriodRange({ eventRange, zoomValue });
    }

    if (reviewRange === 'year') {
      const startRange = xCoord(maxTimeSeries[0][0]);
      const stopRange = xCoord(maxTimeSeries[maxTimeSeries.length - 1][0]);
      eventRange = [startRange, stopRange];
      const zoomValue = d3.zoomIdentity
        .scale(focusChartWidth / (eventRange[1] - eventRange[0]))
        .translate(-eventRange[0], 0);
      this.props.setPeriodRange({ eventRange, zoomValue });
    }
  }

  updateChartOnBrush() {
    const { chart, width, height } = this.state;
    const { periodRange, datarun } = this.props;
    const { zoomValue } = periodRange;
    if (zoomValue === 1) {
      return;
    }
    const { timeSeries, eventWindows, timeseriesPred, maxTimeSeries } = datarun;
    const { xCoord, yCoord } = getScale(width, height, maxTimeSeries);
    const xCoordCopy = xCoord.copy();
    const xAxis = d3.axisBottom(xCoord);
    let events = [];

    d3.select('.zoom').call(this.zoom.transform, zoomValue);
    xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());

    const line = d3
      .line()
      .x(d => xCoord(d[0]))
      .y(d => yCoord(d[1]));

    d3.select('.axis.axis--x').call(xAxis);

    // updating main chart and predictions lines
    chart.select('.chart-waves').attr('d', () => line(timeSeries));
    chart.select('.predictions').attr('d', () => line(timeseriesPred));

    eventWindows.forEach(event => events.push(timeSeries.slice(event[0], event[1] + 1)));

    chart.selectAll('.evt-highlight').each(function(value, index) {
      d3.select(this).attr('d', line(events[index]));
    });

    chart.selectAll('.event-comment').each(function(value, index) {
      const startIndex = eventWindows[index][0];
      const stopIndex = eventWindows[index][1];
      const commentArea = this.children[0];
      const commentText = this.children[1];
      const commentAttr = {
        width: Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0])),
        xMove: xCoord(timeSeries[startIndex][0]),
      };

      d3.select(commentArea)
        .attr('width', commentAttr.width)
        .attr('x', commentAttr.xMove);

      d3.select(commentText)
        .attr('width', commentAttr.width)
        .attr('x', commentAttr.xMove);
    });

    this.setState({ zoomValue });
  }

  getBrushCoords() {
    const { currentEventDetails } = this.props;
    const brushStart = currentEventDetails.start_time;
    const brushEnd = currentEventDetails.stop_time;
    return { brushStart, brushEnd };
  }

  // @TODO - room for improvement
  normalizeHanlers(chart) {
    const brushHandlers = d3.selectAll(`.${chart} rect.handle`);
    const overlayHeight = d3.select(`.${chart} .overlay`).attr('height');
    brushHandlers
      .attr('y', function() {
        return overlayHeight / 2 - overlayHeight / 8;
      })
      .attr('height', function() {
        return overlayHeight / 6;
      })
      .attr('ry', 3);
  }

  changeEventRange() {
    const { width, height } = this.state;
    const { editEventRangeDone, datarun, updateEventDetails, isEditingEventRange, periodRange } = this.props;
    const { timeSeries, maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);
    const { brushStart, brushEnd } = this.getBrushCoords();

    if (periodRange.zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const brushInstance = d3
      .brushX()
      .extent([
        [0, 0],
        [width - 59, height - 3.5 * CHART_MARGIN], // @TODO investigate what is 59
      ])
      .on('brush start', () => {
        this.normalizeHanlers('focuschart-brush');
      })
      .on('brush', () => {
        this.normalizeHanlers('focuschart-brush');
        const [selection_start, selection_end] = d3.event.selection;
        const startIndex =
          timeSeries.findIndex(element => xCoord.invert(selection_start).getTime() - element[0] < 0) - 1;
        const stopIndex = timeSeries.findIndex(element => xCoord.invert(selection_end).getTime() - element[0] < 0);

        if (startIndex !== -1 && stopIndex !== -1) {
          updateEventDetails({
            start_time: new Date(timeSeries[startIndex][0]).getTime(),
            stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
          });
          this.liveUpdateEvent();
        }
      })
      .on('end', () => {
        this.normalizeHanlers('focuschart-brush');
      });

    const brushContext = d3.select('g.chart-data');
    brushContext
      .append('g')
      .attr('class', 'focuschart-brush')
      .call(brushInstance)
      .call(brushInstance.move, [xCoord(brushStart), xCoord(brushEnd)]);
    const brushOverlay = document.querySelector('.focuschart-brush .selection');
    d3.select('.focuschart-brush .selection').attr('pointer-events', 'all');
    document.querySelector('.focuschart-brush .selection');

    brushOverlay.addEventListener('dblclick', editEventRangeDone);

    // @TODO - find a more elegant way to handle double creation of '.focuschart-brush' (demo purpose)
    !isEditingEventRange && document.querySelectorAll('.focuschart-brush').forEach(brush => brush.remove());
  }

  liveUpdateEvent() {
    // TODO - investigate more closely a more simple way to handle live range editing
    const { width, height } = this.state;
    const { currentEventDetails, datarun, periodRange } = this.props;
    const { timeSeries, maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);

    const startIndex = timeSeries.findIndex(element => currentEventDetails.start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex(element => currentEventDetails.stop_time - element[0] < 0);
    const lineData = timeSeries.slice(startIndex, stopIndex);
    const { start_time, stop_time } = currentEventDetails;

    const eventArea = d3.select(`g#_${currentEventDetails.id} .evt-area`);
    const commentTag = d3.select(`g#_${currentEventDetails.id} .evt-comment`);

    if (periodRange.zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    eventArea
      .attr('x', xCoord(currentEventDetails.start_time))
      .attr('width', Math.max(xCoord(stop_time) - xCoord(start_time)));

    commentTag
      .attr('x', xCoord(currentEventDetails.start_time))
      .attr('width', Math.max(xCoord(stop_time) - xCoord(start_time)));
    d3.select(`g#_${currentEventDetails.id} path.evt-highlight`).attr('d', this.drawLine(lineData));
    this.updateLineChart();
  }

  getRatio() {
    const width = document.querySelector('.time-row').clientWidth;
    const chartWidth = width + 160;
    const focusChartWidth =
      document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const ratio = chartWidth / focusChartWidth;
    return { width, ratio };
  }

  updateLineChart() {
    const { currentEventDetails } = this.props;
    const width = document.querySelector('.wave-chart').clientWidth - 18;
    const { datarun } = this.props;
    const { timeSeries, maxTimeSeries } = datarun;

    const target = d3.select(`#wawe_${currentEventDetails.id}`);

    const startIndex = maxTimeSeries.findIndex(element => currentEventDetails.start_time - element[0] < 0) - 1;
    const stopIndex = maxTimeSeries.findIndex(element => currentEventDetails.stop_time - element[0] < 0);

    const getLinechartScale = () => {
      let minValue = Number.MAX_SAFE_INTEGER;
      let maxValue = Number.MIN_SAFE_INTEGER;
      const timeSeriesMin = maxTimeSeries[0][0];
      const timeSeriesMax = maxTimeSeries[maxTimeSeries.length - 1][0];
      const xCoord = d3.scaleTime().range([0, width]);
      const yCoord = d3.scaleLinear().range([36, 0]);

      minValue = Math.min(minValue, timeSeriesMin);
      maxValue = Math.max(maxValue, timeSeriesMax);

      xCoord.domain([minValue, maxValue]);
      yCoord.domain([-1, 1]);

      return { xCoord, yCoord };
    };

    const { xCoord, yCoord } = getLinechartScale();

    const line = d3
      .line()
      .x(d => xCoord(d[0]))
      .y(d => yCoord(d[1]));

    target.attr('d', line(timeSeries.slice(startIndex, stopIndex)));
  }

  updateEventTagOnSave(event) {
    const eventTag = d3.select(`#_${event.id} rect.evt-comment`);
    const tagColor = colorSchemes[event.tag] || colorSchemes.Untagged;
    eventTag.attr('fill', tagColor);
  }

  drawChart() {
    this.drawData();
    this.drawAxis();
    this.drawEvents();
    this.togglePredictions();
  }

  addNewEvent(isAddingEvent) {
    document.querySelectorAll('.new-event-brush').forEach(brush => brush.remove());
    const { width, height, zoomValue } = this.state;
    const { datarun, updateNewEventDetails, openNewDetailsPopup } = this.props;
    const { timeSeries, maxTimeSeries } = datarun;
    const { xCoord } = getScale(width, height, maxTimeSeries);

    if (zoomValue !== undefined) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const brushInstance = d3
      .brushX()
      .extent([[0, 0], [width - 59, height - 3.5 * CHART_MARGIN]])
      .on('brush start', () => {
        this.normalizeHanlers('new-event-brush');
      })
      .on('brush', () => {
        const { newEventDetails } = this.props;
        const [selection_start, selection_end] = d3.event.selection;
        const startIndex =
          timeSeries.findIndex(element => xCoord.invert(selection_start).getTime() - element[0] < 0) - 1;
        const stopIndex = timeSeries.findIndex(element => xCoord.invert(selection_end).getTime() - element[0] < 0);
        this.normalizeHanlers('new-event-brush');
        if (startIndex !== -1 && stopIndex !== -1) {
          updateNewEventDetails({
            ...newEventDetails,
            start_time: new Date(timeSeries[startIndex][0]).getTime(),
            stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
          });
        }
      })
      .on('end', () => {
        this.normalizeHanlers('new-event-brush');
      });

    const brushContext = d3.select('g.chart-data');
    brushContext
      .append('g')
      .attr('class', 'new-event-brush')
      .call(brushInstance)
      .call(brushInstance.move, [0, 50]);

    const brushOverlay = document.querySelector('.new-event-brush .selection');
    d3.select('.new-event-brush .selection').attr('pointer-events', 'all');
    document.querySelector('.new-event-brush .selection');

    brushOverlay.addEventListener('dblclick', openNewDetailsPopup);
    if (!isAddingEvent) {
      // @TODO - same problem - double brush
      document.querySelectorAll('.new-event-brush').forEach(brush => brush.remove());
    }
  }

  showEventTooltip() {
    const { tooltipData } = this.state;
    const startDate = formatDate(tooltipData.eventStartTime);
    const endDate = formatDate(tooltipData.eventEndTime);

    return (
      <div className="tooltip-data" style={{ left: `${tooltipData.xCoord}px`, top: `${tooltipData.yCoord}px` }}>
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

  render() {
    const { isTooltipVisible } = this.state;
    return (
      <div className="focus-chart" id="focusChartWrapper">
        <ShowErrors isOpen={this.props.isPredictionVisible} />
        <EventDetails />
        {isTooltipVisible && this.showEventTooltip()}
        <svg id="focusChart" />
        <div className="zoomControlsHolder">
          <ZoomControls />
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  datarun: getDatarunDetails(state),
  periodRange: getSelectedPeriodRange(state),
  isPredictionVisible: isPredictionEnabled(state),
  currentEventDetails: getCurrentEventDetails(state),
  isEditingEventRange: getIsEditingEventRange(state),
  updatedEventDetails: getUpdatedEventsDetails(state),
  isEditingEventRangeDone: getIsEditingEventRangeDone(state),
  isAddingNewEvents: getIsAddingNewEvents(state),
  addingNewEventStatus: getAddingNewEventStatus(state),
  zoomDirection: getZoomOnClickDirection(state),
  zoomCounter: getZoomCounter(state),
  zoomMode: getZoomMode(state),
  newEventDetails: getNewEventDetails(state),
  selectedPeriodLevel: getSelectedPeriodLevel(state),
  reviewRange: getReviewPeriod(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: period => dispatch(setTimeseriesPeriod(period)),
  setCurrentEvent: eventID => dispatch(setActiveEventAction(eventID)),
  editEventRangeDone: () => dispatch(isEditingEventRangeAction(false)),
  updateEventDetails: details => dispatch(updateEventDetailsAction(details)),
  updateNewEventDetails: details => dispatch(updateNewEventDetailsAction(details)),
  openNewDetailsPopup: () => dispatch(openNewDetailsPopupAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapState,
  mapDispatch,
)(FocusChart);
