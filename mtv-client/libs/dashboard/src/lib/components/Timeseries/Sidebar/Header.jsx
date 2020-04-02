import React from 'react';
import { connect } from 'react-redux';
import EventSummary from './EventSummary';
import {
  getDatarunDetails,
  getReviewPeriod,
  getSelectedPeriodLevel,
  getIsEditingEventRange,
  getGrouppedDatarunEvents,
} from '../../../model/selectors/datarun';
import { reviewPeriodAction } from '../../../model/actions/datarun';

const showPeriod = selectedPeriodLevel => {
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

const Header = ({ dataRun, setReviewRange, reviewRange, selectedPeriodLevel, isEditingEventRange, grouppedEvents }) => (
  <div className="period-control">
    <div className="sidebar-heading">{dataRun.signal}</div>
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
  state => ({
    dataRun: getDatarunDetails(state),
    reviewRange: getReviewPeriod(state),
    selectedPeriodLevel: getSelectedPeriodLevel(state),
    isEditingEventRange: getIsEditingEventRange(state),
    grouppedEvents: getGrouppedDatarunEvents(state),
  }),
  dispatch => ({
    setReviewRange: periodLevel => dispatch(reviewPeriodAction(periodLevel)),
  }),
)(Header);
