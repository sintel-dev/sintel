import { createSelector } from 'reselect';
import { getIsExperimentsLoading, getExperimentsData, getSelectedExperiment } from './projects';

export const getExperimentDataRun = (state) => state.experimentData.dataruns;

export const getSelectedExperimentData = createSelector(
    [getIsExperimentsLoading, getExperimentsData, getSelectedExperiment, getExperimentDataRun],
    (isExperimentsLoading, experiments, selectedExperimentID, dataRun) => {
        // if (isExperimentsLoading) { return null; }
        const { experimentsList } = experiments;
        const experimentData = experimentsList.filter(experiment => experiment.id === selectedExperimentID);
        return experimentData;
    },
);

// export const getExperimentDatarun = (state) => state.experimentData;


// export const getExperimentDataRun = (state) => state.experimentData.dataruns;
