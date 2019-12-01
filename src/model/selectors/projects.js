import { createSelector } from 'reselect';

export const getExperimentsData = (state) => state.experiments;
export const getPipelinesData = (state) => state.pipelines;
export const getDatasets = (state) => state.datasets;


const isProjectsLoading = createSelector(
    [getExperimentsData, getPipelinesData, getDatasets],
    (experimentsData, pipelinesData, datasets) =>
        experimentsData.ieExperimentsLoading || datasets.isDatasetLoading || pipelinesData.isPipelinesLoading);


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

const addPipelines = (projectStack, pipelines) => projectStack.map(project => ({ ...project, pipelines }));

const getProjectsList = createSelector(
    [isProjectsLoading, getExperimentsData, getDatasets, getPipelinesData],
    (isLoadingProjects, experimentsData, dataSets, pipelinesData) => {
        if (isLoadingProjects) { return []; }
        let projectData = {};
        const grouppedExpByProject = groupExperimentsByProj(experimentsData.experimentsList, 'project');
        const projects = addPipelines(grouppedExpByProject, pipelinesData.pipelineList);

         projectData = {
            isProjectsLoading: isLoadingProjects,
            projects,
        };

        return projectData;
    },
);

export const getProjectsData = createSelector(
    [isProjectsLoading, getProjectsList],
    (isLoadingProjects, projectsList) => {
        let projectData = {
            isProjectsLoading: isLoadingProjects,
            projectsList,
        };
        return projectData;
    },
);
