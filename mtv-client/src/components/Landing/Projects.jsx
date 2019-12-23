import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import {
  getProjectsList,
  getIsProjectsLoading,
  getSelectedProjectName,
} from '../../model/selectors/projects';
import { selectProject } from '../../model/actions/landing';

const renderProject = (project, index, onSelectProject, selectedProjectName) => {
  const activeClass = project.name === selectedProjectName ? 'active' : '';
  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectProject(project.name)}>
      <h3>{project.name}</h3>
      <div className="item-data">
        <ul>
          <li>{project.signalNum} Signals</li>
          <li>{project.uniquePipelineNum} unique pipelines</li>
        </ul>
        <ul className="last">
          <li>{project.experimentNum} experiments</li>
        </ul>
      </div>
    </div>
  );
};

const Projects = ({ projects, isProjectsLoading, onSelectProject, selectedProjectName }) => (
  <div className="item-row scroll-style" id="projects">
    <h2>Datasets</h2>
    <div className="item-wrapper">
      <Loader isLoading={isProjectsLoading}>
        {
          projects && projects.length ?
            projects.map((project, index) => renderProject(project, index, onSelectProject, selectedProjectName)) :
            <p>No datasets have been found</p>
        }
      </Loader>
    </div>
  </div>);

Projects.propTypes = {
  projects: PropTypes.array,
  isProjectsLoading: PropTypes.bool,
  onSelectProject: PropTypes.func,
  selectedProjectName: PropTypes.string,
};

export default connect(state => ({
  projects: getProjectsList(state),
  isProjectsLoading: getIsProjectsLoading(state),
  selectedProjectName: getSelectedProjectName(state),
}), dispatch => ({
  onSelectProject: (projectName) => dispatch(selectProject(projectName)),
}))(Projects);
