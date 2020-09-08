import createReducer from '../store/createReducer';

const initialState = {
  isShapesModalOpen: false,
  isSimilarShapesLoading: false,
  similarShapes: [],
  activeShape: null,
  shapeMetrics: 'euclidean',
  shapesTag: null,
  currentPercentage: [0, 100],
};

function TOGGLE_SIMILAR_SHAPES_MODAL(nextState, { isShapesModalOpen }) {
  nextState.isShapesModalOpen = isShapesModalOpen;
}

function FETCH_SIMILAR_SHAPES_REQUEST(nextState) {
  nextState.isSimilarShapesLoading = true;
}

function FETCH_SIMILAR_SHAPES_SUCCESS(nextState, { similarShapes }) {
  nextState.isSimilarShapesLoading = false;
  nextState.similarShapes = similarShapes;
}

function FETCH_SIMILAR_SHAPES_FAILURE(nextState) {
  nextState.isSimilarShapesLoading = false;
  nextState.similarShapes = [];
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

function CHANGE_SHAPES_METRICS(nextState, { metrics }) {
  nextState.shapeMetrics = metrics;
}

function UPDATE_SHAPES_TAG(nextState, { tag }) {
  nextState.shapesTag = tag;
}

function UPDATE_CURRENT_PERCENTAGE(nextState, { percentageValue }) {
  nextState.currentPercentage[0] = percentageValue;
}

export default createReducer(initialState, {
  TOGGLE_SIMILAR_SHAPES_MODAL,
  FETCH_SIMILAR_SHAPES_SUCCESS,
  FETCH_SIMILAR_SHAPES_REQUEST,
  FETCH_SIMILAR_SHAPES_FAILURE,
  RESET_SIMILAR_SHAPES,
  UPDATE_SIMILAR_SHAPES,
  SET_ACTIVE_SHAPE,
  CHANGE_SHAPES_METRICS,
  UPDATE_SHAPES_TAG,
  UPDATE_CURRENT_PERCENTAGE,
});
