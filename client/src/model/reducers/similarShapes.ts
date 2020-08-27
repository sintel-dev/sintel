import createReducer from '../store/createReducer';

const initialState = {
  isShapesModalOpen: false,
  isSimilarShapesLoading: false,
  similarShapes: [],
  activeShape: null,
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

function RESET_SIMILAR_SHAPES(nextState) {
  nextState.similarShapes = [];
}

function UPDATE_SIMILAR_SHAPES(nextState, { shapes }) {
  nextState.similarShapes = shapes;
}

function SET_ACTIVE_SHAPE(nextState, { activeShape }) {
  nextState.activeShape = activeShape;
}

export default createReducer(initialState, {
  TOGGLE_SIMILAR_SHAPES_MODAL,
  FETCH_SIMILAR_SHAPES_SUCCESS,
  FETCH_SIMILAR_SHAPES_REQUEST,
  RESET_SIMILAR_SHAPES,
  UPDATE_SIMILAR_SHAPES,
  SET_ACTIVE_SHAPE,
});
