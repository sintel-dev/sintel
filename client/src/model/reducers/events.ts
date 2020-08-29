import createReducer from '../store/createReducer';

const initialState = {
  eventHistory: null,
  isEventHistoryLoading: true,
};

function FETCH_EVENT_HISTORY_REQUEST(nextState) {
  nextState.isEventHistoryLoading = true;
}

function FETCH_EVENT_HISTORY_SUCCESS(nextState, action) {
  nextState.eventHistory = action.result.records;
  nextState.isEventHistoryLoading = false;
}

function FETCH_EVENT_HISTORY_FAILURE(nextState) {
  nextState.eventHistory = null;
  nextState.isEventHistoryLoading = false;
}

export default createReducer(initialState, {
  FETCH_EVENT_HISTORY_REQUEST,
  FETCH_EVENT_HISTORY_SUCCESS,
  FETCH_EVENT_HISTORY_FAILURE,
});
