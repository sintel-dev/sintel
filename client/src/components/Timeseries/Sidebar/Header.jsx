import React, { Component } from 'react';
import { connect } from 'react-redux';
import EventSummary from './EventSummary';
import {
  getDatarunDetails,
  getSelectedPeriodLevel,
  getIsEditingEventRange,
  getGrouppedDatarunEvents,
  getIsEventModeEnabled,
  getIsTimeSyncModeEnabled,
  getFilteredPeriodRange,
  getScrollHistory,
} from '../../../model/selectors/datarun';
import {
  toggleEventModeAction,
  toggleTimeSyncModeAction,
  setPeriodRangeAction,
  setScrollHistoryAction,
  setReviewPeriodAction,
} from '../../../model/actions/datarun';
import './Header.scss';

class Header extends Component {
  componentDidUpdate(prevProps) {
    const { isTimeSyncEnabled, filteredPeriodRange, setScrollHistory, scrollHistory } = this.props;

    if (!isTimeSyncEnabled) {
      return;
    }

    if (prevProps.filteredPeriodRange[0].level !== filteredPeriodRange[0].level) {
      const { level } = filteredPeriodRange[0];
      let currentPeriod = scrollHistory;
      if (level === 'year') {
        currentPeriod = {
          ...currentPeriod,
          level: 'year',
        };
      }

      if (level === 'month') {
        const currentYear = currentPeriod.year;
        const newYear = filteredPeriodRange[0].parent.name;
        currentPeriod = {
          ...currentPeriod,
          year: currentYear !== newYear ? newYear : currentYear,
          level: 'month',
        };
      }

      if (level === 'day') {
        const currentMonth = currentPeriod.month;
        const newMonth = filteredPeriodRange[0].parent.name;
        const currentYear = currentPeriod.year;
        const newYear = filteredPeriodRange[0].parent.parent.name;
        currentPeriod = {
          ...currentPeriod,
          year: currentYear !== newYear ? newYear : currentYear,
          month: currentMonth !== newMonth ? newMonth : currentMonth,
          level: 'day',
        };
      }
      setScrollHistory(currentPeriod);
    }
  }

  renderHeadingControls() {
    const { dataRun, isEventModeEnabled, toggleEventsMode, toggleTimeSync, isTimeSyncEnabled } = this.props;
    const { signal } = dataRun;
    return (
      <div className="sidebar-heading">
        <ul>
          <li className="signal-title">{signal}</li>
          <li>
            <div className="switch-control">
              <div className="row">
                <label htmlFor="toggleEvents">
                  <input
                    type="checkbox"
                    id="toggleEvents"
                    onChange={(event) => toggleEventsMode(event.target.checked)}
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
  }

  showPeriod() {
    const { filteredPeriodRange, selectedPeriodLevel, isTimeSyncEnabled } = this.props;
    let periodString = 'YY/MM';

    if (isTimeSyncEnabled) {
      const { level } = filteredPeriodRange[0];
      if (level === 'month') {
        periodString = periodString.replace('YY', filteredPeriodRange[0].parent.name);
      }

      if (level === 'day') {
        periodString = periodString.replace('YY', filteredPeriodRange[0].parent.parent.name);
        periodString = periodString.replace('MM', filteredPeriodRange[0].parent.name);
      }
    } else {
      if (selectedPeriodLevel.year) {
        periodString = periodString.replace('YY', selectedPeriodLevel.year);
      }
      if (selectedPeriodLevel.month) {
        periodString = periodString.replace('MM', selectedPeriodLevel.month);
      }
    }

    return (
      <div className="period-info">
        <p>{periodString}</p>
      </div>
    );
  }

  render() {
    const {
      setReviewPeriod,
      selectedPeriodLevel,
      isEditingEventRange,
      grouppedEvents,
      filteredPeriodRange,
      currentPeriod,
      scrollHistory,
      isTimeSyncEnabled,
    } = this.props;

    const getBtnProps = (button) => {
      const getParentLevel = () => (button === 'day' ? 'month' : 'year');
      const getIsActive = () => {
        if (button === 'year') {
          return isTimeSyncEnabled ? scrollHistory.level === 'year' : currentPeriod.level === null;
        }
        return isTimeSyncEnabled
          ? scrollHistory.level === button
          : currentPeriod.level === getParentLevel() || currentPeriod.level === getParentLevel();
      };

      const getIsDisabled = () => {
        if (button === 'year') {
          return false;
        }
        return isTimeSyncEnabled ? scrollHistory[getParentLevel()] === null : currentPeriod[getParentLevel()] === null;
      };

      return {
        className: getIsActive() ? 'active' : '',
        disabled: getIsDisabled(),
        onClick: () =>
          !isEditingEventRange && button === 'year' ? setReviewPeriod(null) : setReviewPeriod(getParentLevel()),
      };
    };

    return (
      <div className="period-control">
        {this.renderHeadingControls()}
        <EventSummary
          selectedPeriodLevel={selectedPeriodLevel}
          grouppedEvents={grouppedEvents}
          filteredPeriodRange={filteredPeriodRange}
        />
        <div>
          {this.showPeriod()}
          <ul className="period-filter">
            <li>
              <button type="button" {...getBtnProps('year')}>
                Year
              </button>
            </li>
            <li>
              <button type="button" {...getBtnProps('month')}>
                Month
              </button>
            </li>
            <li>
              <button type="button" {...getBtnProps('day')}>
                Day
              </button>
            </li>
          </ul>
        </div>
        <div className="clear" />
      </div>
    );
  }
}

export default connect(
  (state) => ({
    dataRun: getDatarunDetails(state),
    selectedPeriodLevel: getSelectedPeriodLevel(state),
    isEditingEventRange: getIsEditingEventRange(state),
    grouppedEvents: getGrouppedDatarunEvents(state),
    isEventModeEnabled: getIsEventModeEnabled(state),
    isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
    filteredPeriodRange: getFilteredPeriodRange(state),
    currentPeriod: getSelectedPeriodLevel(state),
    scrollHistory: getScrollHistory(state),
  }),
  (dispatch) => ({
    setPeriodRange: (periodRange) => dispatch(setPeriodRangeAction(periodRange)),
    toggleEventsMode: (mode) => dispatch(toggleEventModeAction(mode)),
    toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
    setScrollHistory: (period) => dispatch(setScrollHistoryAction(period)),
    setReviewPeriod: (period) => dispatch(setReviewPeriodAction(period)),
  }),
)(Header);
