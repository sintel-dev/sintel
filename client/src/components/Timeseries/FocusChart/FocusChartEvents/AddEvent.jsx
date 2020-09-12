import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { setActivePanelAction } from 'src/model/actions/sidebar';
import {
  updateNewEventDetailsAction,
  updateEventDetailsAction,
  // openEventDetailsPopupAction,
} from 'src/model/actions/datarun';

import {
  getIsAddingNewEvents,
  getDatarunDetails,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getCurrentEventDetails,
  getIsAggregationActive,
} from 'src/model/selectors/datarun';

import { FocusChartConstants } from '../Constants';
import { normalizeHanlers } from '../FocusChartUtils';

const { CHART_MARGIN, TRANSLATE_LEFT, MIN_VALUE, MAX_VALUE } = FocusChartConstants;

export class AddEvents extends Component {
  componentDidMount() {
    this.renderBrush();
    normalizeHanlers('brush-instance');
  }

  getScale() {
    const { width, height } = this.props;
    const { dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const [minTX, maxTX] = d3.extent(maxTimeSeries, (time) => time[0]);
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

  drawLine(data) {
    const { periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(data);
  }

  getBrushCoords() {
    const { currentEventDetails, isEditingEventRange, periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord } = this.getScale();

    let brushStart = 0;
    let brushEnd = 50;

    if (zoomValue !== undefined && zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    if (isEditingEventRange) {
      brushStart = xCoord(currentEventDetails.start_time);
      brushEnd = xCoord(currentEventDetails.stop_time);
    }

    return { brushStart, brushEnd };
  }

  renderBrush() {
    const { width, height } = this.props;
    const {
      dataRun,
      updateNewEventDetails,
      updateEventDetails,
      periodRange,
      isEditingEventRange,
      isAddingNewEvent,
    } = this.props;
    const { zoomValue } = periodRange;
    const { timeSeries } = dataRun;
    const { xCoord } = this.getScale();

    const { brushStart, brushEnd } = this.getBrushCoords();

    if (zoomValue !== undefined && zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const brushContext = d3.select('g.brush-instance');

    const brushInstance = d3
      .brushX()
      .extent([
        [0, 0],
        [width - 59, height - 3.5 * CHART_MARGIN],
      ])
      .on('brush start', () => {
        normalizeHanlers('brush-instance');
      })
      .on('brush', () => {
        normalizeHanlers('brush-instance');

        const { newEventDetails } = this.props;
        const [selection_start, selection_end] = d3.event.selection;
        const startIndex =
          timeSeries.findIndex((element) => xCoord.invert(selection_start).getTime() - element[0] < 0) - 1;
        const stopIndex = timeSeries.findIndex((element) => xCoord.invert(selection_end).getTime() - element[0] < 0);

        console.log(stopIndex);
        debugger;
        if (startIndex !== -1 && stopIndex !== -1) {
          const eventDetails = {
            ...newEventDetails,
            start_time: new Date(timeSeries[startIndex][0]).getTime(),
            stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
          };

          // @TODO - investigate if really needed, updateEventDetails should do the trick
          if (isAddingNewEvent) {
            updateNewEventDetails({ ...eventDetails });
          }

          if (isEditingEventRange) {
            updateEventDetails({
              start_time: new Date(timeSeries[startIndex][0]).getTime(),
              stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
            });
          }
        }
      })
      .on('end', () => {
        normalizeHanlers('brush-instance');
      });

    brushContext.call(brushInstance).call(brushInstance.move, [brushStart, brushEnd]);
  }

  render() {
    const { isAddingNewEvent, isEditingEventRange, toggleActivePanel } = this.props;
    return (isAddingNewEvent || isEditingEventRange) && <g className="brush-instance" onClick={toggleActivePanel} />;
  }
}

export default connect(
  (state) => ({
    dataRun: getDatarunDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
    periodRange: getSelectedPeriodRange(state),
    isEditingEventRange: getIsEditingEventRange(state),
    currentEventDetails: getCurrentEventDetails(state),
    isAggregationActive: getIsAggregationActive(state),
  }),
  (dispatch) => ({
    updateNewEventDetails: (eventDetails) => dispatch(updateNewEventDetailsAction(eventDetails)),
    updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
    // openEventDetailsPopup: () => dispatch(openEventDetailsPopup()),
    toggleActivePanel: () => dispatch(setActivePanelAction('eventView')),
  }),
)(AddEvents);
