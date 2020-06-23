import { TOGGLE_SIMILAR_SHAPES_MODAL } from '../types';

export function toggleSimilarShapesModalAction(shapesModalState) {
  return function (dispatch) {
    return dispatch({
      type: TOGGLE_SIMILAR_SHAPES_MODAL,
      isShapesModalOpen: shapesModalState,
    });
  };
}
