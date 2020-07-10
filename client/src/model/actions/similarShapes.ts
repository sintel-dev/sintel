import { TOGGLE_SIMILAR_SHAPES_MODAL, FETCH_SIMILAR_SHAPES } from '../types';
import { getCurrentEventDetails } from '../selectors/datarun';
import API from '../utils/api';

export function toggleSimilarShapesModalAction(modalState) {
  return async function (dispatch) {
    dispatch({
      type: TOGGLE_SIMILAR_SHAPES_MODAL,
      isShapesModalOpen: modalState,
    });
  };
}

export function getSimilarShapesAction() {
  return function (dispatch, getState) {
    const eventDetails = getCurrentEventDetails(getState());
    let { datarun, start_time, stop_time } = eventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const action = {
      type: FETCH_SIMILAR_SHAPES,
      promise: API.similar_windows.all({}, { start: start_time, end: stop_time, datarun_id: datarun, number: 4 }),
    };

    dispatch(action);
  };
}
