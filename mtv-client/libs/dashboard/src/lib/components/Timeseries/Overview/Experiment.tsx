import React, { Component } from 'react';
import { connect } from 'react-redux';
import FocusChart from '../FocusChart/FocusChart';
import { getSelectedExperimentData, getProcessedDataRuns } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Datarun from './Datarun';
import FocusChartControls from '../FocusChartControls';
import { RootState } from '../../../model/types';
import Sidebar from '../Sidebar';
import { selectExperiment } from '../../../model/actions/landing';
import { getSelectedExperiment } from '../../../model/selectors/projects';
import './Overview.scss';

type ownProps = {
  location: any;
};
type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & ownProps;

class Experiment extends Component<Props> {
  componentDidMount() {
    const { currenteExperimentID } = this.props;
    const experimentID = this.props.location.pathname.split('/')[2];

    if (currenteExperimentID !== experimentID) {
      this.props.onSelectExperiment(this.props.location, experimentID);
    }
  }

  render() {
    const { experimentData, processedDataruns } = this.props;
    return (
      <div className="experiment">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <div className="left-sidebar">
            <div className="overview-wrapper scroll-style" id="overview-wrapper">
              {!experimentData.isExperimentDataLoading && experimentData.data.dataruns.length ? (
                processedDataruns.map(datarun => <Datarun datarun={datarun} key={datarun.id} />)
              ) : (
                <p>No datarun for current experiment</p>
              )}
              <div id="brushTooltip" className="brush-tooltip" />
            </div>
            <FocusChartControls />
            <FocusChart />
          </div>
          <Sidebar />
        </Loader>
        <div className="clear" />
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  experimentData: getSelectedExperimentData(state),
  processedDataruns: getProcessedDataRuns(state),
  currenteExperimentID: getSelectedExperiment(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectExperiment: (history, experiment: string) => dispatch(selectExperiment(history, experiment)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapState,
  mapDispatch,
)(Experiment);
