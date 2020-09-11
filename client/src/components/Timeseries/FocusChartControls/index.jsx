import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { togglePredictionsAction, addNewEventAction } from '../../../model/actions/datarun';
import { isPredictionEnabled, getIsAddingNewEvents } from '../../../model/selectors/datarun';

import './FocusChartControls.scss';

class FocusChartControls extends Component {
  render() {
    const { isAddingEvent, togglePredictions, addNewEvent, isEnabledPrediction } = this.props;

    return (
      <div className="chart-controls" id="chartControls">
        <div className="legend">
          <p>Signal Focused View</p>
        </div>

        <div className="controls">
          <div className="linechart-controls">
            <div className="row">
              <div className="switch-control">
                <div className="row">
                  <label htmlFor="showPredictions">
                    <input
                      type="checkbox"
                      id="showPredictions"
                      checked={isEnabledPrediction}
                      onChange={(event) => togglePredictions(event.target.checked)}
                    />
                    <span className="switch" />
                    Show Predictions
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-add-event"
              disabled={isAddingEvent}
              onClick={() => addNewEvent(!isAddingEvent)}
            >
              <span>+</span>
              Add Event
            </button>
          </div>
        </div>
      </div>
    );
  }
}

FocusChartControls.propTypes = {
  togglePredictions: PropTypes.func,
  isEnabledPrediction: PropTypes.bool,
};

export default connect(
  (state) => ({
    isEnabledPrediction: isPredictionEnabled(state),
    isAddingEvent: getIsAddingNewEvents(state),
  }),
  (dispatch) => ({
    togglePredictions: (event) => dispatch(togglePredictionsAction(event)),
    addNewEvent: (isAddingEvent) => dispatch(addNewEventAction(isAddingEvent)),
  }),
)(FocusChartControls);
