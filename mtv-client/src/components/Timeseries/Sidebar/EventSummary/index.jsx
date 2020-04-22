import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { tagSeq, fromTagToClassName } from '../../../Landing/utils';
import { fromMonthToIndex } from '../../../../model/utils/Utils';

import './EventSummary.scss';

const renderTagIcon = () =>
  tagSeq.map(currentTag => (
    <td key={currentTag}>
      <span className="tooltip-data">
        <i key={fromTagToClassName(currentTag)} className={`indicator ${fromTagToClassName(currentTag)}`} />
        {currentTag}
      </span>
      <i key={fromTagToClassName(currentTag)} className={`indicator ${fromTagToClassName(currentTag)}`} />
    </td>
  ));

const countEventsPerTag = (tag, events) => {
  const currentEvents = Object.values(events);
  return currentEvents.filter(currentEvent => currentEvent.tag === tag).length;
};

const renderTagEvents = (isPeriodLevelSelected, grouppedEvents) => {
  if (!isPeriodLevelSelected || grouppedEvents === undefined) {
    return tagSeq.map(currentTag => <td key={currentTag}>-</td>);
  }
  return tagSeq.map(currentTag => <td key={currentTag}>{countEventsPerTag(currentTag, grouppedEvents.events)}</td>);
};

const renderTagEventsPerMonth = (isPeriodLevelSelected, month, monthEvents) => {
  if (!isPeriodLevelSelected || month === '' || monthEvents === undefined) {
    return tagSeq.map(currentTag => <td key={currentTag}>-</td>);
  }
  const currentMonthEvents = monthEvents.months[fromMonthToIndex(month)];
  return (
    currentMonthEvents &&
    tagSeq.map(currentTag => <td key={currentTag}>{countEventsPerTag(currentTag, currentMonthEvents.events)}</td>)
  );
};

const handleColHover = () => {
  const td = document.querySelectorAll('.summary-details td');

  td.forEach(currentTd => {
    currentTd.addEventListener('mouseover', function() {
      const index = this.cellIndex + 1;
      document.querySelectorAll(`td:nth-child(${index})`).forEach(hoveredTd => {
        hoveredTd.classList.add('highlighted');
      });
    });

    currentTd.addEventListener('mouseleave', function() {
      const index = this.cellIndex + 1;
      document.querySelectorAll(`td:nth-child(${index})`).forEach(hoveredTd => {
        hoveredTd.classList.remove('highlighted');
      });
    });
  });
};

class EventSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSummaryVisible: true,
    };
  }

  toggleSummaryDetails() {
    const { isSummaryVisible } = this.state;
    this.setState({
      isSummaryVisible: !isSummaryVisible,
    });
  }

  render() {
    const { selectedPeriodLevel, grouppedEvents } = this.props;
    const isPeriodLevelSelected = Object.keys(selectedPeriodLevel).length !== 0;
    const activeSummary = this.state.isSummaryVisible ? 'active' : '';
    const buttonText = this.state.isSummaryVisible ? 'HIDE' : 'SHOW';
    return (
      <div className="event-summary">
        <div className="event-header">
          <div className="left-wrapper">
            <span>Overview Events Table</span>
          </div>
          <div className="right-wrapper">
            <button type="button" onClick={() => this.toggleSummaryDetails()}>
              <span>{buttonText}</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="clear" />
        </div>
        <div className={`summary-details ${activeSummary}`}>
          {handleColHover()}
          <table>
            <tbody>
              <tr className="row-light">
                <th>event tag</th>
                {renderTagIcon()}
              </tr>
              <tr>
                <th>Year</th>
                {renderTagEvents(isPeriodLevelSelected, grouppedEvents[selectedPeriodLevel.year])}
              </tr>
              <tr className="row-light">
                <th>Month</th>
                {renderTagEventsPerMonth(
                  isPeriodLevelSelected && isPeriodLevelSelected.month !== '',
                  selectedPeriodLevel.month,
                  grouppedEvents[selectedPeriodLevel.year],
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EventSummary;
