import React from 'react';
import { connect } from 'react-redux';
import './Overview.scss';
import FocusChart from '../FocusChart';

import { getSelectedExperimentData, getProcessedDataRuns } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Datarun from './Datarun';
import { RootState } from '../../../model/types';

const mapState = (state: RootState) => ({
  experimentData: getSelectedExperimentData(state),
  processedDataruns: getProcessedDataRuns(state),
});

type StateProps = ReturnType<typeof mapState>;
type Props = StateProps;

const Experiment: React.FC<Props> = ({ experimentData, processedDataruns }) => {
  return (
    <div>
      <Loader isLoading={experimentData.isExperimentDataLoading}>
        <div className="overview-wrapper scroll-style" id="overview-wrapper">
          {!experimentData.isExperimentDataLoading && experimentData.data.dataruns.length ? (
            processedDataruns.map(datarun => <Datarun datarun={datarun} key={datarun.id} />)
          ) : (
            <p>No datarun for current experiment</p>
          )}
        </div>
        <FocusChart />
      </Loader>
    </div>
  );
};

export default connect<StateProps, {}, {}, RootState>(mapState)(Experiment);
