import {createSelector} from 'reselect';
import {isExperimentsLoading, getExperiments} from './experiments';
import {isDatasetLoading, dataSets} from './datasets';
import {isPipelinesLoading, getPipelines} from './pipelines';

const groupExperimentsByProj = (stack, criteria) => {
    const grouppedProjects = [];
    const grouppedStack =  stack.reduce((result, currentValue) => {
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
                switch(expGroup) {
                    case 'SMAP': return 55;
                    case 'MSL': return 27
                    default: // For SES
                        return 71
                }
            }()),
        });
    });
    
    return grouppedProjects;
}

const addPipelines = (projectStack, pipelines) => {
    return projectStack.map(project => Object.assign(project, pipelines));
}


// export const projectsList = (state) => state.experimentsData; 
// export const projectsList = () => {
//     console.log(experimentsData);
// }

export const projectsList = createSelector(

    [isExperimentsLoading, getExperiments, isDatasetLoading, dataSets, isPipelinesLoading, getPipelines],
    (isExperimentsLoading, experiments, isDatasetLoading, dataSets, isPipelinesLoading, pipelines) => {
        if(isExperimentsLoading || isPipelinesLoading) {return };
        
        const pipeDict = []; 
        pipelines.pipelines.map(pipeline => pipeDict[pipeline.name] = pipeline);
        const grouppedExpByProject = groupExperimentsByProj(experiments.experiments, 'project');
        const projects = addPipelines(grouppedExpByProject, pipelines);
        
        return projects;
    }
)