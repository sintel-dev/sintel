import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleRelativeScaleAction, toggleEventSummaryAction } from 'src/model/actions/sidebar';
import { getIsRelativeScaleEnabled, getIsSummaryViewActive } from 'src/model/selectors/sidebar';
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
} from '../../../../model/selectors/datarun';
import {
  toggleEventModeAction,
  setPeriodRangeAction,
  setScrollHistoryAction,
  setReviewPeriodAction,
} from '../../../../model/actions/datarun';

const showPeriod = (periodRange) => {
  let periodString = (
    <p>
      <span>YY / MM</span>
    </p>
  );

  const { level } = periodRange;
  if (level === 'month') {
    periodString = (
      <p>
        <span className="active">{periodRange.parent.name}</span>
        <span> / MM</span>
      </p>
    );
  }

  if (level === 'day') {
    periodString = (
      <p>
        <span className="active">{periodRange.parent.parent.name}</span> /{' '}
        <span className="active">{periodRange.parent.name}</span>
      </p>
    );
  }

  return <div className="period-info">{periodString}</div>;
};

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
      isRelativeScaleEnabled,
      toggleRelativeScale,
      dataRun,
      toggleEventSummaryState,
      isSummaryViewActive,
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
        <EventSummary
          selectedPeriodLevel={selectedPeriodLevel}
          grouppedEvents={grouppedEvents}
          filteredPeriodRange={filteredPeriodRange}
          signalName={dataRun.signal}
          isTimeSyncEnabled={isTimeSyncEnabled}
          showPeriod={showPeriod(filteredPeriodRange[0])}
          toggleEventSummary={toggleEventSummaryState}
          isSummaryViewActive={isSummaryViewActive}
        />
        <div className="period-wrapper">
          <div className="sidechart-controls switch-control">
            <div className="row">
              <label htmlFor="glyphScale">
                <input
                  type="checkbox"
                  id="glyphScale"
                  onChange={toggleRelativeScale}
                  checked={isRelativeScaleEnabled}
                />
                <span className="switch" />
                Relative scale
              </label>
            </div>
          </div>
          {showPeriod(filteredPeriodRange[0])}
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
          {/* @TODO - new toggle switch appear(changeScale), check to see where to place this one */}
          {/* <ul>
            <li>
              <div className="switch-control reversed">
                <div className="row">
                  <label htmlFor="toggleEvents">
                    Show Events
                    <input
                      type="checkbox"
                      id="toggleEvents"
                      onChange={(event) => toggleEventsMode(event.target.checked)}
                      checked={isEventModeEnabled}
                    />
                    <span className="switch" />
                  </label>
                </div>
              </div>
            </li>
          </ul> */}
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
    isRelativeScaleEnabled: getIsRelativeScaleEnabled(state),
    isSummaryViewActive: getIsSummaryViewActive(state),
  }),
  (dispatch) => ({
    setPeriodRange: (periodRange) => dispatch(setPeriodRangeAction(periodRange)),
    toggleEventsMode: (mode) => dispatch(toggleEventModeAction(mode)),
    setScrollHistory: (period) => dispatch(setScrollHistoryAction(period)),
    setReviewPeriod: (period) => dispatch(setReviewPeriodAction(period)),
    toggleRelativeScale: () => dispatch(toggleRelativeScaleAction()),
    toggleEventSummaryState: () => dispatch(toggleEventSummaryAction()),
  }),
)(Header);
