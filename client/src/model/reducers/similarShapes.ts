import createReducer from '../store/createReducer';

const initialState = {
  isShapesModalOpen: false,
  isSimilarShapesLoading: true,
  similarShapes: [],
};

function TOGGLE_SIMILAR_SHAPES_MODAL(nextState, { isShapesModalOpen }) {
  nextState.isShapesModalOpen = isShapesModalOpen;
}

function FETCH_SIMILAR_SHAPES_REQUEST(nextState) {
  nextState.isSimilarShapesLoading = true;
}

function FETCH_SIMILAR_SHAPES_SUCCESS(nextState, action) {
  nextState.isSimilarShapesLoading = false;
  nextState.similarShapes = action.result.windows;
}

export default createReducer(initialState, {
  TOGGLE_SIMILAR_SHAPES_MODAL,
  FETCH_SIMILAR_SHAPES_SUCCESS,
  FETCH_SIMILAR_SHAPES_REQUEST,
});
