import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../Common/Loader';

const Experiments = ({ experiments }) => {
  const { experimentsList, isExperimentsLoading } = experiments;

  const renderExperiment = (experiment, index) => (
    <div className="cell" key={index}>
      <h3>#{index + 1} {experiment.dataset}_{experiment.pipeline}</h3>
      <div className="item-data">
        <ul>
          <li>Signals: {experiment.dataruns.length}</li>
          <li>DC: {experiment.date_creation.substring(0, 10)}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="item-row scroll-style" id="experiments">
      <h2>Experiments</h2>
      <div className="item-wrapper">
        <Loader isLoading={isExperimentsLoading}>
          {
            experimentsList && experimentsList.experiments ?
            experimentsList.experiments.map((experiment, index) => renderExperiment(experiment, index)) :
            <h2>No experiments found</h2>
          }
        </Loader>
      </div>
    </div>
  );
};

Experiments.propTypes = {
  experiments: PropTypes.object,
};

export default Experiments;
