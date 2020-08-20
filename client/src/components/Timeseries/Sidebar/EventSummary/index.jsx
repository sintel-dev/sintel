import React, { Component } from 'react';
import { tagSeq, fromTagToClassName } from '../../../Landing/utils';
import { fromMonthToIndex } from '../../../../model/utils/Utils';

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

const renderTagEvents = (events) =>
  tagSeq.map((currentTag) => <td key={currentTag}>{(events && countEventsPerTag(currentTag, events)) || '-'}</td>);

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

  showPeriod(ym) {
    const { filteredPeriodRange, selectedPeriodLevel, isTimeSyncEnabled } = this.props;
    let yy = '';
    let mm = '';

    if (isTimeSyncEnabled) {
      const { level } = filteredPeriodRange[0];
      if (level === 'month') {
        yy = filteredPeriodRange[0].parent.name;
      }

      if (level === 'day') {
        yy = filteredPeriodRange[0].parent.parent.name;
        mm = filteredPeriodRange[0].parent.name;
      }
    } else {
      if (selectedPeriodLevel.year) {
        yy = selectedPeriodLevel.year;
      }
      if (selectedPeriodLevel.month) {
        mm = selectedPeriodLevel.month;
      }
    }
    if (yy !== '') {
      yy = `(${yy})`;
    }
    if (mm !== '') {
      mm = `(${mm})`;
    }

    const res = ym === 'y' ? yy : mm;
    return res;
  }

  render() {
    const { isOpen, signalName } = this.props;
    const eventsPerRange = this.getTimeRangeEvents();
    const activeSummary = isOpen ? 'active' : '';

    return (
      <div className="event-summary">
        <div className="event-header">
          <div className="left-wrapper wrapper">
            <span>{signalName}</span>
          </div>
        </div>
        <div className={`summary-details ${activeSummary}`}>
          <table>
            <tbody>
              <tr className="row-light">
                <th>Tag Type</th>
                {renderTagIcon()}
              </tr>
              <tr>
                <th>Year {this.showPeriod('y')}</th>
                {renderTagEvents(eventsPerRange.perYear)}
              </tr>
              <tr className="row-light">
                <th>Month {this.showPeriod('m')}</th>
                {renderTagEvents(eventsPerRange.perMonth)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EventSummary;
