import { api } from './utils';
import { getSelectedPipeline } from '../selectors/projects';

export function fetchExperiments() {
    return function(dispatch) {
        const promise = api.get('experiments');
        dispatch({ type: 'GET_EXPERIMENTS', promise });
        return promise;
    };
}

export function fetchPipelines() {
    return function (dispatch) {
        const promise = api.get('pipelines');
        dispatch({ type: 'GET_PIPELINES', promise });
        return promise;
    };
}

export function fetchDatasets() {
    return function(dispatch) {
        const promise = api.get('datasets');
        dispatch({ type: 'GET_DATASETS', promise });
        return promise;
    };
}

export function fetchProjects() {
    return function(dispatch) {
        const promise = Promise.all([
            dispatch(fetchExperiments()),
            dispatch(fetchPipelines()),
            dispatch(fetchDatasets()),
        ]);
        dispatch({
            type: 'FETCH_PROJECTS',
            promise,
        });
    };
}

export function selectProject(activeProject) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_PROJECT', activeProject });
    };
}

export function selectPipeline(selectedPipelineName) {
    return function(dispatch, getState) {
        const currentSelectedPipeline = getSelectedPipeline(getState());
        selectedPipelineName = selectedPipelineName !== currentSelectedPipeline ? selectedPipelineName : null;
        dispatch({ type: 'SELECT_PIPELINE', selectedPipelineName });
    };
}

export function selectExperiment (experimentID) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_EXPERIMENT', experimentID });
    };
}
