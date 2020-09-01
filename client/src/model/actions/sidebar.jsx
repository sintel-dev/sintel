import { getIsRelativeScaleEnabled, getIsSummaryViewActive } from '../selectors/sidebar';

export function setActivePanelAction(activePanel) {
  return (dispatch) => dispatch({ type: 'SET_ACTIVE_PANEL', activePanel });
}

export function toggleRelativeScaleAction() {
  return function (dispatch, getState) {
    const isRelativeScaleEnabled = getIsRelativeScaleEnabled(getState());
    dispatch({ type: 'TOGGLE_RELATIVE_SCALE', relativeScale: !isRelativeScaleEnabled });
  };
}

export function toggleEventSummaryAction() {
  return function (dispatch, getState) {
    const summaryViewState = getIsSummaryViewActive(getState());
    dispatch({ type: 'TOGGLE_EVENT_SUMMARY', isSummaryVisible: !summaryViewState });
  };
}
