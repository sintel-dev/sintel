import { api } from './utils';


// http://127.0.0.1:3000/api/v1/experiments/
// http://127.0.0.1:3000/api/v1/pipelines/
// http://127.0.0.1:3000/api/v1/datasets/

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

export function selectPipeline(pipelineName) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_PIPELINE', pipelineName });
    };
}

export function selectExperiment (experimentName) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_EXPERIMENT', experimentName });
    };
}
