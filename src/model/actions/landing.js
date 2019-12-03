import { api } from './utils';


// http://127.0.0.1:3000/api/v1/experiments/
// http://127.0.0.1:3000/api/v1/pipelines/
// http://127.0.0.1:3000/api/v1/datasets/

export function fetchExperiments() {
    return function(dispatch) {
        dispatch({ type: 'GET_EXPERIMENTS_REQUEST' });
        return api
            .get('experiments')
            .then(response => {
                dispatch({ type: 'GET_EXPERIMENTS_SUCCESS', experiments: response.experiments });
            })
            .catch(err => {
                dispatch({ type: 'GET_EXPERIMENTS_ERROR', err });
            });
    };
}

export function fetchPipelines() {
    return function (dispatch) {
        dispatch({ type: 'GET_PIPELINES_REQUEST' });
        return api
            .get('pipelines')
            .then(response => dispatch({ type: 'GET_PIPELINES_SUCCESS', pipelines: response.pipelines }))
            .catch(err => dispatch({ type: 'GET_PIPELINES_ERROR', err }));
    };
}

export function fetchDatasets() {
    return function(dispatch) {
        dispatch({ type: 'GET_DATASETS_REQUEST' });
        return api
            .get('datasets')
            .then(response => {
                dispatch({ type: 'GET_DATASETS_SUCCESS', dataSets: response.datasets });
            })
            .catch(err => {
                dispatch({ type: 'GET_DATASETS_ERROR', err });
            });
    };
}

export function fetchProjects() {
    return function(dispatch) {
        return dispatch(fetchExperiments())
            .then(() => dispatch(fetchPipelines())
                .then(() => dispatch(fetchDatasets())),
            );
    };
}

export function selectProject(project) {
    return function(dispatch) {
        dispatch({ type: 'SELECT_PROJECT', project });
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
