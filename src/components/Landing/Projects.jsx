import React from 'react';
import PropTypes, { bool } from 'prop-types';
import Loader from '../Common/Loader';

const Projects = (props) => {
  // @TODO - investigate isDatasetLoading
  const { projects, isDatasetLoading } = props;
  console.log(props);
    const renderProject = (project) => (
      <div className="cell" key={project.name}>
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
      </div>
    );
    console.log(isDatasetLoading);

    return (
      <Loader isLoading={isDatasetLoading}>
        {projects.length ?
          <div className="item-row scroll-style" id="projects">
            <h2>Datasets</h2>
            <div className="item-wrapper">
              {projects.map(project => renderProject(project))}
            </div>
          </div>
           :
          <div className="project-row">
            <p>No project found</p>
          </div>}
      </Loader>
    );

    // return (
        // projects && projects.length ?
        //   <div className="item-row scroll-style" id="projects">
        //     <h2>Datasets</h2>
        //     <div className="item-wrapper">
        //       {projects.map(project => renderProject(project))}
        //     </div>
        //   </div>
        //    :
        //   <div className="project-row">
        //     <p>No project found</p>
        //   </div>
    // );
};

Projects.propType = {
  projects: PropTypes.array,
  isDatasetLoading: bool
};

export default Projects;
