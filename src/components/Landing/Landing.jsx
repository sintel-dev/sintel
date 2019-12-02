import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  fetchProjects,
  selectPipeline,
 } from '../../model/actions/landing';

import {
  getProjectsData,
  getPipelinesData,
  getFilteredExperiments,
} from '../../model/selectors/projects';


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
      projectsData,
      pipelinesData,
      filteredExperiments,
      onSelectPipeline,
    } = this.props;

    return (
      <div>
        <Projects projects={projectsData} />
        <Pipelines pipeLines={pipelinesData} onPipelineSelect={onSelectPipeline} />
        <Experiments experiments={filteredExperiments} isLoading={false} />
      </div>
    );
  }
}

Landing.propTypes = {
    fetchProjectsList: PropTypes.func,
    projectsData: PropTypes.object,
    pipelinesData: PropTypes.object,
    filteredExperiments: PropTypes.array,
    onSelectPipeline: PropTypes.func,
};

export const mapStateToProps = state => ({
  projectsData: getProjectsData(state),
  pipelinesData: getPipelinesData(state),
  filteredExperiments: getFilteredExperiments(state),
});

export const mapDispatchToProps = dispatch => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
  onSelectPipeline: (pipelineName) => dispatch(selectPipeline(pipelineName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
