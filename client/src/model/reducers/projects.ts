import createReducer from '../store/createReducer';
import { ProjectState, SelectProjectAction, FetchProjectsAction } from '../types';

const initialState: ProjectState = {
    selectedProject: null,
};

function SELECT_PROJECT(nextState: ProjectState, action: SelectProjectAction) {
    nextState.selectedProject = action.activeProject;
}

function FETCH_PROJECTS_SUCCESS(nextState: ProjectState, action: FetchProjectsAction) {
    nextState.selectedProject = action.result[0].experiments[0].project;
}

export default createReducer<ProjectState>(initialState, {
    SELECT_PROJECT,
    FETCH_PROJECTS_SUCCESS,
});
