
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from './landing';
import fetchMock from 'fetch-mock'
import expect from 'expect';

// importing mocks
import * as pipelines from '../../testmocks/pipelines';
import * as experiments from '../../testmocks/experiments';
import * as datasets from '../../testmocks/datasets';

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {

  afterEach(() => {
    fetchMock.restore()
  })

  it('creates GET_EXPERIMENTS_SUCCESS when fetching experiments', () => {

    fetchMock.getOnce('/api/v1/experiments', {
      body: {experiments},
    });

    const expectedActions = [
      { type: 'GET_EXPERIMENTS_REQUEST' },
      { type: 'GET_EXPERIMENTS_SUCCESS', experiments}
    ];

    const store = mockStore({ experiments: [] })
    return store.dispatch(actions.fetchExperiments()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    });
  });

  it('creates GET_PIPELINES_SUCCESS when fetching pipelines', () => {
    fetchMock.getOnce('/api/v1/pipelines', {
      body: {pipelines}
    });

    const expectedActions = [
      { type: 'GET_PIPELINES_REQUEST' },
      { type: 'GET_PIPELINES_SUCCESS', pipelines}
    ];

    const store = mockStore({ pipelines: [] });
    return store.dispatch(actions.fetchPipelines()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })

  });

  it('creates GET_DATASET_SUCCESS when fetching datasets', () => {
    fetchMock.getOnce('/api/v1/datasets', {
      body: {dataSets: datasets.dataSets}
    });

    const expectedActions = [
      { type: 'GET_DATASET_REQUEST' },
      { type: 'GET_DATASET_SUCCESS', datasets: datasets.datasets}
    ];

    const store = mockStore({ dataSets: [] });
    return store.dispatch(actions.fetchDatasets()).then(() => {
      expect(store.getActions()).toEqual(expectedActions)
    })
  });
})