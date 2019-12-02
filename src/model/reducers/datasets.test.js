import * as datasets from './datasets';
import * as datasetMock from '../../testmocks/datasets';
import { fetchDatasets } from '../actions/landing';

describe('Testing dataset reducer', () => {
    it('should handle GET_DATASET_REQUEST', () => {
        expect(
            datasets.default({
            isDatasetLoading: undefined,
        }, {
            type: 'GET_DATASETS_REQUEST',
            isDatasetLoading: true,
        })).toEqual({
            isDatasetLoading: true,
        });
    });

    it('Should handle GET_DATASET_SUCCESS', () => {
        const initialState = {
            isDatasetLoading: false,
            dataSetsList: {},
        };

        expect(
            datasets.default(initialState, {
                type: 'GET_DATASETS_SUCCESS',
                dataSetsList: datasetMock,
                isDatasetLoading: false,

            })).toEqual({
                dataSetsList: datasetMock,
                isDatasetLoading: false,
            });
        // expect(
        //     datasets.default([{
        //         isDatasetLoading: false,
        //     }],
        //     {
        //       type: 'GET_DATASET_SUCCESS',
        //       isDatasetLoading: false,
        //     }),
        //   ).toEqual([
        //     {
        //         isDatasetLoading: false,
        //     },
        //   ]);
    });

    it('Should handle GET_DATASET_ERROR', () => {

    });
});
