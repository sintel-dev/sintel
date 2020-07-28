import { DatarunDataType } from './datarun';

export const FETCH_EXPERIMENTS = 'FETCH_EXPERIMENTS';
export const SELECT_EXPERIMENT = 'SELECT_EXPERIMENT';
export const FETCH_EXPERIMENT_DATA = 'FETCH_EXPERIMENT_DATA';

export type FetchExperimentsAction = {
    type: typeof FETCH_EXPERIMENTS;
    promise: Promise<ExperimentsResponse>;
    result?: ExperimentsResponse; // only exist when promise gets resolved
    error?: string; // only exist when promise gets rejected
};

export type SelectExperimentAction = {
    type: typeof SELECT_EXPERIMENT;
    selectedExperimentID: string;
};

/**
 * Experiment State format
 */
export type ExperimentState = {
    isExperimentsLoading: boolean;
    experimentsList: ExperimentDataType[];
    selectedExperimentID: string;
    isExperimentDataLoading: boolean;
    experimentDetails: ExperimentDataType[];
};

/**
 * The single experiment item fetched from server with RESTAPI
 * API: find | delete | create | update
 */
export type ExperimentDataType = {
    id: string;
    project: string;
    dataset: string;
    date_creation: string;
    created_by: string;
    pipeline: string;
    dataruns: DatarunDataType[];
};

/**
 * The array of experiment items fetched from server with RESTAPI
 * API: all
 */
export type ExperimentsResponse = {
    experiments: ExperimentDataType[];
};
