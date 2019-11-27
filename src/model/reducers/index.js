import { combineReducers } from 'redux';
import datasets from './datasets';
import experiments from './experiments';
import pipelines from './pipelines';

export default combineReducers({
    experiments,
    datasets,
    pipelines
});
