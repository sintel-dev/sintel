import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import {
  setCurrentEventAction,
  updateEventDetailsAction,
  saveEventDetailsAction,
} from '../../../../model/actions/datarun';
import { getCurrentEventDetails, getUpdatedEventsDetails } from '../../../../model/selectors/datarun';
import Loader from '../../../Common/Loader';
import { formatOptionLabel, grouppedOptions, RenderComments, selectedOption } from './eventUtils';
import './EventDetails.scss';

const EventDetails = ({
  eventDetails,
  updatedEventDetails,
  closeEventDetails,
  updateEventDetails,
  saveEventDetails,
}) => {
  const isActive = eventDetails ? 'active' : '';
  return (
    <div className={`events-wrapper ${isActive}`}>
      {eventDetails && (
        <div>
          <button type="button" className="close" onClick={closeEventDetails}>
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
              onChange={tag => updateEventDetails({ tag: tag.label })}
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
                  <RenderComments comments={eventDetails.eventComments.comments} />
                </Loader>
              </div>
              <textarea
                id="comment"
                placeholder="Enter your comment..."
                value={updatedEventDetails.comments}
                onChange={event => updateEventDetails({ comments: event.target.value })}
              />
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
  }),
  dispatch => ({
    closeEventDetails: () => dispatch(setCurrentEventAction(null)),
    updateEventDetails: details => dispatch(updateEventDetailsAction(details)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
  }),
)(EventDetails);
