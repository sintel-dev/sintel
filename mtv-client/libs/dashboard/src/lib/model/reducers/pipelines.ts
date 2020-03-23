import createReducer from '../store/createReducer';
import { PipelinesState, FetchPipelinesAction, SelectPipelineAction } from '../types';

const initialState: PipelinesState = {
  isPipelinesLoading: true,
  pipelineList: [],
  selectedPipelineName: null,
};

function FETCH_PIPELINES_REQUEST(nextState: PipelinesState) {
  nextState.isPipelinesLoading = true;
  nextState.pipelineList = [];
  nextState.selectedPipelineName = null;
}

function FETCH_PIPELINES_SUCCESS(nextState: PipelinesState, action: FetchPipelinesAction) {
  nextState.isPipelinesLoading = false;
  nextState.pipelineList = action.result.pipelines;
  nextState.selectedPipelineName = null;
}

function FETCH_PIPELINES_FAILURE(nextState: PipelinesState) {
  nextState.isPipelinesLoading = false;
  nextState.pipelineList = [];
  nextState.selectedPipelineName = null;
}

function SELECT_PIPELINE(nextState: PipelinesState, action: SelectPipelineAction) {
  nextState.selectedPipelineName = action.selectedPipelineName;
}

export default createReducer<PipelinesState>(initialState, {
  FETCH_PIPELINES_REQUEST,
  FETCH_PIPELINES_SUCCESS,
  FETCH_PIPELINES_FAILURE,
  SELECT_PIPELINE,
});
