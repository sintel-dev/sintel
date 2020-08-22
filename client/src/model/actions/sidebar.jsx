import { getIsRelativeScaleEnabled } from '../selectors/sidebar';

export function setActivePanelAction(activePanel) {
  return (dispatch) => dispatch({ type: 'SET_ACTIVE_PANEL', activePanel });
}

export function toggleRelativeScale() {
  return function (dispatch, getState) {
    const isRelativeScaleEnabled = getIsRelativeScaleEnabled(getState());
    dispatch({ type: 'TOGGLE_RELATIVE_SCALE', relativeScale: !isRelativeScaleEnabled });
  };
}
