import * as pip from '../services/pipClient';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as DT from '../services/server.itf';
import dataProcessor from '../services/dataProcessor';
import { headerConfig } from '../services/globals';
import server from '../services/server';

interface Experiment extends DT.Experiment {
  eventNum: number;
}

type Project = {
  name: string;
  experiments: Experiment[];
  experimentNum: number;
  uniquePipelineNum: number;
  pipelines: DT.Pipeline[];
};

type ProjectList = Project[];

type ProjectDict = {
  [index: string]: DT.Experiment[]
};

type PipelineDict = {
  [index: string]: DT.Pipeline;
};

class PageLanding {

  public projects = ko.observableArray<Project>([]);
  public experiments = ko.observableArray<Experiment>([]);
  public pipelines = ko.observableArray<DT.Pipeline>([]);

  public empDetails = ko.observable(null);

  private actives = {
    project: null as Project,
    experiment: null as Experiment,
    pipeline: null as DT.Pipeline
  };
  private once = false;

  public searchActive(name, value) {
    let self = this;
    switch (name) {
      case 'project':
        return self.actives.project.name === (value as Project).name;
        break;
      case 'experiment':
        return self.actives.experiment.id === (value as Experiment).id;
        break;
      case 'pipeline':
        return self.actives.pipeline.name === (value as DT.Pipeline).id;
        break;
    }
  }

  /**
   * Create landing page instance
   *
   * @param eleId HTMLElement ID used for binding Knockout
   */
  constructor(eleId: string) {
    let self = this;

    // initialize Knockout Variables
    ko.applyBindings(self, $(eleId)[0]);

    self.getProjectList();
    // todo
    // $('.exp-cards').on('click', function(evt) {
    //     console.log('click');
    //     self.goExp();
    // });

    // server.experiments.read<any>({}, {})
    //   .done(data => {
    //     let a: ProjectDict = {};
    //     console.log(data);
    //     _.each(data.experiments, exp => {
    //       let test = 1;
    //     });
    //     a['sdf'] = 10;
    //   })
    //   .fail(data => {
    //     console.error(data.responseText);
    //   });
    // server.experiments.read().done( (data: RSI.Experiment[]) => {
    //     self.expList = data;

    //     let projects = _.chain(data).map(d => d.project).uniq().value();
    //     self.projects(projects);
    //     self.onSelectProject(projects[0], 0);

    //     let experiments = _.filter(data, d => d.project === projects[0]);
    //     self.experiments(experiments);
    //     self.selected.experiment({index: -1, name: ''});    // select nothing
    //     // self.onSelectExperiment(experiments[0], 0);
    // });

    // horizontal scroll
    // $('.proj-cards').on('mousewheel', function(evt: any) {
    //     // console.log(evt.originalEvent.deltaY);
    //     this.scrollLeft += (evt.originalEvent.deltaY);
    //     evt.preventDefault();
    // });
  }

  // handle events coming from other components
  public setupEventHandlers() {
    let self = this;

    // todo
  }

  public goExp() {
    let self = this;
    pip.content.trigger('page:change', 'exp');
    pip.header.trigger('page:change:exp');
    // if (!self.once) {
    self.onSelectExperiment(self.experiments()[0], 0);
    self.once = true;
    // }
  }

  /**
   * Knockout: click event handler.
   *
   * Invoked after clicking the project card
   */
  public onSelectProject() {
    // to be filled
  }

  public filterExp() {
    // pass
  }

  // the following public methods are triggered by user interactions on header
  // public onSelectProject(proj: string, index: number) {
  //   let self = this;
  //   this.selected.project({ index, name: proj });
  //   headerConfig.project = proj;

  //   let experiments = _.filter(self.expList, d => d.project === proj);
  //   self.experiments(experiments);
  //   self.selected.experiment({ index: -1, name: '' });    // select nothing
  // }

  public onSelectExperiment(exp: DT.Experiment, index: number) {
    // this.selected.experiment({ index, name: exp.name });
    // headerConfig.experiment = exp;
    // pip.content.trigger('experiment:change', exp);
  }

  private async getProjectList() {
    let self = this;
    let exps = await server.experiments.read<{experiments: DT.Experiment[]}>();
    let pipes = await server.pipelines.read<{pipelines: DT.Pipeline[]}>();

    // get pipeline dict
    let pipeDict: PipelineDict = {};
    _.each(pipes.pipelines, pipe => {
      pipeDict[pipe.name] = pipe;
    });

    // get project dict and list
    let projDict: ProjectDict = {};
    let projList: ProjectList = [];
    _.each(exps.experiments, exp => {
      if (!_.has(projDict, exp.project)) { projDict[exp.project] = []; }
      projDict[exp.project].push(exp);
    });

    _.forIn(projDict, (value, key) => {

      // get pipeline of this project
      let pipelineNameSet = new Set();
      let pipelines: DT.Pipeline[] = [];
      for (let i = 0; i < value.length; i += 1) {
        if (!pipelineNameSet.has(value[i].pipeline)) {
          pipelineNameSet.add(value[i].pipeline);
          pipelines.push(pipeDict[value[i].pipeline]);
        }
      }

      // get event number of each experiment in this project
      let newExp = _.map(value, v => {
       (v as Experiment).eventNum = self.getExperimentEventNum(v);
       return v;
      });

      projList.push({
        name: key,
        experimentNum: value.length,
        uniquePipelineNum: pipelineNameSet.size,
        experiments: newExp as Experiment[],
        pipelines
      });
    });

    self.projects(projList);
    self.actives.project = projList[0];

  }

  private getExperimentEventNum(exp: DT.Experiment) {
    let sum = 0;
    _.each(exp.dataruns, datarun => {
      sum += datarun.events.length;
    });
    return sum;
  }

}

export default PageLanding;
