import React from 'react';
import PropTypes from 'prop-types';


const Experiments = ({ experiments }) => {
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
      experiments && experiments.length ?
        <div className="item-row scroll-style" id="experiments">
          <h2>Experiments</h2>
          <div className="item-wrapper">
            {experiments.map((experiment, index) => renderExperiment(experiment, index))}
          </div>
        </div>
      :
        <div className="item-row">
          <h2>No experiments found</h2>
        </div>
    );
};

Experiments.propType = {
    experiments: PropTypes.array
};

export default Experiments;
