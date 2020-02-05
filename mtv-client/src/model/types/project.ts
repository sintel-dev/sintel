import { ExperimentsResponse } from './experiment';
import { PipelinesResponse } from './pipeline';
import { DatasetsResponse } from './dataset';

export const FETCH_PROJECTS = 'FETCH_PROEJCTS';
export const SELECT_PROJECT = 'SELECT_PROJECT';

export type FetchProjectsAction = {
  type: typeof FETCH_PROJECTS;
  promise: Promise<[ExperimentsResponse, PipelinesResponse, DatasetsResponse]>;
  result?: [ExperimentsResponse, PipelinesResponse, DatasetsResponse]; // only exist when promise gets resolved
  error?: string; // only exist when promise gets rejected
};

export type SelectProjectAction = {
  type: typeof SELECT_PROJECT;
  activeProject: string;
};

/**
 * Project State format
 */
export type ProjectState = {
  selectedProject: string;
};
