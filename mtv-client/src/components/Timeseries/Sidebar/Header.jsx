import React from 'react';

const Header = ({ headerTitle, reviewPeriod, reviewRange, currentPeriod }) => (
  <div className="period-control">
    <div className="sidebar-heading">{headerTitle}</div>
    <ul>
      <li>
        <button
          type="button"
          onClick={() => reviewPeriod('year')}
          className={reviewRange === 'year' || reviewRange === null ? 'active' : ''}
        >
          Year
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => reviewPeriod('month')}
          className={reviewRange === 'month' ? 'active' : ''}
          disabled={reviewRange === null}
        >
          Month
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => reviewPeriod('day')}
          className={reviewRange === 'day' ? 'active' : ''}
          disabled={reviewRange === null || currentPeriod.month === ''}
        >
          Day
        </button>
      </li>
    </ul>
    <div className="clear" />
  </div>
);

export default Header;
