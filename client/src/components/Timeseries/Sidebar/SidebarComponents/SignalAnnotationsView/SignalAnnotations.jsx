import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import { TriangleDown, TriangleUp, MicrophoneIcon, CloseIcon, RecordingIcon } from 'src/components/Common/icons';
import { Collapse } from 'react-collapse';
import {
  getSelectedDatarun,
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getIsSpeechInProgress,
} from 'src/model/selectors/datarun';

import { filterOptions } from 'src/components/Common/Dropdown';
import {
  setActiveEventAction,
  updateEventDetailsAction,
  saveEventDetailsAction,
  closeEventModal,
  recordCommentAction,
} from 'src/model/actions/datarun';
import { getSelectedExperimentData } from 'src/model/selectors/experiment';
import { getActiveEventID } from 'src/model/selectors/datarun';
import EventComments from './EventComments';
import './SignalAnnotations.scss';

window.addEventListener('click', function (evt) {
  const dropdown = document.querySelector('.assign-tag');

  dropdown && !dropdown.contains(evt.target) && document.querySelector('.filters').classList.remove('active');
  return null;
});

class SignalAnnotations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFilterOpen: false,
      changedEventProps: {
        eventID: null,
        eventTag: null,
      },
    };
  }

  updateEventTag(eventID, newTag) {
    const { updateEventDetails, eventDetails } = this.props;
    this.setState({
      isFilterOpen: false,
      changedEventProps: {
        eventID,
        eventTag: newTag,
      },
    });
    updateEventDetails({ tag: newTag });
  }

  toggleFilterState() {
    const { isFilterOpen } = this.state;
    this.setState({
      isFilterOpen: !isFilterOpen,
    });
  }

  renderTagBadge() {
    const { tag } = this.props.updatedEventDetails;

    const bgColor = colorSchemes[tag];
    const eventClassName = tag.replace(/\s/g, '_').toLowerCase() || 'untagged';
    return (
      <div className="badge-wrapper">
        <ul>
          <li>Assign tag</li>
          <li>
            <div style={{ background: bgColor }} className={`tag-wrapper ${eventClassName}`}>
              <span>{tag}</span>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  renderEventControls(event) {
    const { isFilterOpen } = this.state;
    const {
      saveEventDetails,
      closeEventDetails,
      updatedEventDetails,
      updateEventDetails,
      eventDetails,
      recordComment,
      isSpeechInProgress,
    } = this.props;
    const isEventTagChanged = updatedEventDetails.id === event.id && updatedEventDetails.tag !== event.tag;
    const isEventCommentChanged = updatedEventDetails.id === event.id && updatedEventDetails.commentsDraft;
    const isEventChanged = isEventCommentChanged || isEventTagChanged;

    const commentText = updatedEventDetails.id === event.id ? updatedEventDetails.commentsDraft : '';
    const sortedFilters = eventDetails
      ? filterOptions.filter((currentFilter) => currentFilter.value !== eventDetails.tag)
      : filterOptions;

    return (
      <div>
        <EventComments eventDetails={eventDetails} />
        <div className="comment-wrapper">
          <div className="comment-heading">
            <div className="speech-controls"></div>
            <ul className="comment-holder">
              <li className="dropdown">
                <button type="button" className="clean assign-tag" onClick={() => this.toggleFilterState()}>
                  Assign a tag
                </button>
                <ul className={`filters ${isFilterOpen ? 'active' : ''}`}>
                  {sortedFilters.map((currentFilter) => {
                    return (
                      <li
                        key={currentFilter.value}
                        onClick={() => this.updateEventTag(eventDetails.id, currentFilter.value)}
                      >
                        <i className="badge" style={{ background: colorSchemes[currentFilter.value] }} />{' '}
                        <span>{currentFilter.value}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li>
                <button className="clean" type="button" onClick={() => recordComment(!isSpeechInProgress)}>
                  {isSpeechInProgress ? <RecordingIcon /> : <MicrophoneIcon />}
                </button>
              </li>
            </ul>
          </div>
          <div className="comment-content">
            {isEventTagChanged ? (
              this.renderTagBadge()
            ) : (
              <textarea
                value={commentText}
                onChange={(event) => updateEventDetails({ commentsDraft: event.target.value })}
                placeholder="Enter your comment..."
              />
            )}
            <div className="event-actions">
              <ul>
                {isEventTagChanged && (
                  <li>
                    <button className="clean close" type="button" onClick={closeEventDetails}>
                      <CloseIcon />
                    </button>
                  </li>
                )}
                <li>
                  <button type="button" onClick={saveEventDetails} disabled={!isEventChanged}>
                    Enter
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderEventDetails() {
    const { dataRun, eventDetails, setActiveEvent, activeEvent } = this.props;
    const { events } = dataRun;

    const toggleEventState = (eventID) => {
      return activeEvent === eventID ? setActiveEvent(null) : setActiveEvent(eventID);
    };

    return (
      events.length &&
      events.map((currentEvent) => {
        const color = currentEvent.tag ? colorSchemes[currentEvent.tag] : colorSchemes['Untagged'];
        const eventClassName =
          (currentEvent && currentEvent.tag && currentEvent.tag.replace(/\s/g, '_').toLowerCase()) || 'untagged';

        return (
          <div key={currentEvent.id} className="annotation-wrapper">
            <div className="annotation-heading" onClick={() => toggleEventState(currentEvent.id)}>
              <div className="annotation-wrapper-left">
                <span className={`tag-wrapper ${eventClassName}`} style={{ backgroundColor: color }}>
                  {currentEvent.tag || 'Untagged'}
                </span>
              </div>
              <div className="annotation-wrapper-right">
                <ul className="event-time-range">
                  <li>
                    <span>Starts:</span> {timestampToDate(currentEvent.start_time * 1000)}
                  </li>
                  <li>Ends: {timestampToDate(currentEvent.stop_time * 1000)}</li>
                </ul>
              </div>
              <div>
                <button type="button">
                  {eventDetails && eventDetails.id === currentEvent.id ? <TriangleUp /> : <TriangleDown />}
                </button>
              </div>
            </div>
            <div className="collapsible-wrapper">
              <Collapse isOpened={eventDetails && eventDetails.id === currentEvent.id}>
                {this.renderEventControls(currentEvent)}
              </Collapse>
            </div>
          </div>
        );
      })
    );
  }

  render() {
    return <div className="signals-wrapper scroll-style">{this.renderEventDetails()}</div>;
  }
}

export default connect(
  (state) => ({
    eventDetails: getCurrentEventDetails(state),
    dataRun: getSelectedDatarun(state),
    experimentData: getSelectedExperimentData(state),
    updatedEventDetails: getUpdatedEventsDetails(state),
    isSpeechInProgress: getIsSpeechInProgress(state),
    activeEvent: getActiveEventID(state),
  }),
  (dispatch) => ({
    setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
    updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    closeEventDetails: () => dispatch(closeEventModal()),
    recordComment: (recordState) => dispatch(recordCommentAction(recordState)),
  }),
)(SignalAnnotations);
