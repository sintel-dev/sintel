import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getFilteredExperiments } from '../../model/selectors/projects';
import { selectExperiment } from '../../model/actions/landing';

const renderExperiment = (experiment, index, onSelectExperiment) => (
  <div className="cell" key={index} onClick={() => onSelectExperiment(experiment)}>
    <h3>#{index + 1} {experiment.dataset}_{experiment.pipeline}</h3>
    <div className="item-data">
      <ul>
        <li>Signals: {experiment.dataruns.length}</li>
        <li>DC: {experiment.date_creation.substring(0, 10)}</li>
      </ul>
    </div>
  </div>
);

const Experiments = (props) => {
  const { filteredExperiments, onSelectExperiment } = props;
  return (
    <div className="item-row scroll-style" id="experiments">
      <h2>Experiments</h2>
      <div className="item-wrapper">
        <Loader isLoading={false}> {/* temporary loading false */}
          {
            filteredExperiments.length ?
              filteredExperiments.map((experiment, index) =>
              renderExperiment(experiment, index, onSelectExperiment)) :
              <h2>No experiments found</h2>
          }
        </Loader>
      </div>
    </div>);
  };

Experiments.propTypes = {
  filteredExperiments: PropTypes.array,
  onSelectExperiment: PropTypes.func,
};

export default connect(state => ({
  filteredExperiments: getFilteredExperiments(state),
}), dispatch => ({
  onSelectExperiment: (experiment) => dispatch(selectExperiment(experiment)),
}))(Experiments);
