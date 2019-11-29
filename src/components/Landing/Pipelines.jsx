import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../Common/Loader';

const renderPipeline = (pipeline, index) => (
  <div className="cell" key={index}>
    <h3>{pipeline.name}</h3>
    <div className="item-data">
      <ul>
        <li>DC: {pipeline.insert_time.substring(0, 10)}</li>
        <li>By: {pipeline.created_by || 'null' }</li>
      </ul>
    </div>
  </div>);

const Pipelines = ({ pipeLines }) => {
  const { isPipelinesLoading, pipelineList } = pipeLines;
  return (
    <div className="item-row scroll-style" id="pipelines">
      <h2>Pipelines</h2>
      <div className="item-wrapper">
        <Loader isLoading={isPipelinesLoading}>
          {
            pipelineList.length ? pipelineList.map(renderPipeline) :
            <p>No pipelines have been found</p>
          }
        </Loader>
      </div>
    </div>
  );
};

Pipelines.propTypes = {
  pipeLines: PropTypes.object,
};

export default Pipelines;
