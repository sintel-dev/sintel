import fetchMock from 'fetch-mock';
import * as actions from './landing';
import { configureStore } from '../store';

// importing mocks
import * as pipelines from '../../tests/testmocks/pipelines';
import * as experiments from '../../tests/testmocks/experiments';
import * as datasets from '../../tests/testmocks/datasets';
import * as useractions from './users';

describe('async actions', () => {
  const store = configureStore();
  afterEach(() => {
    fetchMock.restore();
  });

  it('Authenticate the user', async () => {
    await store.dispatch(useractions.onUserLoginAction({ email: 'sergiu.ojoc@bytex.ro', password: 'S5T6RMAZ' }));
  });

  it('Creates FETCH_PIPELINES when fetching pipelines', async () => {
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

  it('Creates FETCH_EXPERIMENTS when fetching experiments', async () => {
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

  it('creates FETCH_DATASETS when fetching datasets', async () => {
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

  it('Should handle SELECT_PIPELINE', () => {
    store.dispatch(actions.selectPipeline('cyclegan'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('cyclegan');

    store.dispatch(actions.selectPipeline('lstm'));
    expect(store.getState().pipelines.selectedPipelineName).toEqual('lstm');
  });

  it('Should handle FETCH_PROJECTS', async () => {
    const promise = await store.dispatch(actions.fetchProjects());
    const storeState = store.getState().projects;
    expect(storeState.selectedProject).toEqual(promise[0].experiments[0].project);
  });

  it('Should handle SELECT_PROJECT', () => {
    store.dispatch(actions.selectProject('MSL'));
    expect(store.getState().projects.selectedProject).toEqual('MSL');

    store.dispatch(actions.selectProject('SMAP'));
    expect(store.getState().projects.selectedProject).toEqual('SMAP');
  });

  it('Deauthenticate the user', async () => {
    await store.dispatch(useractions.onUserLogoutAction());
  });
});
