import { combineReducers } from 'redux';
import datasets from './datasets';
import experiments from './experiments';
import pipelines from './pipelines';
import projects from './projects';
import experimentData from './experimentData';
import datarun from './datarun';

export default combineReducers({
    projects,
    datasets,
    pipelines,
    experiments,
    experimentData,
    datarun,
});
