import React from 'react';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getPipelinesData, getSelectedPipeline } from '../../model/selectors/projects';
import { selectPipeline } from '../../model/actions/landing';
import { RootState, PipelineDataType } from '../../model/types';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const Pipelines: React.FC<Props> = (props) => {
  const { onSelectPipeline, selectedPipeline, pipelinesData } = props;
  const { pipelineList, isPipelinesLoading } = pipelinesData;

  return (
    <div className="item-row scroll-style" id="pipelines">
      <h2>Pipelines</h2>
      <div className="item-wrapper">
        <Loader isLoading={isPipelinesLoading}>
          {pipelineList.length ? (
            pipelineList.map((pipeline, index) =>
              RenderPipeline({ pipeline, index, onSelectPipeline, selectedPipeline }),
            )
          ) : (
            <p>No pipelines have been found</p>
          )}
        </Loader>
      </div>
    </div>
  );
};

let props: Props;
type renderPipelineProps = {
  pipeline: PipelineDataType;
  index: number;
  onSelectPipeline: typeof props.onSelectPipeline;
  selectedPipeline: typeof props.selectedPipeline;
};

export const RenderPipeline: React.FC<renderPipelineProps> = ({
  pipeline,
  index,
  onSelectPipeline,
  selectedPipeline,
}) => {
  const activeClass = selectedPipeline === pipeline.name ? 'active' : '';

  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectPipeline(pipeline.name)}>
      <h3>{pipeline.name}</h3>
      <div className="item-data">
        <ul>
          <li>DC: {pipeline.insert_time.substring(0, 10)}</li>
          <li>By: {pipeline.created_by || 'null'}</li>
        </ul>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  pipelinesData: getPipelinesData(state),
  selectedPipeline: getSelectedPipeline(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectPipeline: (pipelineName) => dispatch(selectPipeline(pipelineName)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Pipelines);
