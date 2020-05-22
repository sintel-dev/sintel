import React from 'react';
import { connect } from 'react-redux';
import EventSummary from './EventSummary';
import {
  getDatarunDetails,
  getReviewPeriod,
  getSelectedPeriodLevel,
  getIsEditingEventRange,
  getGrouppedDatarunEvents,
  getIsEventModeEnabled,
  getIsTimeSyncModeEnabled,
} from '../../../model/selectors/datarun';
import { reviewPeriodAction, toggleEventModeAction, toggleTimeSyncModeAction } from '../../../model/actions/datarun';
import './Header.scss';

const showPeriod = (selectedPeriodLevel) => {
  let periodString = 'YY/MM';
  if (selectedPeriodLevel.year) {
    periodString = periodString.replace('YY', selectedPeriodLevel.year);
  }
  if (selectedPeriodLevel.month) {
    periodString = periodString.replace('MM', selectedPeriodLevel.month);
  }

  return (
    <div className="period-info">
      <p>{periodString}</p>
    </div>
  );
};

const SidebarHeading = ({ signalName, toggleEvent, isEventModeEnabled, toggleTimeSync, isTimeSyncEnabled }) => (
  <div className="sidebar-heading">
    <ul>
      <li className="signal-title">{signalName}</li>
      <li>
        <div className="switch-control">
          <div className="row">
            <label htmlFor="toggleEvents">
              <input
                type="checkbox"
                id="toggleEvents"
                onChange={(event) => toggleEvent(event.target.checked)}
                checked={isEventModeEnabled}
              />
              <span className="switch" />
              Show Events
            </label>
          </div>
        </div>
      </li>
      <li>
        <div className="switch-control">
          <div className="row">
            <label htmlFor="toggleTimeSync">
              <input
                type="checkbox"
                id="toggleTimeSync"
                onChange={(event) => toggleTimeSync(event.target.checked)}
                checked={isTimeSyncEnabled}
              />
              <span className="switch" />
              Sync Time Ranges
            </label>
          </div>
        </div>
      </li>
    </ul>
  </div>
);

const Header = ({
  dataRun,
  setReviewRange,
  reviewRange,
  selectedPeriodLevel,
  isEditingEventRange,
  grouppedEvents,
  toggleEventsMode,
  isEventModeEnabled,
  toggleTimeSync,
  isTimeSyncEnabled,
}) => (
  <div className="period-control">
    <SidebarHeading
      signalName={dataRun.signal}
      toggleEvent={toggleEventsMode}
      isEventModeEnabled={isEventModeEnabled}
      toggleTimeSync={toggleTimeSync}
      isTimeSyncEnabled={isTimeSyncEnabled}
    />
    <EventSummary selectedPeriodLevel={selectedPeriodLevel} grouppedEvents={grouppedEvents} />
    <div>
      {showPeriod(selectedPeriodLevel)}
      <ul className="period-filter">
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && setReviewRange('year')}
            className={reviewRange === 'year' || reviewRange === null ? 'active' : ''}
          >
            Year
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && setReviewRange('month')}
            className={reviewRange === 'month' ? 'active' : ''}
            disabled={reviewRange === null}
          >
            Month
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && setReviewRange('day')}
            className={reviewRange === 'day' ? 'active' : ''}
            disabled={reviewRange === null || selectedPeriodLevel.month === ''}
          >
            Day
          </button>
        </li>
      </ul>
    </div>
    <div className="clear" />
  </div>
);

export default connect(
  (state) => ({
    dataRun: getDatarunDetails(state),
    reviewRange: getReviewPeriod(state),
    selectedPeriodLevel: getSelectedPeriodLevel(state),
    isEditingEventRange: getIsEditingEventRange(state),
    grouppedEvents: getGrouppedDatarunEvents(state),
    isEventModeEnabled: getIsEventModeEnabled(state),
    isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
  }),
  (dispatch) => ({
    setReviewRange: (periodLevel) => dispatch(reviewPeriodAction(periodLevel)),
    toggleEventsMode: (mode) => dispatch(toggleEventModeAction(mode)),
    toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
  }),
)(Header);
