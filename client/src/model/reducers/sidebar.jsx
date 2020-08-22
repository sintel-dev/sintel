import createReducer from '../store/createReducer';

const initialState = {
  activePanel: 'periodicalView',
  relativeScale: false,
};

function SET_ACTIVE_PANEL(nextState, { activePanel }) {
  nextState.activePanel = activePanel;
}

function TOGGLE_RELATIVE_SCALE(nextState, { relativeScale }) {
  nextState.relativeScale = relativeScale;
}

export default createReducer(initialState, {
  SET_ACTIVE_PANEL,
  TOGGLE_RELATIVE_SCALE,
});
