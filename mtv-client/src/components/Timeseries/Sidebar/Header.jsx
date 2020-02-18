import React from 'react';

const Header = ({ headerTitle, setPeriodLevel, isPeriodLevelSelected, selectedPeriodLevel }) => {
  const monthClassName = selectedPeriodLevel.level === 'year' ? 'active' : '';
  const yearClassName = !isPeriodLevelSelected ? 'active' : '';

  return (
    <div className="period-control">
      <div className="sidebar-heading">{headerTitle}</div>
      <ul>
        <li>
          <button type="button" onClick={() => setPeriodLevel(null)} className={yearClassName}>
            Year
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setPeriodLevel('month')}
            disabled={!isPeriodLevelSelected}
            className={monthClassName}
          >
            Month
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setPeriodLevel('day')}
            disabled={!isPeriodLevelSelected && selectedPeriodLevel.level !== 'day'}
          >
            Day
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Header;
