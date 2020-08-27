import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import { TriangleDown, TriangleUp } from 'src/components/Common/icons';
import { Collapse } from 'react-collapse';
import { getSelectedDatarun, getCurrentEventDetails, getActiveEventID } from 'src/model/selectors/datarun';

import { setActiveEventAction } from 'src/model/actions/datarun';

import EventComments from './EventComments';
import './SignalAnnotations.scss';
import CommentControl from './CommentControl';

window.addEventListener('click', function (evt) {
  const dropdown = document.querySelector('.assign-tag');

  dropdown && !dropdown.contains(evt.target) && document.querySelector('.filters').classList.remove('active');
  return null;
});

class SignalAnnotations extends Component {
  renderEventDetails() {
    const { dataRun, eventDetails, setActiveEvent, activeEvent } = this.props;
    const { events } = dataRun;

    const toggleEventState = (eventID) => (activeEvent === eventID ? setActiveEvent(null) : setActiveEvent(eventID));

    return events.length ? (
      events.map((currentEvent) => {
        const color = currentEvent && currentEvent.tag ? colorSchemes[currentEvent.tag] : colorSchemes.Untagged;
        const eventClassName =
          (currentEvent && currentEvent.tag && currentEvent.tag.replace(/\s/g, '_').toLowerCase()) || 'untagged';

        return (
          <div key={currentEvent.id} className="annotation-wrapper">
            <div className="annotation-heading" onClick={() => toggleEventState(currentEvent.id)}>
              <div className="annotation-wrapper-left">
                <span className={`evt-tag ${eventClassName}`} style={{ backgroundColor: color }}>
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
                <EventComments />
                <CommentControl eventDetails={currentEvent} />
              </Collapse>
            </div>
          </div>
        );
      })
    ) : (
      <div className="annotation-wrapper">
        <div className="annotation-heading">
          <p>No annotations found</p>
        </div>
      </div>
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
    activeEvent: getActiveEventID(state),
  }),
  (dispatch) => ({
    setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
  }),
)(SignalAnnotations);
