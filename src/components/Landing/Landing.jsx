import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchProjects } from '../../model/actions/landing';

import {
  getProjectsData,
  getPipelinesData,
  getExperimentsData,
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
      experimentsData,
    } = this.props;

    return (
      <div>
        <Projects projects={projectsData} />
        <Pipelines pipeLines={pipelinesData} />
        <Experiments experiments={experimentsData} />
      </div>
    );
  }
}

Landing.propTypes = {
    fetchProjectsList: PropTypes.func,
    projectsData: PropTypes.object,
    pipelinesData: PropTypes.object,
    experimentsData: PropTypes.object,

};

export const mapStateToProps = state => ({
  projectsData: getProjectsData(state),
  pipelinesData: getPipelinesData(state),
  experimentsData: getExperimentsData(state),
});

export const mapDispatchToProps = dispatch => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
