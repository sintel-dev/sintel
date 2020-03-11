import React from 'react';
import EventSummary from './EventSummary';

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

const Header = ({
  headerTitle,
  reviewPeriod,
  reviewRange,
  currentPeriod,
  isEditingEventRange,
  dataRun,
  selectedPeriodLevel,
}) => (
  <div>
    <div className="period-control">
      <div className="sidebar-heading">{headerTitle}</div>
      <EventSummary dataRun={dataRun} selectedPeriodLevel={selectedPeriodLevel} />
      {showPeriod(selectedPeriodLevel)}
      <ul className="period-filter">
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && reviewPeriod('year')}
            className={reviewRange === 'year' || reviewRange === null ? 'active' : ''}
          >
            Year
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && reviewPeriod('month')}
            className={reviewRange === 'month' ? 'active' : ''}
            disabled={reviewRange === null}
          >
            Month
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => !isEditingEventRange && reviewPeriod('day')}
            className={reviewRange === 'day' ? 'active' : ''}
            disabled={reviewRange === null || currentPeriod.month === ''}
          >
            Day
          </button>
        </li>
      </ul>
      <div className="clear" />
    </div>
  </div>
);

export default Header;
