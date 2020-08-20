import createReducer from '../store/createReducer';

const initialState = {
  activePanel: 'periodicalView',
};

function SET_ACTIVE_PANEL(nextState, { activePanel }) {
  nextState.activePanel = activePanel;
}

export default createReducer(initialState, {
  SET_ACTIVE_PANEL,
});
