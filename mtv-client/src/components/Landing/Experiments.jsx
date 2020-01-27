import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import {
  getFilteredExperiments,
  getIsExperimentsLoading,
  getSelectedPipeline,
  getSelectedExperiment,
} from '../../model/selectors/projects';
import { selectExperiment } from '../../model/actions/landing';

const renderExperiment = (experiment, index, onSelectExperiment, selectedPipeline, selectedExperiment) => {
  const activeClass = selectedPipeline || selectedExperiment === experiment.id ? 'active' : '';
  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectExperiment(experiment.id)}>
      <h3>
        #{index + 1} {experiment.dataset}_{experiment.pipeline}
      </h3>
      <div className="item-data">
        <ul>
          <li>Signals: {experiment.dataruns.length}</li>
          <li>DC: {experiment.date_creation.substring(0, 10)}</li>
        </ul>
      </div>
    </div>
  );
};

const Experiments = ({
  isExperimentsLoading,
  filteredExperiments,
  onSelectExperiment,
  selectedPipeline,
  selectedExperiment,
}) => (
  <div className="item-row scroll-style" id="experiments">
    <h2>Experiments</h2>
    <div className="item-wrapper">
      <Loader isLoading={isExperimentsLoading}>
        {filteredExperiments.length ? (
          filteredExperiments.map((experiment, index) =>
            renderExperiment(experiment, index, onSelectExperiment, selectedPipeline, selectedExperiment),
          )
        ) : (
          <h2>No experiments found</h2>
        )}
      </Loader>
    </div>
  </div>
);

Experiments.propTypes = {
  filteredExperiments: PropTypes.array,
  isExperimentsLoading: PropTypes.bool,
  onSelectExperiment: PropTypes.func,
  selectedPipeline: PropTypes.string,
  selectedExperiment: PropTypes.string,
};

export default connect(
  state => ({
    filteredExperiments: getFilteredExperiments(state),
    isExperimentsLoading: getIsExperimentsLoading(state),
    selectedPipeline: getSelectedPipeline(state),
    selectedExperiment: getSelectedExperiment(state),
  }),
  dispatch => ({
    onSelectExperiment: experiment => dispatch(selectExperiment(experiment)),
  }),
)(Experiments);
