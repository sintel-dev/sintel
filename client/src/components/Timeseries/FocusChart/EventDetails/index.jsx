import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamation, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { toggleSimilarShapesModalAction } from 'src/model/actions/similarShapes';
import { getIsSimilarShapesModalOpen } from 'src/model/selectors/similarShapes';
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
import { toggleAggregationModal } from '../../../../model/actions/aggregationLevels';
import Loader from '../../../Common/Loader';
import { RenderComments, selectedOption } from './eventUtils';
import AggregationLevels from '../../AggregationLevels';
import Dropdown from '../../../Common/Dropdown';
import { CloseIcon } from '../../../Common/icons';
// import { CloseIcon, SearchIcon, AggregationIcon } from '../../../Common/icons';
import './EventDetails.scss';

// const renderInfoTooltip = () => (
//   <div className="tooltip-info">
//     <p>Insert a score between 0 to 10</p>
//     <ul>
//       <li>0 - not severe</li>
//       <li>10 - most severe</li>
//     </ul>
//   </div>
// );
export class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTooltipVisible: false,
      pos: { x: 0, y: 0 },
      dragging: false,
      rel: null, // position relative to the cursor
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dragging && !prevState.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && prevState.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseDown = (e) => {
    // only left mouse button
    if (e.button !== 0) return;
    this.setState({
      dragging: true,
      rel: {
        x: e.pageX - this.wrapper.offsetLeft,
        y: e.pageY - this.wrapper.offsetTop,
      },
    });
    e.stopPropagation();
    e.preventDefault();
  };

  onMouseUp = (e) => {
    this.setState({ dragging: false });
    e.stopPropagation();
    e.preventDefault();
  };

  onMouseMove = (e) => {
    if (!this.state.dragging) return;
    this.setState({
      pos: {
        x: e.pageX - this.state.rel.x,
        y: e.pageY - this.state.rel.y,
      },
    });
    e.stopPropagation();
    e.preventDefault();
  };

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
      // toggleAggregationLevels,
      // toggleSimilarShapesModal,
      // isSimilarShapesOpen,
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

    // const updateEventScore = ({ target }) => {
    //   const eventScore = target.value;
    //   if (!isNaN(eventScore) && eventScore <= 10) {
    //     updateEventDetails({ score: eventScore });
    //   }
    // };

    return (
      <div className="events-wrapper-overflow">
        <div
          className={`events-wrapper ${isActive} scroll-style`}
          ref={(c) => (this.wrapper = c)}
          style={{ left: `${this.state.pos.x}px`, top: `${this.state.pos.y}px` }}
        >
          {currentEventDetails && (
            <div className="events-header" onMouseDown={this.onMouseDown}>
              <button
                type="button"
                className="back-position"
                title="Move back to the original position"
                onClick={() => {
                  this.setState({ pos: { x: 0, y: 0 } });
                }}
              >
                o
              </button>
            </div>
          )}
          {currentEventDetails && (
            <div className="events-body" ref={(c) => (this.ebody = c)}>
              <button type="button" className="close" onClick={closeEventDetails}>
                <CloseIcon />
              </button>
              {/* <div className="event-row">
              <label>Signal: </label>
              <span>{currentEventDetails.signal}</span>
            </div> */}
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
                <label>Source:</label>
                <span>{currentEventDetails.source}</span>
              </div>
              {/* <div className="event-row">
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
                <i
                  className="score-info"
                  onMouseOver={() => this.setState({ isTooltipVisible: true })}
                  onMouseLeave={() => this.setState({ isTooltipVisible: false })}
                >
                  i
                </i>
              </div> */}
              <div className="event-row ">
                <div className="select-holder">
                  <Dropdown
                    onChange={(tag) => changeEventTag(tag)}
                    value={selectedOption(currentEventDetails.tag)}
                    isGrouppedOptions
                  />
                </div>
                <div className="search-similar">
                  {/* <button type="button" onClick={() => toggleAggregationLevels(true)} title="Signal Aggregation Levels">
                  <AggregationIcon />
                </button>{' '}
                <button type="button" onClick={() => toggleSimilarShapesModal(true)} disabled={isSimilarShapesOpen}>
                  <SearchIcon />
                </button> */}
                </div>
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
          <AggregationLevels />
        </div>
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
    isSimilarShapesOpen: getIsSimilarShapesModalOpen(state),
  }),
  (dispatch) => ({
    closeEventDetails: () => dispatch(closeEventModal()),
    updateEventDetails: (details) => dispatch(updateEventDetailsAction(details)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    editEventRange: (eventState) => dispatch(isEditingEventRangeAction(eventState)),
    deleteEvent: () => dispatch(deleteEventAction()),
    updateNewEventDetails: (details) => dispatch(updateNewEventDetailsAction(details)),
    recordComment: () => dispatch(recordCommentAction()),
    toggleAggregationLevels: (state) => dispatch(toggleAggregationModal(state)),
    toggleSimilarShapesModal: (modalState) => dispatch(toggleSimilarShapesModalAction(modalState)),
  }),
)(EventDetails);
