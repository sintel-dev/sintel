import experimentsReducer from './experiments';
import { experiments } from '../../testmocks/experiments';


describe('Testing experiments reducer', () => {
    it('Should handle GET_EXPERIMENTS_REQUEST', () => {
        expect(experimentsReducer(undefined, {
            type: 'GET_EXPERIMENTS_REQUEST',
        }))
        .toEqual({
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
            isExperimentsLoading: false,
            experimentsList: [],
        });
    });
});
