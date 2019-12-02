import pipelinesReducer from './pipelines';
import { pipelines } from '../../testmocks/pipelines';

describe('Testing pipelines reducers', () => {
    it('Should handle GET_PIPELINES_REQUEST', () => {
        expect(pipelinesReducer(undefined, { type: 'GET_PIPELINES_REQUEST' }))
        .toEqual({
            isPipelinesLoading: true,
            pipelineList: [],
            pipelineName: null,
        });
    });

    it('Should handle GET_PIPELINES_SUCCESS', () => {
        const successAction = {
            type: 'GET_PIPELINES_SUCCESS',
            pipelines,
        };
        expect(pipelinesReducer(undefined, successAction))
        .toEqual({
            isPipelinesLoading: false,
            pipelineList: pipelines,
            pipelineName: null,
        });
    });

    it('Should handle GET_PIPELINES_ERROR', () => {
        const errAction = {
            type: 'GET_PIPELINES_ERROR',
            isPipelinesLoading: false,
            pipelineList: pipelines,
        };

        expect(pipelinesReducer(undefined, errAction))
        .toEqual({
            isPipelinesLoading: false,
            pipelineList: [],
            pipelineName: null,
        });
    });

    it('Should handle SELECT_PIPELINE', () => {
        const action = {
            type: 'SELECT_PIPELINE',
            isPipelinesLoading: true,
            pipelineList: [],
            pipelineName: 'cyclegan',
        };

        expect(pipelinesReducer(undefined, action))
        .toEqual({
            pipelineName: 'cyclegan',
            isPipelinesLoading: true,
            pipelineList: [],
        });
    });
});
