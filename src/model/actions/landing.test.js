import fetchMock from 'fetch-mock';
import * as actions from './landing';
import { configureStore } from '../store';

// importing mocks
import * as pipelines from '../../tests/testmocks/pipelines';
import * as experiments from '../../tests/testmocks/experiments';
import * as datasets from '../../tests/testmocks/datasets';

describe('async actions', () => {
  const store = configureStore();
  afterEach(() => {
    fetchMock.restore();
  });

  it('Creates GET_PIPELINES when fetching pipelines', async () => {
    fetchMock.getOnce('/api/v1/pipelines', {
      body: { pipelines },
    });

    const promise = store.dispatch(actions.fetchPipelines());
    let storeState = store.getState().pipelines;
    expect(storeState.isPipelinesLoading).toEqual(true);

    const response = await promise;
    storeState = store.getState().pipelines;
    expect(storeState.pipelineList).toEqual(response.pipelines);
  });

  it('Creates GET_EXPERIMENTS when fetching experiments', async () => {
    fetchMock.getOnce('/api/v1/experiments', {
      body: { experiments },
      headers: { 'content-type': 'application/json' },
    });

    const promise = store.dispatch(actions.fetchExperiments());
    let storeState = store.getState().experiments;
    expect(storeState.isExperimentsLoading).toEqual(true);

    const response = await promise;
    storeState = store.getState().experiments;
    expect(storeState.experimentsList).toEqual(response.experiments);
  });

  it('creates GET_DATASETS when fetching datasets', async () => {
    fetchMock.getOnce('/api/v1/datasets', {
      body: { datasets: datasets.datasets },
      headers: { 'content-type': 'application/json' },
    });

    const promise = store.dispatch(actions.fetchDatasets());
    let storeState = store.getState().datasets;
    expect(storeState.isDatasetLoading).toEqual(true);

    const response = await promise;
    storeState = store.getState().datasets;
    expect(storeState.dataSetsList).toEqual(response.datasets);
    expect(storeState.isDatasetLoading).toEqual(false);
  });

  it('Should handle selectPipeline when there is a previously selected pipeline', () => {
    store.dispatch(actions.selectPipeline('cyclegan'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('cyclegan');

    store.dispatch(actions.selectPipeline('lstm'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('lstm');
  });
});
