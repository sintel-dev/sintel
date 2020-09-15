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

class SignalAnnotations extends Component {
  renderEventDetails() {
    const { dataRun, eventDetails, setActiveEvent, activeEvent } = this.props;
    const { events } = dataRun;

    const toggleEventState = (eventID) => (activeEvent === eventID ? setActiveEvent(null) : setActiveEvent(eventID));

    return events.length ? (
      <div className="signals-wrapper scroll-style">
        {events.map((currentEvent) => {
          const { id, tag, start_time, stop_time } = currentEvent;
          const color = currentEvent && currentEvent.tag ? colorSchemes[currentEvent.tag] : colorSchemes.Untagged;
          const eventClassName = tag?.replace(/\s/g, '_').toLowerCase() || 'untagged';

          return (
            <div key={id} className="annotation-wrapper" id={`_${id}_details`}>
              <div className="annotation-heading" onClick={() => toggleEventState(id)}>
                <div className="annotation-wrapper-left">
                  <span className={`evt-tag ${eventClassName}`} style={{ backgroundColor: color }}>
                    {tag || 'Untagged'}
                  </span>
                </div>
                <div className="annotation-wrapper-right">
                  <ul className="event-time-range">
                    <li>
                      <span>Starts:</span> {timestampToDate(start_time * 1000)}
                    </li>
                    <li>Ends: {timestampToDate(stop_time * 1000)}</li>
                  </ul>
                </div>
                <div>
                  <button type="button">
                    {eventDetails && eventDetails.id === id ? <TriangleUp /> : <TriangleDown />}
                  </button>
                </div>
              </div>
              <div className="collapsible-wrapper">
                <Collapse isOpened={eventDetails && eventDetails.id === id}>
                  <EventComments />
                  <CommentControl eventDetails={currentEvent} />
                </Collapse>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="no-event">
        <p>No annotations found</p>
      </div>
    );
  }

  render() {
    return this.renderEventDetails();
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
