import React from 'react';
import PropTypes from 'prop-types';


const Pipelines = ({ pipelines }) => {
    const renderPipeline = (pipeline, index) => (
      <div className="cell" key={index}>
        <h3>{pipeline.name}</h3>
        <div className="item-data">
          <ul>
            <li>DC: {pipeline.insert_time.substring(0, 10)}</li>
            <li>By: {pipeline.created_by ? pipeline.created_by : 'null' }</li>
          </ul>
        </div>
      </div>);

    return (
        pipelines && pipelines.length ?
          <div className="item-row scroll-style" id="pipelines">
            <h2>Pipelines</h2>
            <div className="item-wrapper">
              {pipelines.map((pipeline, index) => renderPipeline(pipeline, index))}
            </div>
          </div>
        :
          <div className="item-row">
            <h2>No pipelines found</h2>
          </div>
    );
};

Pipelines.propTypes = {
    pipelines: PropTypes.array
};

export default Pipelines;
