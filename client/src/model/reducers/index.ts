import { combineReducers } from 'redux';
import datasets from './datasets';
import experiments from './experiments';
import pipelines from './pipelines';
import projects from './projects';
import selectedExperimentData from './experimentData';
import datarun from './datarun';
import users from './users';
import aggregationLevels from './aggregationLevels';
import similarShapes from './similarShapes';
import sidebar from './sidebar';
import events from './events';

const dashBoardReducers = combineReducers({
  users,
  projects,
  datasets,
  pipelines,
  experiments,
  selectedExperimentData,
  datarun,
  aggregationLevels,
  similarShapes,
  sidebar,
  events,
});

export default dashBoardReducers;
