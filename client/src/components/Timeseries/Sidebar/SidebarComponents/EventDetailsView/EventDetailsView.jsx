import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  getCurrentEventDetails,
  getUpdatedEventDetails,
  getIsAddingNewEvents,
  getNewEventDetails,
} from 'src/model/selectors/datarun';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import Dropdown from 'src/components/Common/Dropdown';
import {
  updateEventDetailsAction,
  isEditingEventRangeAction,
  saveEventDetailsAction,
  deleteEventAction,
  setActiveEventAction,
} from 'src/model/actions/datarun';

import { selectedOption } from './eventUtils';
import EventComments from '../SignalAnnotationsView/EventComments';
import CommentControl from '../SignalAnnotationsView/CommentControl';
import './EventDetails.scss';

class EventDetailsView extends Component {
  noEventToRender() {
    return (
      <div className="no-event">
        <p>Please select an event in order to see details</p>
      </div>
    );
  }

  renderEventHeader() {
    const { eventDetails, updateEventDetails, editEventRange, newEventDetails, isAddingNewEvent } = this.props;
    const currentEvent = isAddingNewEvent ? newEventDetails : eventDetails;
    const { start_time, stop_time, score, tag } = currentEvent;

    return (
      <div className="evt-ops">
        <div className="evt-detail">
          <div className="detail">
            <p>From</p>
            {timestampToDate(start_time)}
          </div>
          <div className="detail">
            <p>
              <label htmlFor="sevScore">Severity Score</label>
            </p>
            <input
              type="text"
              name="severity-score"
              id="sevScore"
              maxLength="2"
              placeholder="-"
              value={score}
              onChange={(evt) => updateEventDetails({ score: evt.target.value })}
            />
          </div>
        </div>
        <div className="evt-detail">
          <div className="detail">
            <p>To</p>
            {timestampToDate(stop_time)}
            <button type="button" className="clean evt-edit" onClick={() => editEventRange(true)}>
              Edit time
            </button>
          </div>
          <div className="detail">
            <p>Tag</p>
            <Dropdown
              value={selectedOption(tag)}
              onChange={(evtTag) => updateEventDetails({ tag: evtTag.label })}
              isGrouppedOptions
            />
          </div>
        </div>
      </div>
    );
  }

  renderEventFooter() {
    const { saveEventDetails, deleteEvent, setActiveEvent } = this.props;
    return (
      <div className="evt-footer">
        <ul>
          <li>
            <button type="button" className="clean delete" onClick={deleteEvent}>
              Delete
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <button type="button" className="clean" onClick={() => setActiveEvent(null)}>
              Cancel
            </button>
          </li>
          <li>
            <button type="button" className="save" onClick={saveEventDetails}>
              Save changes
            </button>
          </li>
        </ul>
      </div>
    );
  }

  renderEventDetails(eventDetails) {
    const { isAddingNewEvent } = this.props;
    return (
      <div>
        <div className="evt-row">{this.renderEventHeader()}</div>
        {!isAddingNewEvent && (
          <div className="evt-row evt-actions">
            <EventComments isEventJumpVisible={false} />
            <CommentControl isChangeTagEnabled={false} eventDetails={eventDetails} />
          </div>
        )}
        {this.renderEventFooter()}
      </div>
    );
  }

  render() {
    const { eventDetails, isAddingNewEvent, newEventDetails } = this.props;
    const currentEventDetails = isAddingNewEvent ? newEventDetails : eventDetails;
    return (
      <div className="event-details">
        {currentEventDetails ? this.renderEventDetails(currentEventDetails) : this.noEventToRender()}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    eventDetails: getCurrentEventDetails(state),
    updatedEventDetails: getUpdatedEventDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
    newEventDetails: getNewEventDetails(state),
  }),
  (dispatch) => ({
    updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
    editEventRange: (eventState) => dispatch(isEditingEventRangeAction(eventState)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    deleteEvent: () => dispatch(deleteEventAction()),
    setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
  }),
)(EventDetailsView);
