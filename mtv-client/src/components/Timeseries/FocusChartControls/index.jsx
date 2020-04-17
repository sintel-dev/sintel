import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { togglePredictionsAction, addNewEventAction, filterEventsByTagAction } from '../../../model/actions/datarun';
import { isPredictionEnabled, getIsAddingNewEvents } from '../../../model/selectors/datarun';
import './FocusChartControls.scss';

const filterOptions = [
  { value: 'Investigate', label: 'Investigate', icon: 'investigate', isFixed: true },
  { value: 'Do not Investigate', label: 'Do not Investigate', icon: 'not_investigate', isFixed: true },
  { value: 'Postpone', label: 'Postpone', icon: 'postpone', isFixed: true },
  { value: 'Problem', label: 'Problem', icon: 'problem', isFixed: true },
  { value: 'Previously seen', label: 'Previously seen', icon: 'seen', isFixed: true },
  { value: 'Normal', label: 'Normal', icon: 'normal', isFixed: true },
  { value: 'Untagged', label: 'Untagged', icon: 'untagged', isFixed: true },
];

const formatOptionLabel = ({ label, icon }) => (
  <div className="select-row">
    <i className={`select ${icon}`} />
    {label}
  </div>
);

const FocusChartControls = (props) => (
  <div className="chart-controls" id="chartControls">
    <div className="linechart-controls switch-control">
      <div className="row">
        <button
          type="button"
          className="btn btn-add-event"
          disabled={props.isAddingEvent}
          onClick={() => props.addNewEvent(!props.isAddingEvent)}
        >
          <span>+</span>
          Add Event
        </button>
      </div>
      <div className="row">
        <label htmlFor="showPredictions">
          <input
            type="checkbox"
            id="showPredictions"
            checked={props.isPredictionEnabled}
            onChange={(event) => props.togglePredictions(event.target.checked)}
          />
          <span className="switch" />
          Show Predictions
        </label>
      </div>
    </div>
    <div className="tag-wrapper">
      <Select
        isSearchable={false}
        isMulti
        closeMenuOnSelect={false}
        classNamePrefix="tag-options"
        className="tag-select"
        formatOptionLabel={formatOptionLabel}
        options={filterOptions}
        placeholder="All tags"
        onChange={props.filterByTags}
      />
    </div>
  </div>
);

FocusChartControls.propTypes = {
  togglePredictions: PropTypes.func,
  isPredictionEnabled: PropTypes.bool,
};

export default connect(
  (state) => ({
    isPredictionEnabled: isPredictionEnabled(state),
    isAddingEvent: getIsAddingNewEvents(state),
  }),
  (dispatch) => ({
    togglePredictions: (event) => dispatch(togglePredictionsAction(event)),
    addNewEvent: (isAddingEvent) => dispatch(addNewEventAction(isAddingEvent)),
    filterByTags: (tags) => dispatch(filterEventsByTagAction(tags)),
  }),
)(FocusChartControls);
