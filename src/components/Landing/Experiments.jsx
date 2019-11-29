import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../Common/Loader';

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

const Experiments = ({ experiments }) => {
  const { experimentsList, isExperimentsLoading } = experiments;
  return (
    <div className="item-row scroll-style" id="experiments">
      <h2>Experiments</h2>
      <div className="item-wrapper">
        <Loader isLoading={isExperimentsLoading}>
          {
            experimentsList.length ? experimentsList.map(renderExperiment) :
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
