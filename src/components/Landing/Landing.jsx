import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchProjects } from '../../model/actions/landing';

import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import './Landing.scss';

class Landing extends Component {
  componentDidMount() {
    this.props.fetchProjectsList();
  }

  render() {
    return (
      <div>
        <Projects />
        <Pipelines />
        <Experiments />
      </div>
    );
  }
}

Landing.propTypes = {
    fetchProjectsList: PropTypes.func,
};

export default connect(null, dispatch => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
}))(Landing);
