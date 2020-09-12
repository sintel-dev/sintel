import React, { Component } from 'react';
import { tagSeq, fromTagToClassName } from '../../../../Landing/utils';
import { fromMonthToIndex } from '../../../../../model/utils/Utils';
import * as _ from 'lodash';

import './EventSummary.scss';

const renderTagIcon = () =>
  tagSeq.map((currentTag) => (
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
  return currentEvents.filter((currentEvent) => currentEvent.tag === tag).length;
};

const renderTagEventsAll = (grouppedEvents) => {
  if (grouppedEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  return tagSeq.map((currentTag) => {
    let eventSum = 0;
    let eventSet = new Set();
    _.each(grouppedEvents, (value) => {
      _.each(value.events, (event, eventId) => {
        if (event.tag === currentTag) {
          eventSet.add(eventId);
        }
      });
    });
    eventSum = eventSet.size;
    return <td key={currentTag}>{eventSum}</td>;
  });
};

const renderTagEventsPerYear = (periodRange, grouppedEvents) => {
  if (periodRange.level === 'year' || grouppedEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  return tagSeq.map((currentTag) => <td key={currentTag}>{countEventsPerTag(currentTag, grouppedEvents.events)}</td>);
};

const renderTagEventsPerMonth = (periodRange, month, monthEvents) => {
  if (periodRange.level !== 'day' || monthEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  const currentMonthEvents = monthEvents.months[fromMonthToIndex(month)];
  if (currentMonthEvents) {
    return tagSeq.map((currentTag) => (
      <td key={currentTag}>{countEventsPerTag(currentTag, currentMonthEvents.events)}</td>
    ));
  } else {
    return tagSeq.map((currentTag) => <td key={currentTag}>0</td>);
  }
};

class EventSummary extends Component {
  componentDidMount() {
    this.handleColHover();
  }

  handleColHover() {
    const td = document.querySelectorAll('.summary-details td');
    td.forEach((currentTd) => {
      currentTd.addEventListener('mouseover', function () {
        const index = this.cellIndex + 1;
        document.querySelectorAll(`td:nth-child(${index})`).forEach((hoveredTd) => {
          hoveredTd.classList.add('highlighted');
        });
      });

      currentTd.addEventListener('mouseleave', function () {
        const index = this.cellIndex + 1;
        document.querySelectorAll(`td:nth-child(${index})`).forEach((hoveredTd) => {
          hoveredTd.classList.remove('highlighted');
        });
      });
    });
  }

  getTimeRangeEvents() {
    const { grouppedEvents, filteredPeriodRange } = this.props;
    const { level } = filteredPeriodRange[0];

    let eventsPerRange = {
      perYear: null,
      perMonth: null,
    };

    if (level === 'month') {
      const year = filteredPeriodRange[0].parent.name;
      if (grouppedEvents[year]) {
        eventsPerRange = {
          perYear: grouppedEvents[year].events,
        };
      }
    }

    if (level === 'day') {
      const year = filteredPeriodRange[0].parent.parent.name;
      const month = filteredPeriodRange[0].parent.name;

      if (grouppedEvents[year]) {
        eventsPerRange = {
          perYear: grouppedEvents[year].events,
          perMonth:
            (grouppedEvents[year].months &&
              grouppedEvents[year].months[fromMonthToIndex(month)] &&
              grouppedEvents[year].months[fromMonthToIndex(month)].events) ||
            null,
        };
      }
    }

    return eventsPerRange;
  }

  render() {
    const { filteredPeriodRange, grouppedEvents } = this.props;

    let currentYear = '';
    let currentMonth = '';
    let currentYearStr = '';
    let currentMonthStr = '';

    let periodRange = filteredPeriodRange[0];
    if (periodRange.level === 'month') {
      currentYear = periodRange.parent.name;
      currentYearStr = '- ' + periodRange.parent.name;
    } else if (periodRange.level === 'day') {
      currentYear = periodRange.parent.parent.name;
      currentYearStr = '- ' + periodRange.parent.parent.name;
      currentMonth = periodRange.parent.name;
      currentMonthStr = '- ' + periodRange.parent.name;
    }

    return (
      <div className="event-summary">
        <div className={`summary-details`}>
          <table>
            <tbody>
              <tr>
                <th>event tag</th>
                {renderTagIcon()}
              </tr>
              <tr>
                <th>All</th>
                {renderTagEventsAll(grouppedEvents)}
              </tr>
              <tr>
                <th>Year {currentYearStr} </th>
                {renderTagEventsPerYear(filteredPeriodRange[0], grouppedEvents[currentYear])}
              </tr>
              <tr>
                <th>Month {currentMonthStr}</th>
                {renderTagEventsPerMonth(filteredPeriodRange[0], currentMonth, grouppedEvents[currentYear])}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EventSummary;
