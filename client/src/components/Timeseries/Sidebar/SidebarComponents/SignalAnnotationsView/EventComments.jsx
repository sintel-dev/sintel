import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentEventDetails } from 'src/model/selectors/datarun';
import Loader from 'src/components/Common/Loader';
import { getUsersData, getIsUsersDataloading } from 'src/model/selectors/users';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { MAX_EVENTS_ACTIVITY } from '../../SidebarUtils';
import './EventComments.scss';

class EventComments extends Component {
  findUser(userID) {
    const { usersData } = this.props;
    debugger;
    return usersData.filter((user) => user.user_id === userID)[0];
  }

  renderComment(eventDetails) {
    const { eventComments } = eventDetails;
    const { comments } = eventComments;

    if (comments === undefined || !comments.length) {
      return <p>This event has no comments yet.</p>;
    }

    const maxActivity = comments.slice(Math.max(comments.length - MAX_EVENTS_ACTIVITY, 0));

    return maxActivity.map((currentComment) => {
      const userData = this.findUser(currentComment.created_by);
      return (
        <div key={currentComment.id} className="user-activity">
          <table width="100%">
            <tbody>
              <tr>
                <td rowSpan="2" width="40">
                  <img src={userData.picture} referrerPolicy="no-referrer" />
                </td>
                <td>
                  <strong>{userData.name}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <p>{currentComment.text}</p>
                </td>
              </tr>
              <tr>
                <td colSpan="2">{timestampToDate(currentComment.insert_time)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    });
  }
  render() {
    const { eventDetails, isUsersDataLoading } = this.props;

    const eventActivity =
      (eventDetails &&
        eventDetails.eventComments &&
        eventDetails.eventComments.comments &&
        eventDetails.eventComments.comments.length) ||
      0;

    const maxActivity = Math.min(eventActivity, MAX_EVENTS_ACTIVITY);

    return (
      eventDetails && (
        <div className="event-data">
          <div className="event-comments scroll-style">
            <Loader isLoading={eventDetails.isCommentsLoading || isUsersDataLoading}>
              {this.renderComment(eventDetails)}
            </Loader>
          </div>
          <div className="event-jump">
            <ul>
              <li>
                Showing <strong>{maxActivity} most recent</strong> - to see more details
              </li>
              <li>
                <button type="button">Go to Event Details</button>
              </li>
            </ul>
          </div>
        </div>
      )
    );
  }
}

export default connect((state) => ({
  eventDetails: getCurrentEventDetails(state),
  usersData: getUsersData(state),
  isUsersDataLoading: getIsUsersDataloading(state),
}))(EventComments);
