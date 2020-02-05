import React from 'react';
import { connect } from 'react-redux';
import { fetchProjects } from '../../model/actions/landing';
import Experiment from '../Timeseries/Overview/Experiment';

import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import { getSelectedExperiment } from '../../model/selectors/projects';
import { RootState } from '../../model/types';

import './Landing.scss';

const mapState = (state: RootState) => ({
  isExperimentSelected: getSelectedExperiment(state),
});

const mapDispatch = (dispatch: Function) => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class Landing extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchProjectsList();
  }

  render() {
    const isMainPageActive = !this.props.isExperimentSelected ? 'active' : '';
    const isExperimentPageActive = this.props.isExperimentSelected ? 'active' : '';

    return (
      <div className="page-landing">
        <div className="page-wrapper">
          <div className={`projects-wrapper ${isMainPageActive}`}>
            <Projects />
            <Pipelines />
            <Experiments />
          </div>
          <div className={`experiments-wrapper ${isExperimentPageActive}`}>
            <Experiment />
          </div>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Landing);
