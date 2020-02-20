import React from 'react';

const Header = ({ headerTitle, reviewPeriod }) => (
  <div className="period-control">
    <div className="sidebar-heading">{headerTitle}</div>
    <ul>
      <li>
        <button type="button" onClick={() => reviewPeriod('year')}>
          Year
        </button>
      </li>
      <li>
        <button type="button" onClick={() => reviewPeriod('month')}>
          Month
        </button>
      </li>
      <li>
        <button type="button" onClick={() => reviewPeriod('day')}>
          Day
        </button>
      </li>
    </ul>
    <div className="clear" />
  </div>
);

export default Header;
