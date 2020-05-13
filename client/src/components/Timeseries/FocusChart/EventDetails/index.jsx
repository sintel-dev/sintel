import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamation, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import {
  updateEventDetailsAction,
  saveEventDetailsAction,
  isEditingEventRangeAction,
  closeEventModal,
  deleteEventAction,
  updateNewEventDetailsAction,
  recordCommentAction,
} from '../../../../model/actions/datarun';

import {
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getIsEditingEventRange,
  getIsPopupOpen,
  getNewEventDetails,
  getIsAddingNewEvents,
  getUpdateEventStatus,
  getIsTranscriptSupported,
  getIsSpeechInProgress,
} from '../../../../model/selectors/datarun';

import Loader from '../../../Common/Loader';
import { formatOptionLabel, grouppedOptions, RenderComments, selectedOption } from './eventUtils';
import './EventDetails.scss';

const renderInfoTooltip = () => (
  <div className="tooltip-info">
    <p>Insert a score between 0 to 10</p>
    <ul>
      <li>0 - not severe</li>
      <li>10 - most severe</li>
    </ul>
  </div>
);
export class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTooltipVisible: false,
    };
  }

  render() {
    const {
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
      eventUpdateStatus,
      recordComment,
      isTranscriptSupported,
      isSpeechInProgress,
    } = this.props;

    const currentEventDetails = isAddingNewEvent ? newEventDetails : eventDetails;
    const isActive = currentEventDetails && !isEditingEventRange && isPopupOpen ? 'active' : '';

    const changeEventTag = (tag) => {
      if (isAddingNewEvent) {
        updateNewEventDetails({ tag: tag.label });
      } else {
        updateEventDetails({ tag: tag.label });
      }
    };

    const updateEventScore = ({ target }) => {
      const eventScore = target.value;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(eventScore) && eventScore <= 10) {
        updateEventDetails({ score: eventScore });
      }
    };

    return (
      <div className={`events-wrapper scroll-style ${isActive}`}>
        {currentEventDetails && (
          <div>
            <button type="button" className="close" onClick={closeEventDetails}>
              x
            </button>
            <div className="event-row">
              <label>Signal: </label>
              <span>{currentEventDetails.signal}</span>
            </div>
            <div className="event-row">
              <label>Severity Score:</label>
              <span>{currentEventDetails.score}</span>
            </div>
            <div className="event-row">
              <label>From:</label>
              <span>{new Date(currentEventDetails.start_time).toUTCString()}</span>
            </div>
            <div className="event-row">
              <label>To:</label>
              <span>{new Date(currentEventDetails.stop_time).toUTCString()}</span>
              <button type="button" className="edit danger" onClick={() => editEventRange(true)}>
                Modify
              </button>
            </div>
            <div className="event-row">
              {this.state.isTooltipVisible && renderInfoTooltip()}
              <label htmlFor="sevScore">Severity Score: </label>
              <input
                type="text"
                name="severity-score"
                id="sevScore"
                maxLength="2"
                value={currentEventDetails.score}
                onChange={(event) => updateEventScore(event)}
                placeholder="-"
              />
              {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
              <i
                className="score-info"
                onMouseOver={() => this.setState({ isTooltipVisible: true })}
                onMouseLeave={() => this.setState({ isTooltipVisible: false })}
              >
                i
              </i>
            </div>
            <div className="event-row select-holder">
              <Select
                onChange={(tag) => changeEventTag(tag)}
                formatOptionLabel={formatOptionLabel}
                options={grouppedOptions}
                className="tag-select"
                classNamePrefix="tag-options"
                placeholder="Select a tag"
                value={selectedOption(currentEventDetails.tag)}
              />
            </div>
            <div className="event-row form-group">
              <ul className="form-intro">
                <li>
                  <label htmlFor="comment">Comment</label>
                </li>
                <li>
                  {isTranscriptSupported && (
                    <button type="button" onClick={() => recordComment()} disabled={isSpeechInProgress}>
                      <FontAwesomeIcon icon={faMicrophone} />
                    </button>
                  )}
                </li>
              </ul>

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
                  value={updatedEventDetails.commentsDraft}
                  onChange={(event) => updateEventDetails({ commentsDraft: event.target.value })}
                  readOnly={isAddingNewEvent}
                />
              </div>
            </div>
            <div className="event-row">
              <ul className="btn-wrapper">
                {!isAddingNewEvent && (
                  <li>
                    <button type="button" className="danger" onClick={deleteEvent}>
                      Delete
                    </button>
                  </li>
                )}
                <li>
                  <button type="button" onClick={saveEventDetails}>
                    Save
                  </button>
                </li>
                {eventUpdateStatus !== null && (
                  <li>
                    {eventUpdateStatus === 'success' ? (
                      <p className="success">
                        <FontAwesomeIcon icon={faCheck} />
                        Event successfuly saved
                      </p>
                    ) : (
                      <p className="error">
                        <FontAwesomeIcon icon={faExclamation} />
                        Event update error
                      </p>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
}

EventDetails.propTypes = {
  eventDetails: PropTypes.object,
  closeEventDetails: PropTypes.func,
  updateEventDetails: PropTypes.func,
  saveEventDetails: PropTypes.func,
};

export default connect(
  (state) => ({
    eventDetails: getCurrentEventDetails(state),
    updatedEventDetails: getUpdatedEventsDetails(state),
    isEditingEventRange: getIsEditingEventRange(state),
    isPopupOpen: getIsPopupOpen(state),
    newEventDetails: getNewEventDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
    eventUpdateStatus: getUpdateEventStatus(state),
    isTranscriptSupported: getIsTranscriptSupported(state),
    isSpeechInProgress: getIsSpeechInProgress(state),
  }),
  (dispatch) => ({
    closeEventDetails: () => dispatch(closeEventModal()),
    updateEventDetails: (details) => dispatch(updateEventDetailsAction(details)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    editEventRange: (eventState) => dispatch(isEditingEventRangeAction(eventState)),
    deleteEvent: () => dispatch(deleteEventAction()),
    updateNewEventDetails: (details) => dispatch(updateNewEventDetailsAction(details)),
    recordComment: () => dispatch(recordCommentAction()),
  }),
)(EventDetails);
