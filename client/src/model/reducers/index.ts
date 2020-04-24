import { combineReducers } from 'redux';
import datasets from './datasets';
import experiments from './experiments';
import pipelines from './pipelines';
import projects from './projects';
import selectedExperimentData from './experimentData';
import datarun from './datarun';
import users from './users';

const dashBoardReducers = combineReducers({
  users,
  projects,
  datasets,
  pipelines,
  experiments,
  selectedExperimentData,
  datarun,
});

export default dashBoardReducers;