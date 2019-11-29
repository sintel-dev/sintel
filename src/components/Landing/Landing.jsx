import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchProjects } from '../../model/actions/Landing';
import {
  isProjectsLoading,
  getProjectsList
} from '../../model/selectors/projects';


import {
  getExperiments,
  isExperimentsLoading
} from '../../model/selectors/experiments';

import {
  getPipelines,
  isPipelinesLoading
} from '../../model/selectors/pipelines';

import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import './Landing.scss';

class Landing extends Component {
  componentDidMount() {
    this.props.fetchProjectsList();
  }

  render() {
    const {
      projectsList,
      isPipelinesLoading,
      pipelines,
      isExperimentsLoading,
      experiments,
      isProjectsLoading
    } = this.props;
    const pipelineData = pipelines;
    return (
      <div>
        <Projects data={{ projectsList, isProjectsLoading }} />
        <Pipelines data={{pipelineData, isPipelinesLoading}} />
        <Experiments data={{experiments, isExperimentsLoading}}  /> {/*isExperimentsLoading experiments={experiments.experiments}*/}
      </div>
    );
  }
}

Landing.propTypes = {
    fetchProjectsList: PropTypes.func,
    projectsList: PropTypes.array,
    pipelines: PropTypes.object,
    experiments: PropTypes.object
};

export const mapStateToProps = state => ({
  isPipelinesLoading: isPipelinesLoading(state),
  isExperimentsLoading: isExperimentsLoading(state),
  // isDatasetLoading: isDatasetLoading(state),


  isProjectsLoading: isProjectsLoading(state),
  projectsList: getProjectsList(state),
  pipelines: getPipelines(state),
  experiments: getExperiments(state)
});

export const mapDispatchToProps = dispatch => ({
  fetchProjectsList: () => dispatch(fetchProjects())
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
