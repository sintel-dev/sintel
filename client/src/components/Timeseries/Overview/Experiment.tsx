import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
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

export interface LocalState {
  dataRuns: Array<any>;
}
type ownProps = {
  location: any;
};
type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & ownProps;

class Experiment extends Component<Props, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      dataRuns: [],
    };
  }

  componentDidMount() {
    const { currenteExperimentID } = this.props;
    const experimentID = this.props.location.pathname.split('/')[2];

    if (currenteExperimentID !== experimentID) {
      this.props.onSelectExperiment(this.props.location, experimentID);
    }
    this.setState({
      dataRuns: this.props.processedDataruns,
    });
  }

  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate(prevProps) {
    if (this.props.processedDataruns !== prevProps.processedDataruns) {
      this.setState({
        dataRuns: this.props.processedDataruns,
      });
    }
  }
  /* eslint-enable react/no-did-update-set-state */

  render() {
    const { experimentData } = this.props;
    const { dataRuns } = this.state;
    return (
      <div className="experiment">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <div className="left-sidebar">
            <div className="overview-wrapper scroll-style" id="overview-wrapper">
              {dataRuns.length ? (
                <ul>
                  <ReactSortable
                    handle=".grip"
                    animation={250}
                    list={dataRuns}
                    setList={(newState) => this.setState({ dataRuns: newState })}
                  >
                    {dataRuns.map((item) => (
                      <Datarun datarun={item} key={item.id} />
                    ))}
                  </ReactSortable>
                </ul>
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

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Experiment);
