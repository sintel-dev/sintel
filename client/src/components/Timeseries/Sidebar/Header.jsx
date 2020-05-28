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
  getFilteredPeriodRange,
} from '../../../model/selectors/datarun';
import { reviewPeriodAction, toggleEventModeAction, toggleTimeSyncModeAction } from '../../../model/actions/datarun';
import './Header.scss';

const showPeriod = (filteredPeriodRange) => {
  let periodString = 'YY/MM';
  const { level } = filteredPeriodRange[0];

  if (level === 'month') {
    periodString = periodString.replace('YY', filteredPeriodRange[0].parent.name);
  }

  if (level === 'day') {
    periodString = periodString.replace('YY', filteredPeriodRange[0].parent.parent.name);
    periodString = periodString.replace('MM', filteredPeriodRange[0].parent.name);
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
  filteredPeriodRange,
}) => (
  <div className="period-control">
    <SidebarHeading
      signalName={dataRun.signal}
      toggleEvent={toggleEventsMode}
      isEventModeEnabled={isEventModeEnabled}
      toggleTimeSync={toggleTimeSync}
      isTimeSyncEnabled={isTimeSyncEnabled}
    />
    <EventSummary
      selectedPeriodLevel={selectedPeriodLevel}
      grouppedEvents={grouppedEvents}
      filteredPeriodRange={filteredPeriodRange}
    />
    <div>
      {showPeriod(filteredPeriodRange)}
      <ul className="period-filter">
        <li>
          <button
            type="button"
            disabled={isTimeSyncEnabled}
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
            disabled={reviewRange === null || isTimeSyncEnabled}
          >
            Month
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && setReviewRange('day')}
            className={reviewRange === 'day' ? 'active' : ''}
            disabled={reviewRange === null || selectedPeriodLevel.month === '' || isTimeSyncEnabled}
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
    filteredPeriodRange: getFilteredPeriodRange(state),
  }),
  (dispatch) => ({
    setReviewRange: (reviewRange) => dispatch(reviewPeriodAction(reviewRange)),
    toggleEventsMode: (mode) => dispatch(toggleEventModeAction(mode)),
    toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
  }),
)(Header);
