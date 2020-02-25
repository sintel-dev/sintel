import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import Loader from '../Common/Loader';
import {
  getFilteredExperiments,
  getIsExperimentsLoading,
  getSelectedPipeline,
  getSelectedExperiment,
} from '../../model/selectors/projects';
import { selectExperiment } from '../../model/actions/landing';
import { RootState, ExperimentDataType } from '../../model/types';
import drawMatrix, { TagStats, Scale as MatrixScale } from './Matrix';
import { fromTagToID } from './utils';

let props: Props;
type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;
type renderExperimentProps = {
  experiment: ExperimentDataType;
  tagStats: TagStats;
  matrixScale: MatrixScale;
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
}) => {
  // Compute maxTagNum, maxEventNum, and maxScore
  // which would be used for plotting Matrix
  let experiments = filteredExperiments;
  let maxTagNum = Number.MIN_SAFE_INTEGER;
  let maxEventNum = Number.MIN_SAFE_INTEGER;
  let maxScore = Number.MIN_SAFE_INTEGER;
  let tagStatsList: TagStats[] = [];

  _.each(experiments, experiment => {
    let tagStats: { [index: string]: number } = {};
    for (let i = 0; i < 7; i += 1) {
      tagStats[String(i)] = 0;
    }
    _.each(experiment.dataruns, datarun => {
      for (let i = 0; i < datarun.events.length; i += 1) {
        let tid = fromTagToID(datarun.events[i].tag);
        tid = tid === 'untagged' ? '0' : tid;
        if (!_.has(tagStats, tid)) {
          tagStats[tid] = 0;
        }
        tagStats[tid] += 1;
        maxTagNum = maxTagNum < tagStats[tid] ? tagStats[tid] : maxTagNum;

        maxScore = maxScore > datarun.events[i].score ? maxScore : datarun.events[i].score;
        maxEventNum = maxEventNum < datarun.events.length ? datarun.events.length : maxEventNum;
      }
    });
    tagStatsList.push(tagStats);
  });
  const matrixScale: MatrixScale = {
    maxTagNum,
    maxEventNum,
    maxScore,
  };

  return (
    <div className="item-row scroll-style" id="experiments" data-name="experiments">
      <h2>Experiments</h2>
      <div className="item-wrapper">
        <Loader isLoading={isExperimentsLoading}>
          {filteredExperiments.length ? (
            filteredExperiments.map((experiment, index) =>
              renderExperiment({
                experiment,
                tagStats: tagStatsList[index],
                matrixScale,
                index,
                onSelectExperiment,
                selectedPipeline,
                selectedExperiment,
              }),
            )
          ) : (
            <h2>No experiments found</h2>
          )}
        </Loader>
      </div>
    </div>
  );
};

const countDatarunEvents = experiment => {
  const { dataruns } = experiment;
  return dataruns.map(datarun => datarun.events.length).reduce((item, accumulator) => item + accumulator, 0);
};

const renderExperiment: React.FC<renderExperimentProps> = ({
  experiment,
  tagStats,
  matrixScale,
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
          <li>By: {`${experiment.created_by}`}</li>
        </ul>
        {drawMatrix(experiment, tagStats, matrixScale)}
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
