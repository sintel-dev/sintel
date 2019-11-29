import { createSelector } from 'reselect';
import { isExperimentsLoading, getExperiments } from './experiments';
import { isDatasetLoading, getDatasets } from './datasets';
import { isPipelinesLoading, getPipelines } from './pipelines';

export const isProjectsLoading = createSelector(
    [isExperimentsLoading, isDatasetLoading, isPipelinesLoading],
    (isExperimentsLoading, isDatasetLoading, isPipelinesLoading) => isExperimentsLoading || isDatasetLoading || isPipelinesLoading);

const groupExperimentsByProj = (stack, criteria) => {
    const grouppedProjects = [];
    const grouppedStack = stack.reduce((result, currentValue) => {
        (result[currentValue[criteria]] = result[currentValue[criteria]] || []).push(currentValue);
        return result;
    }, []);

    Object.keys(grouppedStack).forEach(expGroup => {
        grouppedProjects.push({
            experimentNum: grouppedStack[expGroup].length,
            experiments: grouppedStack[expGroup],
            name: expGroup,
            // uniquePipelineNum: countPipelines(expGroup),
            signalNum: (function() {
                switch (expGroup) {
                    case 'SMAP': return 55;
                    case 'MSL': return 27;
                    default: // For SES
                        return 71;
                }
            }()),
        });
    });

    return grouppedProjects;
};

const addPipelines = (projectStack, pipelines) => projectStack.map(project => Object.assign(project, pipelines));

export const getProjectsList = createSelector(

    [isProjectsLoading, getExperiments, getDatasets, getPipelines],
    (isProjectsLoading, experiments, dataSets, pipelines) => {
        if (isProjectsLoading) { return []; }

        const pipeDict = [];
        pipelines.pipelines.map(pipeline => pipeDict[pipeline.name] = pipeline);
        const grouppedExpByProject = groupExperimentsByProj(experiments.experiments, 'project');
        const projects = addPipelines(grouppedExpByProject, pipelines);

        return projects;
    }
);
