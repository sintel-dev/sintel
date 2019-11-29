import React from 'react';
import PropTypes, { bool } from 'prop-types';
import Loader from '../Common/Loader';

const Projects = ({data}) => {
  const { projectsList, isProjectsLoading } = data;

    const renderProject = (project, index) => (
      <div className="cell" key={index}>
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

    return (
      <div className="item-row scroll-style" id="projects">
        <h2>Datasets</h2>
        <div className="item-wrapper">
          <Loader isLoading={isProjectsLoading}>
              {
                projectsList.length ? projectsList.map((project, index) => renderProject(project, index)) :
                  <p>No projects have been found</p>
              }
        </Loader>
        </div>
      </div>
    );

};

Projects.propTypes = {
  data: PropTypes.object
};

export default Projects;
