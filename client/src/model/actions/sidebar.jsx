export function setActivePanelAction(activePanel) {
  return (dispatch) => dispatch({ type: 'SET_ACTIVE_PANEL', activePanel });
}
