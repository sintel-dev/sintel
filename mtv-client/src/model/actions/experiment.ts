import { api } from './utils';
import { getSelectedExperiment } from '../selectors/projects';
import { GET_EXPERIMENTDATA, FetchExperimentAction, ExperimentDataType } from '../types/experiment';

export const fetchExperiment = function() {
  return function(dispatch, getState) {
    const experimentID = getSelectedExperiment(getState());
    const promise: Promise<ExperimentDataType> = api.get(`/dataruns/?experiment_id=${experimentID}`);
    const action: FetchExperimentAction = {
      type: GET_EXPERIMENTDATA,
      promise,
    };
    dispatch(action);
  };
};
