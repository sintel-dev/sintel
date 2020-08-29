import { getCurrentEventDetails } from '../selectors/datarun';
import { FETCH_EVENT_HISTORY } from '../types';
import API from '../utils/api';

export function getCurrentEventHistoryAction() {
  return function (dispatch, getState) {
    const currentEvent = getCurrentEventDetails(getState());
    if (!currentEvent) {
      return null;
    }

    const eventID = currentEvent.id;
    const tagHistory = {
      type: FETCH_EVENT_HISTORY,
      promise: API.eventInteraction.all({}, { event_id: eventID, action: 'TAG' }),
    };

    return dispatch(tagHistory);
  };
}
