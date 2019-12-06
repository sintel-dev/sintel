import experimentsReducer from './experiments';
import { experiments } from '../../tests/testmocks/experiments';


describe('Testing experiments reducer', () => {
    it('Should handle GET_EXPERIMENTS_REQUEST', () => {
        expect(experimentsReducer(undefined, {
            type: 'GET_EXPERIMENTS_REQUEST',
        }))
        .toEqual({
            experimentID: null,
            isExperimentsLoading: true,
            experimentsList: [],
        });
    });

    it('Should handle GET_EXPERIMENTS_SUCCESS', () => {
        const successAction = {
            type: 'GET_EXPERIMENTS_SUCCESS',
            result: { experiments },
        };

        expect(experimentsReducer(undefined, successAction))
        .toEqual({
            experimentID: null,
            isExperimentsLoading: false,
            experimentsList: experiments,
        });
    });

    it('Should handle GET_EXPERIMENTS_FAILURE', () => {
        const errAction = {
            type: 'GET_EXPERIMENTS_FAILURE',
            isExperimentsLoading: false,
            result: [],
        };
        expect(experimentsReducer(undefined, errAction))
        .toEqual({
            experimentID: null,
            isExperimentsLoading: false,
            experimentsList: [],
        });
    });
});
