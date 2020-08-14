import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentEventDetails } from 'src/model/selectors/datarun';
import './EventComments.scss';
import Loader from 'src/components/Common/Loader';

class EventComments extends Component {
  renderComment(eventDetails) {
    const { eventComments } = eventDetails;
    const { comments } = eventComments;

    if (comments === undefined || !comments.length) {
      return <p>This event has no comments yet.</p>;
    }

    return comments.map((currentComment) => <p key={currentComment.id}>{currentComment.text}</p>);
  }
  render() {
    const { eventDetails } = this.props;
    return (
      eventDetails && (
        <div className="event-comments">
          <Loader isLoading={eventDetails.isCommentsLoading}>{this.renderComment(eventDetails)}</Loader>
        </div>
      )
    );
  }
}

export default connect((state) => ({
  eventDetails: getCurrentEventDetails(state),
}))(EventComments);
