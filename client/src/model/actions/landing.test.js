import mockAxios from 'axios';
import * as actions from './landing';
import { configureStore } from '../store';

// importing mocks
import * as pipelines from '../../tests/testmocks/pipelines';
import * as experiments from '../../tests/testmocks/experiments';
import * as datasets from '../../tests/testmocks/datasets';
import * as datarun from '../../tests/testmocks/dataRun';

describe('Landing async actions ->', () => {
  const store = configureStore();

  it('Test FETCH_EXPERIMENTS experiments', async () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: experiments }));

    const promise = store.dispatch(actions.fetchExperiments());
    expect(store.getState().experiments.isExperimentsLoading).toBe(true);

    const response = await promise;
    expect(store.getState().experiments.experimentsList).toEqual(response.experiments);
    expect(store.getState().experiments.isExperimentsLoading).toBe(false);
  });

  it('Creates FETCH_PIPELINES when fetching pipelines', async () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: pipelines }));

    const promise = store.dispatch(actions.fetchPipelines());
    let storeState = store.getState().pipelines;
    expect(storeState.isPipelinesLoading).toEqual(true);

    const response = await promise;
    storeState = store.getState().pipelines;
    expect(storeState.pipelineList).toEqual(response.pipelines);
    expect(storeState.isPipelinesLoading).toEqual(false);
  });

  it('Creates FETCH_DATASETS when fetching datasets', async () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: datasets }));

    const promise = store.dispatch(actions.fetchDatasets());
    expect(store.getState().datasets.isDatasetLoading).toBe(true);

    const response = await promise;
    expect(store.getState().datasets.isDatasetLoading).toBe(false);
    expect(store.getState().datasets.dataSetsList).toBe(response.datasets);
  });

  it('Should handle SELECT_PIPELINE', () => {
    store.dispatch(actions.selectPipeline('cyclegan'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('cyclegan');

    store.dispatch(actions.selectPipeline('lstm'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('lstm');
  });

  it('Should handle SELECT_EXPERIMENT', async () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: datarun }));

    const promise = store.dispatch(actions.selectExperiment(null, '5da80104abc56689357439e5'));
    expect(store.getState().experiments.isExperimentsLoading).toBe(false);
    expect(store.getState().experiments.selectedExperimentID).toBe('5da80104abc56689357439e5');
    expect(store.getState().selectedExperimentData.isExperimentDataLoading).toBe(true);

    const result = await promise;
    expect(store.getState().selectedExperimentData.isExperimentDataLoading).toBe(false);
    expect(store.getState().selectedExperimentData.data.dataRun).toEqual(result.dataRun);
  });

  it('Should handle SELECT_PROJECT', () => {
    store.dispatch(actions.selectProject('MSL'));
    expect(store.getState().projects.selectedProject).toEqual('MSL');

    store.dispatch(actions.selectProject('SMAP'));
    expect(store.getState().projects.selectedProject).toEqual('SMAP');
  });
});
