import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
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
  constructor(props) {
    super(props);
    this.state = {
      isSummaryVisible: true,
    };
    this.toggleSummaryDetails = this.toggleSummaryDetails.bind(this);
  }

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

  toggleSummaryDetails() {
    const { isSummaryVisible } = this.state;
    this.setState({
      isSummaryVisible: !isSummaryVisible,
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
    const eventsPerRange = this.getTimeRangeEvents();
    const activeSummary = this.state.isSummaryVisible ? 'active' : '';
    const buttonText = this.state.isSummaryVisible ? 'HIDE' : 'SHOW';

    return (
      <div className="event-summary">
        <div className="event-header">
          <div className="left-wrapper">
            <span>Overview Events Table</span>
          </div>
          <div className="right-wrapper">
            <button type="button" onClick={this.toggleSummaryDetails} id="toggleSummary">
              <span>{buttonText}</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="clear" />
        </div>
        <div className={`summary-details ${activeSummary}`}>
          <table>
            <tbody>
              <tr className="row-light">
                <th>event tag</th>
                {renderTagIcon()}
              </tr>
              <tr>
                <th>Year</th>
                {renderTagEvents(eventsPerRange.perYear)}
              </tr>
              <tr className="row-light">
                <th>Month</th>
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
