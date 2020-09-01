import createReducer from '../store/createReducer';

const initialState = {
  activePanel: 'periodicalView',
  relativeScale: false,
  isSummaryVisible: true,
};

function SET_ACTIVE_PANEL(nextState, { activePanel }) {
  nextState.activePanel = activePanel;
}

function TOGGLE_RELATIVE_SCALE(nextState, { relativeScale }) {
  nextState.relativeScale = relativeScale;
}

function TOGGLE_EVENT_SUMMARY(nextState, { isSummaryVisible }) {
  nextState.isSummaryVisible = isSummaryVisible;
}

export default createReducer(initialState, {
  SET_ACTIVE_PANEL,
  TOGGLE_RELATIVE_SCALE,
  TOGGLE_EVENT_SUMMARY,
});
