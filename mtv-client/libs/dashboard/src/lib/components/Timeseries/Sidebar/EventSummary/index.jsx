import React from 'react';
import { tagSeq, fromTagToClassName } from '../../../Landing/utils';
import { fromMonthToIndex } from '../../../../model/utils/Utils';
import './EventSummary.scss';

const renderTagIcon = () =>
  tagSeq.map(currentTag => (
    <td key={currentTag}>
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
  return tagSeq.map(currentTag => <td key={currentTag}>{countEventsPerTag(currentTag, currentMonthEvents.days)}</td>);
};

const EventSummary = ({ dataRun, selectedPeriodLevel }) => {
  const { grouppedEvents } = dataRun;
  const isPeriodLevelSelected = Object.keys(selectedPeriodLevel).length !== 0;

  return (
    <div className="event-summary">
      <div className="event-header">
        <div className="left-wrapper">
          <span>Overview Events Table</span>
        </div>
        <div className="right-wrapper">
          <button type="button">
            HIDE <i className="fas fa-chevron-right" />
          </button>
        </div>
        <div className="clear" />
      </div>
      <div className="summary-details">
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
};

export default EventSummary;
