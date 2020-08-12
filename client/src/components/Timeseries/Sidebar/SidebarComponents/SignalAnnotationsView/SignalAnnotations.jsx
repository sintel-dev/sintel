import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import { fade } from '@material-ui/core';
import { ArrowDown } from 'src/components/Common/icons';
import { getSelectedDatarun } from '../../../../../model/selectors/datarun';

import './SignalAnnotations.scss';

class SignalAnnotations extends Component {
  getBackgroundColor(tag) {
    // console.log(colorSchemes[tag], colorSchemes, tag);
    // debugger;
    // const backgroundColor = tag ? fade(colorSchemes[tag], 0.5) : fade('#C7C7C7', 0.5);
    const backgroundColor = tag ? colorSchemes[tag] : '#C7C7C7';

    // console.log(backgroundColor);

    return backgroundColor;
  }

  renderEventDetails(event) {
    const color = this.getBackgroundColor(event.tag);
    return (
      <div className="annotation-wrapper">
        <div className="annotation-wrapper-left">
          <span className="tag-wrapper" style={{ backgroundColor: fade(color, 0.15) }}>
            <i style={{ backgroundColor: color }} />
            <span>{event.tag || 'Untagged'}</span>
          </span>
        </div>
        <div className="annotation-wrapper-right">
          <ul>
            <li>Starts: {timestampToDate(event.start_time * 1000)}</li>
            <li>Ends: {timestampToDate(event.stop_time * 1000)}</li>
          </ul>
          <button type="button">
            <ArrowDown />
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { dataRun } = this.props;
    const { events } = dataRun;

    return (
      <div className="signals-wrapper">
        {events.length && events.map((currentEvent) => this.renderEventDetails(currentEvent))}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    dataRun: getSelectedDatarun(state),
  }),
  (dispatch) => ({}),
)(SignalAnnotations);
