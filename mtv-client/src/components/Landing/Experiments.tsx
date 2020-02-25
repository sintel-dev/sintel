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

const countDatarunEvents = experiment => {
  const { dataruns } = experiment;
  return dataruns.map(datarun => datarun.events.length).reduce((item, accumulator) => item + accumulator, 0);
};

const renderExperiment: React.FC<renderExperimentProps> = ({
  experiment,
  index,
  onSelectExperiment,
  selectedPipeline,
  selectedExperiment,
}) => {
  const activeClass = selectedPipeline || selectedExperiment === experiment.id ? 'active' : '';
  const eventCounts = countDatarunEvents(experiment);
  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectExperiment(experiment.id)}>
      <h3>
        #{index + 1} {experiment.dataset}_{experiment.pipeline}
      </h3>
      <div className="item-data">
        <ul>
          <li>Signals: {experiment.dataruns.length}</li>
          <li>Events: {eventCounts}</li>
          <li>DC: {experiment.date_creation.substring(0, 10)}</li>
        </ul>
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
