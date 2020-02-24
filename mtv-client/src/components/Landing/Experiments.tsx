import React from 'react';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import {
  getFilteredExperiments,
  getIsExperimentsLoading,
  getSelectedPipeline,
  getSelectedExperiment,
} from '../../model/selectors/projects';
import { selectExperiment } from '../../model/actions/landing';
import { RootState, ExperimentDataType } from '../../model/types';
import MatrixSummary from './MatrixSummary';

let props: Props;
type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;
type renderExperimentProps = {
  experiment: ExperimentDataType;
  index: number;
  selectedPipeline: typeof props.selectedExperiment;
  selectedExperiment: typeof props.selectedExperiment;
  onSelectExperiment: typeof props.onSelectExperiment;
};

const Experiments: React.FC<Props> = ({
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
            renderExperiment({ experiment, index, onSelectExperiment, selectedPipeline, selectedExperiment }),
          )
        ) : (
          <h2>No experiments found</h2>
        )}
      </Loader>
    </div>
  </div>
);

const renderExperiment: React.FC<renderExperimentProps> = ({
  experiment,
  index,
  onSelectExperiment,
  selectedPipeline,
  selectedExperiment,
}) => {
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
          <li>Events: todo</li>
          <li>By: todo</li>
        </ul>
        <MatrixSummary></MatrixSummary>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  filteredExperiments: getFilteredExperiments(state),
  isExperimentsLoading: getIsExperimentsLoading(state),
  selectedPipeline: getSelectedPipeline(state),
  selectedExperiment: getSelectedExperiment(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectExperiment: (experiment: string) => dispatch(selectExperiment(experiment)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Experiments);
