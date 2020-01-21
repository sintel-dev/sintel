import { api } from './utils';
import { getSelectedExperiment } from '../selectors/projects';

export const fetchExperiment = function() {
  return function(dispatch, getState) {
    const experimentID = getSelectedExperiment(getState());
    const promise = api.get(`/dataruns/?experiment_id=${experimentID}`);
    dispatch({ type: 'GET_EXPERIMENTDATA', promise });
  };
};
