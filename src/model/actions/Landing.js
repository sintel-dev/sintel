import { api } from './utils';

// http://127.0.0.1:3000/api/v1/experiments/
// http://127.0.0.1:3000/api/v1/pipelines/
// http://127.0.0.1:3000/api/v1/datasets/

export function fetchExperiments() {
    return function(dispatch) {
        dispatch({ type: 'GET_EXPERIMENTS_REQUEST' });
        return api
            .get('experiments')
            .then(experiments => {
                dispatch({ type: 'GET_EXPERIMENTS_SUCCESS', experiments });
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
            .then(pipelines => dispatch({ type: 'GET_PIPELINES_SUCCESS', pipelines }))
            .catch(err => dispatch({ type: 'GET_PIPELINES_ERROR', err }));
    };
}

export function fetchDatasets() {
    return function(dispatch) {
        dispatch({ type: 'GET_DATASET_REQUEST' });
        return api
            .get('datasets')
            .then(dataSets => {
                dispatch({ type: 'GET_DATASET_SUCCESS', dataSets });
            })
            .catch(err => {
                dispatch({ type: 'GET_DATASET_ERROR', err });
            });
    };
}

export function fetchProjects() {
    return function(dispatch) {
        return dispatch(fetchExperiments())
            .then(() => dispatch(fetchPipelines())
                .then(() => dispatch(fetchDatasets()))
            );
    };
}
