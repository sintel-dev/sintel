import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getCurrentEventDetails, getEventSortedHistory } from 'src/model/selectors/datarun';
import Loader from 'src/components/Common/Loader';
import { getCurrentEventHistoryAction } from 'src/model/actions/events';
import { getUsersData, getIsUsersDataloading } from 'src/model/selectors/users';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { setActivePanelAction } from 'src/model/actions/sidebar';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import { MAX_EVENTS_ACTIVITY } from '../../SidebarUtils';
import './EventComments.scss';

class EventComments extends Component {
  componentDidUpdate() {
    const { eventDetails } = this.props;
    const lastActivity =
      eventDetails && document.querySelector(`#_${eventDetails.id}_details .user-activity.last-activity`);
    const scrollTo = (eventDetails && document.querySelector(`#_${eventDetails.id}_details`)) || null;

    scrollTo && scrollTo.scrollIntoView();
    lastActivity && lastActivity.scrollIntoView();
  }

  findUser(userName) {
    const { usersData } = this.props;
    return usersData.filter((user) => user.name === userName)[0];
  }

  renderEventComment(eventComment, userData, isLastItem) {
    const { id, insert_time, text } = eventComment;
    return (
      <div key={id} className={`user-activity ${(isLastItem && 'last-activity') || ''}`}>
        <table width="99%">
          <tbody>
            <tr>
              <td rowSpan="2" width="40" valign="top">
                <img src={userData.picture} referrerPolicy="no-referrer" alt={userData.name} />
              </td>
              <td>
                <strong>{userData.name}</strong> {timestampToDate(insert_time)}
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <p>{text}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  renderEventTag(currentEvent, userData, isLastItem) {
    const { tag, insert_time } = currentEvent;
    const color = tag ? colorSchemes[tag] : colorSchemes.Untagged;
    const eventClassName = (tag && tag.replace(/\s/g, '_').toLowerCase()) || 'untagged';

    return (
      <div key={currentEvent.id} className={`user-activity ${(isLastItem && 'last-activity') || ''}`}>
        <table width="100%">
          <tbody>
            <tr>
              <td rowSpan="2" width="40" className="align-top">
                <img src={userData.picture} referrerPolicy="no-referrer" alt={userData.name} />
              </td>
              <td>
                <strong>{userData.name}</strong>
              </td>
              <td>{timestampToDate(insert_time)}</td>
            </tr>
            <tr>
              <td>assigned a tag</td>
              <td className="align-top">
                <span className={`evt-tag ${eventClassName}`} style={{ backgroundColor: color }}>
                  {tag || 'Untagged'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  renderEventHistory() {
    const { isEventJumpVisible, eventHistory } = this.props;

    if (eventHistory === null || !eventHistory.length) {
      return <p>This event has no activity yet.</p>;
    }

    const maxActivity = isEventJumpVisible
      ? eventHistory.slice(Math.max(eventHistory.length - MAX_EVENTS_ACTIVITY, 0))
      : eventHistory;

    return maxActivity.map((currentActivity, currentIndex) => {
      const userData = this.findUser(currentActivity.created_by);
      const action = currentActivity.action || null;
      const isLastItem = currentIndex === maxActivity.length - 1;

      return action === null
        ? this.renderEventComment(currentActivity, userData, isLastItem)
        : this.renderEventTag(currentActivity, userData, isLastItem);
    });
  }

  render() {
    const { eventDetails, isUsersDataLoading, isEventJumpVisible, setActivePanel } = this.props;
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
              {this.renderEventHistory()}
            </Loader>
          </div>
          {isEventJumpVisible && (
            <div className="event-jump">
              <ul>
                <li>
                  Showing <strong>{maxActivity} most recent</strong> - to see more details
                </li>
                <li>
                  <button type="button" onClick={() => setActivePanel('eventView')}>
                    Go to Event Details
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )
    );
  }
}

EventComments.defaultProps = {
  isEventJumpVisible: true,
};

export default connect(
  (state) => ({
    eventDetails: getCurrentEventDetails(state),
    usersData: getUsersData(state),
    isUsersDataLoading: getIsUsersDataloading(state),
    eventHistory: getEventSortedHistory(state),
  }),
  (dispatch) => ({
    setActivePanel: (activePanel) => dispatch(setActivePanelAction(activePanel)),
    getEventHistory: () => dispatch(getCurrentEventHistoryAction()),
  }),
)(EventComments);
