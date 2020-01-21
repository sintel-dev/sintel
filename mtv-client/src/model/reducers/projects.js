import createReducer from '../store/createReducer';

function SELECT_PROJECT(nextState, { activeProject }) {
  nextState.selectedProject = activeProject;
}

function FETCH_PROJECTS_SUCCESS(nextState, { result }) {
  nextState.selectedProject = result[0].experiments[0].project;
}

export default createReducer(
  {
    selectedProject: null,
  },
  {
    SELECT_PROJECT,
    FETCH_PROJECTS_SUCCESS,
  },
);
