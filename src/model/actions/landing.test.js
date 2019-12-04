
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
// import moxios from 'moxios';
import * as actions from './landing';
import { api } from '../store/middlewares';

// importing mocks
import * as pipelines from '../../testmocks/pipelines';
import * as experiments from '../../testmocks/experiments';
import * as datasets from '../../testmocks/datasets';

const middlewares = [thunk, api];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
  afterEach(() => {
    // fetchMock.reset();
    fetchMock.restore();
  });

  // it('creates GET_EXPERIMENTS_SUCCESS when fetching experiments', () => {
  //   fetchMock.getOnce('/api/v1/experiments', {
  //     body: { experiments },
  //   });

  //   const expectedActions = [
  //     { type: 'GET_EXPERIMENTS_REQUEST' },
  //     { type: 'GET_EXPERIMENTS_SUCCESS', experiments },
  //   ];

  //   const store = mockStore({ experiments: {} });
  //   store.dispatch(actions.fetchExperiments()).then(() => {
  //     expect(store.getActions()).toEqual(expectedActions);
  //   });
  // });

  // it('creates GET_PIPELINES_SUCCESS when fetching pipelines', () => {
  //   fetchMock.getOnce('/api/v1/pipelines', {
  //     body: { pipelines },
  //   });

  //   const expectedActions = [
  //     { type: 'GET_PIPELINES', pipelines },
  //   ];

  //   const store = mockStore({ pipelines: {} });
  //   store.dispatch(actions.fetchPipelines()).then(() => {
  //     expect(store.getActions()).toEqual(expectedActions);
  //   });
  // });

  it('creates GET_DATASETS when fetching datasets', () => {
    fetchMock.getOnce('/api/v1/datasets', {
      body: { datasets: datasets.datasets },
      headers: { 'content-type': 'application/json' },
    });


    const store = mockStore({ datasets: {} });
    store.dispatch(actions.fetchDatasets()).then((result) => {
      const expectedActions = [
        { type: 'GET_DATASETS_REQUEST' },
        { type: 'GET_DATASETS_SUCCESS', datasets },
      ];
      debugger;
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  // it('Should handle selectPipeline when there is a previously selected pipeline', () => {
  //   const expectedActions = [{
  //     type: 'SELECT_PIPELINE', selectedPipelineName: 'cyclegan',
  //   }];

  //   const store = mockStore({ pipelines: { selectedPipelineName: null } });
  //   store.dispatch(actions.selectPipeline('cyclegan'));
  //   expect(store.getActions()).toEqual(expectedActions);
  // });
});
