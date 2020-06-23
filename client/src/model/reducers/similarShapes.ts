import createReducer from '../store/createReducer';

const initialState = {
  isShapesModalOpen: false,
};

function TOGGLE_SIMILAR_SHAPES_MODAL(nextState, { isShapesModalOpen }) {
  nextState.isShapesModalOpen = isShapesModalOpen;
}

export default createReducer(initialState, {
  TOGGLE_SIMILAR_SHAPES_MODAL,
});
