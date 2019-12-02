import datasetsReducer from './datasets';
import { dataSets } from '../../testmocks/datasets';

describe('Testing dataset reducer', () => {
    it('should handle GET_DATASET_REQUEST', () => {
        expect(datasetsReducer(undefined, {
            type: 'GET_DATASETS_REQUEST',
        })).toEqual({
            isDatasetLoading: true,
            dataSetsList: [],
        });
    });

    it('Should handle GET_DATASETS_SUCCESS', () => {
        const successAction = {
            type: 'GET_DATASETS_SUCCESS',
            dataSets,
        };
        expect(datasetsReducer(undefined, successAction))
        .toEqual({
            isDatasetLoading: false,
            dataSetsList: dataSets,
        });
    });

    it('Should handle GET_DATASET_ERROR', () => {
        const errAction = {
            type: 'GET_DATASETS_ERROR',
            dataSets,
        };

        expect(datasetsReducer(undefined, errAction))
        .toEqual({
            isDatasetLoading: false,
            dataSetsList: [],
        });
    });
});
