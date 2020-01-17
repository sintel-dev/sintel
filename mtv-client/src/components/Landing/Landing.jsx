import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchProjects } from '../../model/actions/landing';
import Experiment from '../Timeseries/Overview/Experiment';

import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import {
  getSelectedExperiment,
} from '../../model/selectors/projects';

import './Landing.scss';

class Landing extends Component {
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

Landing.propTypes = {
  fetchProjectsList: PropTypes.func,
  isExperimentSelected: PropTypes.string,
};

export default connect(state => ({
  isExperimentSelected: getSelectedExperiment(state),
}), dispatch => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
}))(Landing);
