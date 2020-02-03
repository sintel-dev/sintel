import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { setCurrentEventAction, updateEventDetailsAction } from '../../../../model/actions/datarun';
import { getCurrentEventDetails } from '../../../../model/selectors/datarun';
import Loader from '../../../Common/Loader';
import { formatOptionLabel, grouppedOptions, RenderComments, selectedOption } from './eventUtils';
import './EventDetails.scss';

class EventDetails extends Component {
  constructor(...args) {
    super(...args);
    this.changeSeverityTag = this.changeSeverityTag.bind(this);
  }

  changeSeverityTag(option) {
    this.props.updateEventDetails(option);
  }

  render() {
    const { eventDetails, setCurrentEvent } = this.props;

    const isActive = eventDetails ? 'active' : '';
    return (
      <div className={`events-wrapper ${isActive}`}>
        {eventDetails && (
          <div>
            <button type="button" className="close" onClick={setCurrentEvent}>
              x
            </button>
            <div className="row">
              <label>Signal: </label>
              <span>{eventDetails.signal}</span>
            </div>
            <div className="row">
              <label>Severity Score:</label>
              <span>{eventDetails.score}</span>
            </div>
            <div className="row">
              <label>From:</label>
              <span>{eventDetails.start_time}</span>
            </div>
            <div className="row">
              <label>To:</label>
              <span>{eventDetails.stop_time}</span>
              <button type="button" className="edit danger">
                Modify
              </button>
            </div>
            <div className="row select-holder">
              <Select
                onChange={this.changeSeverityTag}
                formatOptionLabel={formatOptionLabel}
                options={grouppedOptions}
                className="tag-select"
                classNamePrefix="tag-options"
                placeholder="Select a tag"
                value={selectedOption(eventDetails.tag)}
              />
            </div>
            <div className="row form-group">
              <label htmlFor="comment">Comment</label>
              <div className="comment-area">
                <div className="comment-wrapper scroll-style">
                  <Loader isLoading={eventDetails.isCommentsLoading}>
                    <RenderComments comments={eventDetails.eventComments} />
                  </Loader>
                </div>
                <textarea id="comment" placeholder="Enter your comment..." />
              </div>
            </div>
            <div className="row ">
              <ul>
                <li>
                  <button type="button" className="danger">
                    Delete
                  </button>
                </li>
                <li>
                  <button type="button">Save</button>
                </li>
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
  setCurrentEvent: PropTypes.func,
  updateEventDetails: PropTypes.func,
};

export default connect(
  state => ({
    eventDetails: getCurrentEventDetails(state),
  }),
  dispatch => ({
    setCurrentEvent: () => dispatch(setCurrentEventAction(null)),
    updateEventDetails: details => dispatch(updateEventDetailsAction(details)),
  }),
)(EventDetails);
