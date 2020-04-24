import experimentsReducer from './experiments';
import { experiments } from '../../tests/testmocks/experiments';

describe('Testing experiments reducer', () => {
  it('Should handle FETCH_EXPERIMENTS_REQUEST', () => {
    expect(
      experimentsReducer(undefined, {
        type: 'FETCH_EXPERIMENTS_REQUEST',
      }),
    ).toEqual({
      selectedExperimentID: null,
      isExperimentsLoading: true,
      experimentsList: [],
    });
  });

  it('Should handle FETCH_EXPERIMENTS_SUCCESS', () => {
    const successAction = {
      type: 'FETCH_EXPERIMENTS_SUCCESS',
      result: { experiments },
    };

    expect(experimentsReducer(undefined, successAction)).toEqual({
      selectedExperimentID: null,
      isExperimentsLoading: false,
      experimentsList: experiments,
    });
  });

  it('Should handle FETCH_EXPERIMENTS_FAILURE', () => {
    const errAction = {
      type: 'FETCH_EXPERIMENTS_FAILURE',
      isExperimentsLoading: false,
      result: [],
    };
    expect(experimentsReducer(undefined, errAction)).toEqual({
      selectedExperimentID: null,
      isExperimentsLoading: false,
      experimentsList: [],
    });
  });
});
