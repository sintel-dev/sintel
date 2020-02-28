import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';

import {
  updateEventDetailsAction,
  saveEventDetailsAction,
  isEditingEventRangeAction,
  closeEventModal,
  deleteEventAction,
  updateNewEventDetailsAction,
} from '../../../../model/actions/datarun';

import {
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getIsEditingEventRange,
  getIsPopupOpen,
  getNewEventDetails,
  getIsAddingNewEvents,
} from '../../../../model/selectors/datarun';

import Loader from '../../../Common/Loader';
import { formatOptionLabel, grouppedOptions, RenderComments, selectedOption } from './eventUtils';
import './EventDetails.scss';

const EventDetails = ({
  eventDetails,
  updatedEventDetails,
  updateEventDetails,
  closeEventDetails,
  saveEventDetails,
  editEventRange,
  isEditingEventRange,
  isPopupOpen,
  deleteEvent,
  newEventDetails,
  isAddingNewEvent,
  updateNewEventDetails,
}) => {
  const currentEventDetails = isAddingNewEvent ? newEventDetails : eventDetails;
  const isActive = currentEventDetails && !isEditingEventRange && isPopupOpen ? 'active' : '';

  const changeEventTag = tag => {
    if (isAddingNewEvent) {
      updateNewEventDetails({ tag: tag.label });
    } else {
      updateEventDetails({ tag: tag.label });
    }
  };

  // @TODO - later implementation of saving new event comments
  const updateEventComments = comments => {
    if (isAddingNewEvent) {
      updateNewEventDetails({ comments });
    } else {
      updateEventDetails({ comments });
    }
  };

  return (
    <div className={`events-wrapper ${isActive}`}>
      {currentEventDetails && (
        <div>
          <button type="button" className="close" onClick={closeEventDetails}>
            x
          </button>
          <div className="row">
            <label>Signal: </label>
            <span>{currentEventDetails.signal}</span>
          </div>
          <div className="row">
            <label>Severity Score:</label>
            <span>{currentEventDetails.score}</span>
          </div>
          <div className="row">
            <label>From:</label>
            <span>{new Date(currentEventDetails.start_time).toUTCString()}</span>
          </div>
          <div className="row">
            <label>To:</label>
            <span>{new Date(currentEventDetails.stop_time).toUTCString()}</span>
            <button type="button" className="edit danger" onClick={() => editEventRange(true)}>
              Modify
            </button>
          </div>
          <div className="row select-holder">
            <Select
              onChange={tag => changeEventTag(tag)}
              formatOptionLabel={formatOptionLabel}
              options={grouppedOptions}
              className="tag-select"
              classNamePrefix="tag-options"
              placeholder="Select a tag"
              value={selectedOption(currentEventDetails.tag)}
            />
          </div>
          <div className="row form-group">
            <label htmlFor="comment">Comment</label>
            <div className="comment-area">
              <div className="comment-wrapper scroll-style">
                {(!isAddingNewEvent && (
                  <Loader isLoading={currentEventDetails.isCommentsLoading}>
                    <RenderComments comments={currentEventDetails.eventComments.comments} />
                  </Loader>
                )) || <p>Comments can be added after saving event</p>}
              </div>
              <textarea
                id="comment"
                placeholder="Enter your comment..."
                value={updatedEventDetails.comments}
                onChange={event => updateEventComments(event.target.value)}
                readOnly={isAddingNewEvent}
              />
            </div>
          </div>
          <div className="row ">
            <ul>
            {!isAddingNewEvent && <li>
                <button type="button" className="danger" onClick={deleteEvent}>
                  Delete
                </button>
              </li>}
              <li>
                <button type="button" onClick={saveEventDetails}>
                  Save
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

EventDetails.propTypes = {
  eventDetails: PropTypes.object,
  closeEventDetails: PropTypes.func,
  updateEventDetails: PropTypes.func,
  saveEventDetails: PropTypes.func,
};

export default connect(
  state => ({
    eventDetails: getCurrentEventDetails(state),
    updatedEventDetails: getUpdatedEventsDetails(state),
    isEditingEventRange: getIsEditingEventRange(state),
    isPopupOpen: getIsPopupOpen(state),
    newEventDetails: getNewEventDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
  }),
  dispatch => ({
    closeEventDetails: () => dispatch(closeEventModal()),
    updateEventDetails: details => dispatch(updateEventDetailsAction(details)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    editEventRange: eventState => dispatch(isEditingEventRangeAction(eventState)),
    deleteEvent: () => dispatch(deleteEventAction()),
    updateNewEventDetails: details => dispatch(updateNewEventDetailsAction(details)),
  }),
)(EventDetails);
