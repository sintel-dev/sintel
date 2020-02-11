import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { togglePredictionsAction, addNewEventAction } from '../../../model/actions/datarun';
import { isPredictionEnabled } from '../../../model/selectors/datarun';
import './FocusChartControls.scss';

const FocusChartControls = props => (
  <div className="chart-controls" id="chartControls">
    <div className="linechart-controls switch-control">
      <div>
        <label htmlFor="showPredictions">
          <input
            type="checkbox"
            id="showPredictions"
            checked={props.isPredictionEnabled}
            onChange={event => props.togglePredictions(event.target.checked)}
          />
          <span className="switch" />
          Show Predictions
        </label>
      </div>
      <div>
        <label htmlFor="addNewEvent">
          <input type="checkbox" id="addNewEvent" onChange={event => props.addNewEvent(event.target.checked)} />
          <span className="switch" />
          Add Events
        </label>
      </div>
    </div>
  </div>
);

FocusChartControls.propTypes = {
  togglePredictions: PropTypes.func,
  isPredictionEnabled: PropTypes.bool,
};

export default connect(
  state => ({
    isPredictionEnabled: isPredictionEnabled(state),
  }),
  dispatch => ({
    togglePredictions: event => dispatch(togglePredictionsAction(event)),
    addNewEvent: isAddingEvent => dispatch(addNewEventAction(isAddingEvent)),
  }),
)(FocusChartControls);
