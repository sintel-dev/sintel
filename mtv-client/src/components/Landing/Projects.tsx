import React from 'react';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getProjectsList, getIsProjectsLoading, getSelectedProjectName } from '../../model/selectors/projects';
import { selectProject } from '../../model/actions/landing';
import { RootState } from '../../model/types';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const Projects: React.FC<Props> = ({ projects, isProjectsLoading, onSelectProject, selectedProjectName }) => (
  <div className="item-row scroll-style" id="projects">
    <h2>Datasets</h2>
    <div className="item-wrapper">
      <Loader isLoading={isProjectsLoading}>
        {projects && projects.length ? (
          projects.map((project, index) => RenderProject({ project, index, onSelectProject, selectedProjectName }))
        ) : (
          <p>No datasets have been found</p>
        )}
      </Loader>
    </div>
  </div>
);

let props: Props;
type renderProjectProps = {
  project: any;
  index: number;
  onSelectProject: typeof props.onSelectProject;
  selectedProjectName: typeof props.selectedProjectName;
};

export const RenderProject: React.FC<renderProjectProps> = ({
  project,
  index,
  onSelectProject,
  selectedProjectName,
}) => {
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

const mapState = (state: RootState) => ({
  projects: getProjectsList(state),
  isProjectsLoading: getIsProjectsLoading(state),
  selectedProjectName: getSelectedProjectName(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectProject: (projectName: string) => dispatch(selectProject(projectName)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Projects);
