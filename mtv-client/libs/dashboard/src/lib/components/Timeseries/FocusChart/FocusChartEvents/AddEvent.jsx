import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import {
  updateNewEventDetailsAction,
  updateEventDetailsAction,
  openEventDetailsPopupAction,
} from 'libs/dashboard/src/lib/model/actions/datarun';
import {
  getIsAddingNewEvents,
  getDatarunDetails,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getCurrentEventDetails,
} from '../../../../model/selectors/datarun';

import { FocusChartConstants } from '../Constants';
import { getScale, getWrapperSize, normalizeHanlers } from '../FocusChartUtils';

const { CHART_MARGIN } = FocusChartConstants;

class AddEvents extends Component {
  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState({
      width,
      height,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isAddingNewEvent !== this.props.isAddingNewEvent ||
      prevProps.isEditingEventRange !== this.props.isEditingEventRange
    ) {
      this.renderBrush();
      normalizeHanlers('brush-instance');
    }
  }

  getBrushCoords() {
    const { width, height } = this.state;
    const { currentEventDetails, isEditingEventRange, dataRun, periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord } = getScale(width, height, dataRun.maxTimeSeries);

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
    const { width, height } = this.state;
    const {
      dataRun,
      updateNewEventDetails,
      updateEventDetails,
      periodRange,
      isEditingEventRange,
      isAddingNewEvent,
    } = this.props;
    const { zoomValue } = periodRange;
    const { timeSeries, maxTimeSeries } = dataRun;
    const { xCoord } = getScale(width, height, maxTimeSeries);

    const { brushStart, brushEnd } = this.getBrushCoords();

    if (zoomValue !== undefined && zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const brushContext = d3.select('g.brush-instance');

    const brushInstance = d3
      .brushX()
      .extent([[0, 0], [width - 59, height - 3.5 * CHART_MARGIN]])
      .on('brush start', () => {
        normalizeHanlers('brush-instance');
      })
      .on('brush', () => {
        normalizeHanlers('brush-instance');

        const { newEventDetails } = this.props;
        const [selection_start, selection_end] = d3.event.selection;
        const startIndex =
          timeSeries.findIndex(element => xCoord.invert(selection_start).getTime() - element[0] < 0) - 1;
        const stopIndex = timeSeries.findIndex(element => xCoord.invert(selection_end).getTime() - element[0] < 0);

        if (startIndex !== -1 && stopIndex !== -1) {
          const eventDetails = {
            ...newEventDetails,
            start_time: new Date(timeSeries[startIndex][0]).getTime(),
            stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
          };

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
    const { openEventDetailsPopup, isAddingNewEvent, isEditingEventRange } = this.props;
    return (
      (isAddingNewEvent || isEditingEventRange) && <g className="brush-instance" onClick={openEventDetailsPopup} />
    );
  }
}

export default connect(
  state => ({
    dataRun: getDatarunDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
    periodRange: getSelectedPeriodRange(state),
    isEditingEventRange: getIsEditingEventRange(state),
    currentEventDetails: getCurrentEventDetails(state),
  }),
  dispatch => ({
    updateNewEventDetails: eventDetails => dispatch(updateNewEventDetailsAction(eventDetails)),
    updateEventDetails: eventDetails => dispatch(updateEventDetailsAction(eventDetails)),
    openEventDetailsPopup: () => dispatch(openEventDetailsPopupAction()),
  }),
)(AddEvents);
