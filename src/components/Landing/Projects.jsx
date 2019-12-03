import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getProjectsData } from '../../model/selectors/projects';
import { selectProject } from '../../model/actions/landing';

const renderProject = (project, index, onSelectProject) => (
  <div className="cell" key={index} onClick={() => onSelectProject(project)}>
    <h3>{project.name}</h3>
    <div className="item-data">
      <ul>
        <li>{project.signalNum} Signals</li>
        <li>{project.pipelines.length} unique pipelines</li>
      </ul>
      <ul className="last">
        <li>{project.experimentNum} experiments</li>
      </ul>
    </div>
  </div>);

const Projects = (props) => {
  const { isProjectsLoading, projectsList } = props.projectsData;
  const { onSelectProject } = props;
  return (
    <div className="item-row scroll-style" id="projects">
      <h2>Datasets</h2>
      <div className="item-wrapper">
        <Loader isLoading={isProjectsLoading}>
          {
              projectsList.projects && projectsList.projects.length ?
                projectsList.projects.map((project, index) => renderProject(project, index, onSelectProject)) :
                <p>No datasets have been found</p>
            }
        </Loader>
      </div>
    </div>);
};

Projects.propTypes = {
  projectsData: PropTypes.object,
  onSelectProject: PropTypes.func,
};

export default connect(state => ({
  projectsData: getProjectsData(state),
}), dispatch => ({
  onSelectProject: (project) => dispatch(selectProject(project)),
}))(Projects);
