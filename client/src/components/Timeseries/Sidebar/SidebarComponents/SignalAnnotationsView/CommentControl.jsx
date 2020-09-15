import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIsSpeechInProgress, getUpdatedEventDetails } from 'src/model/selectors/datarun';
import { filterOptions, formatOptionLabel } from 'src/components/Common/Dropdown';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import {
  recordCommentAction,
  updateEventDetailsAction,
  closeEventModal,
  saveEventDetailsAction,
} from 'src/model/actions/datarun';
import { RecordingIcon, MicrophoneIcon, CloseIcon } from 'src/components/Common/icons';
import Select from 'react-select';
import './CommentControl.scss';

class CommentControl extends Component {
  renderTagBadge() {
    const { tag } = this.props.updatedEventDetails;

    const bgColor = (tag && colorSchemes[tag]) || colorSchemes.Untagged;
    const eventClassName = tag?.replace(/\s/g, '_').toLowerCase() || 'untagged';
    return (
      <div className="badge-wrapper">
        <ul>
          <li>Assign tag</li>
          <li>
            <div style={{ background: bgColor }} className={`evt-tag ${eventClassName}`}>
              <span>{tag}</span>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const {
      eventDetails,
      isSpeechInProgress,
      recordComment,
      updatedEventDetails,
      updateEventDetails,
      closeEventDetails,
      saveEventDetails,
      isChangeTagEnabled,
    } = this.props;

    if (!eventDetails) {
      return null;
    }

    const isEventTagChanged =
      updatedEventDetails.id === eventDetails.id && updatedEventDetails.tag !== eventDetails.tag;

    const commentText = updatedEventDetails.id === eventDetails.id ? updatedEventDetails.commentsDraft : '';
    const isEventCommentChanged = updatedEventDetails.id === eventDetails.id && updatedEventDetails.commentsDraft;
    const isEventChanged = isEventCommentChanged || isEventTagChanged;

    return (
      <div className="comment-wrapper">
        <div className="comment-heading">
          <div className="speech-controls" />
          <ul className="comment-holder">
            <li className="dropdown">
              {isChangeTagEnabled && (
                <Select
                  formatOptionLabel={formatOptionLabel}
                  options={filterOptions}
                  classNamePrefix="tag-options"
                  className="tag-select assign-tag"
                  placeholder="Assign a tag"
                  isMulti={false}
                  isSearchable={false}
                  value="Assing a tag"
                  onChange={(option) => updateEventDetails({ tag: option.value })}
                />
              )}
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
              onChange={(evt) => updateEventDetails({ commentsDraft: evt.target.value })}
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
    );
  }
}

CommentControl.defaultProps = {
  isChangeTagEnabled: true,
};

export default connect(
  (state) => ({
    isSpeechInProgress: getIsSpeechInProgress(state),
    updatedEventDetails: getUpdatedEventDetails(state),
  }),
  (dispatch) => ({
    recordComment: (recordState) => dispatch(recordCommentAction(recordState)),
    updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
    closeEventDetails: () => dispatch(closeEventModal()),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
  }),
)(CommentControl);
