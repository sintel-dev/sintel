import React from 'react';

const Header = ({ headerTitle, reviewPeriod, isPeriodLevelSelected, currentPeriod }) => {
  const yearClassName = !isPeriodLevelSelected ? 'active' : '';
  const monthClassName = isPeriodLevelSelected && currentPeriod.level === 'year' ? 'active' : '';
  const dayClassName = isPeriodLevelSelected && currentPeriod.level === 'month' ? 'active' : '';

  const { name, level } = currentPeriod;

  return (
    <div className="period-control">
      <div className="sidebar-heading">{headerTitle}</div>
      <ul>
        <li>
          <button type="button" onClick={() => reviewPeriod('year')} className={yearClassName}>
            Year
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => reviewPeriod('month')}
            // disabled={!isPeriodLevelSelected}
            className={monthClassName}
          >
            Month
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => reviewPeriod('day')}
            // disabled={!isPeriodLevelSelected && currentPeriod.level !== 'day'}
            className={dayClassName}
          >
            Day
          </button>
        </li>
      </ul>
      <div className="clear" />
    </div>
  );
};

export default Header;
