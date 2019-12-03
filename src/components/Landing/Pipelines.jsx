import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getPipelinesData } from '../../model/selectors/projects';
import { selectPipeline } from '../../model/actions/landing';

const renderPipeline = (pipeline, index, onPipelineSelect) => (
  <div className="cell" key={index} onClick={() => onPipelineSelect(pipeline.name)}>
    <h3>{pipeline.name}</h3>
    <div className="item-data">
      <ul>
        <li>DC: {pipeline.insert_time.substring(0, 10)}</li>
        <li>By: {pipeline.created_by || 'null' }</li>
      </ul>
    </div>
  </div>);

const Pipelines = (props) => {
  const { pipelineList, isPipelinesLoading } = props.pipelinesData;
  const { onSelectPipeline } = props;
  return (
    <div className="item-row scroll-style" id="pipelines">
      <h2>Pipelines</h2>
      <div className="item-wrapper">
        <Loader isLoading={isPipelinesLoading}>
          {
            pipelineList.length ?
              pipelineList.map((pipeline, index) =>
              renderPipeline(pipeline, index, onSelectPipeline)) :
              <p>No pipelines have been found</p>
          }
        </Loader>
      </div>
    </div>
  );
};

Pipelines.propTypes = {
  pipelinesData: PropTypes.object,
  onSelectPipeline: PropTypes.func,
};

export default connect(state => ({
  pipelinesData: getPipelinesData(state),
}), dispatch => ({
  onSelectPipeline: (pipelineName) => dispatch(selectPipeline(pipelineName)),
}))(Pipelines);

// export default Pipelines;
