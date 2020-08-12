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
        <div className="linechart-controls">
          <div className="row">
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
          <div className="switch-control reversed">
            <div className="row">
              <label htmlFor="showPredictions">
                Show Predictions
                <input
                  type="checkbox"
                  id="showPredictions"
                  checked={isEnabledPrediction}
                  onChange={(event) => togglePredictions(event.target.checked)}
                />
                <span className="switch" />
              </label>
            </div>
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
