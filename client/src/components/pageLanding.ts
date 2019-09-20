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

interface Project {
  name: string;
  experiments: Experiment[];
  experimentNum: number;
  uniquePipelineNum: number;
  pipelines: DT.Pipeline[];
}

class PageLanding {

  public projects = ko.observableArray<Project>([]);
  public experiments = ko.observableArray<Experiment>([]);
  public pipelines = ko.observableArray<DT.Pipeline>([]);

  // currently active
  public activeProject = ko.observable<Project>(null);
  public activeExperiment = ko.observable<Experiment>(null);
  public activePipeline = ko.observable<DT.Pipeline>(null);

  private previousGoExperiment: Experiment = null;

  /**
   * Create landing page instance
   *
   * @param eleId HTMLElement ID used for binding KO
   */
  constructor(eleId: string) {
    ko.applyBindings(this, $(eleId)[0]);
    this.getCardDataReady();
    this.setupEventHandlers();
    this.setupOwnEventHandlers();
  }

  public onGoExperiment(experiment: Experiment) {
    // let self = this;
    pip.content.trigger('page:change', 'exp');
    pip.header.trigger('page:change:exp');
    // // if (!self.once) {
    // self.onSelectExperiment(self.experiments()[0], 0);
    // self.once = true;
    if (this.previousGoExperiment == null
        || this.previousGoExperiment.id !== experiment.id) {
          headerConfig.experiment = experiment;
          pip.header.trigger('page:change:exp');
          pip.content.trigger('page:change', 'exp');
          pip.pageExp.trigger('experiment:change', experiment);
        }
  }

  public onClickPipelineFilter(pipeline: DT.Pipeline) {
    console.log('onClickPipelineFilter', pipeline);
    // todo
  }

  /**
   * KO: click event handler.
   *
   * Invoked after clicking a card.
   */
  public onSelectCard(type, data) {
    let self = this;
    switch (type) {
      case 'proj':
        {
          let cdata = data as Project;
          self.selectProject(cdata);
          // self.activeProject(cdata);
        }
        break;
      case 'exp':
        {
          let cdata = data as Experiment;
          self.activeExperiment(cdata);
          // highlight pipeline
        }
        break;
      case 'pipe':
        {
          let cdata = data as DT.Pipeline;
          self.activePipeline(cdata);
          // highlight experiments
        }
        break;
    }
  }

  /**
   * KO: click event handler.
   *
   * Invoked after clicking a card dot.
   */
  public onSelectDot(type, data) {
    let self = this;
    let animationTime = 500;
    switch (type) {
      case 'proj':
        {
          let cdata = data as Project;
          self.selectProject(cdata);
          // self.activeProject(cdata);
          let offsetLeft = $(`.card[name=${cdata.name}]`).position().left;
          $('.proj-cards').animate({scrollLeft: offsetLeft}, animationTime);
        }
        break;
      case 'exp':
        {
          let cdata = data as Experiment;
          self.activeExperiment(cdata);
          let offsetLeft = $(`.card[name=${cdata.id}]`).position().left;
          $('.exp-cards').animate({scrollLeft: offsetLeft}, animationTime);
        }
        break;
      case 'pipe':
        {
          let cdata = data as DT.Pipeline;
          self.activePipeline(cdata);
          let offsetLeft = $(`.card[name=${cdata.id}]`).position().left;
          $('.proj-cards').animate({scrollLeft: offsetLeft}, animationTime);
        }
        break;
    }
  }

  /**
    * KO: completing rendering event.
    *
    * Invoked after rendering the pipeline cards
    */
  public pipeCardsRendered() {
    $('.pipe-cards .info p').on('mousewheel', function (evt: any) {
      this.scrollLeft += (evt.originalEvent.deltaY);
      evt.preventDefault();
    });
  }

  /**
   * Set up event listeners and handlers
   * for events from the component itself.
   */
  private setupOwnEventHandlers() {
    $('.proj-cards').on('mousewheel', function (evt: any) {
      this.scrollLeft += (evt.originalEvent.deltaY);
      evt.preventDefault();
    });

    $('.exp-cards').on('mousewheel', function (evt: any) {
      this.scrollLeft += (evt.originalEvent.deltaY);
      evt.preventDefault();
    });

    $('.pipe-cards').on('mousewheel', function (evt: any) {
      this.scrollLeft += (evt.originalEvent.deltaY);
      evt.preventDefault();
    });
  }

  /**
   * Set up event handlers to
   * handle events from other components
   */
  private setupEventHandlers() {
    let self = this;
    // if any
  }

  /**
   * Fill KO observable variables
   */
  private async getCardDataReady() {
    let self = this;
    let exps = await server.experiments.read<{ experiments: DT.Experiment[] }>();
    let pipes = await server.pipelines.read<{ pipelines: DT.Pipeline[] }>();

    // get pipeline dict
    let pipeDict: { [index: string]: DT.Pipeline } = {};
    _.each(pipes.pipelines, pipe => {
      pipeDict[pipe.name] = pipe;
    });

    // get project dict and list
    let projDict: { [index: string]: DT.Experiment[] } = {};
    let projList: Project[] = [];
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
        (v as Experiment).eventNum = getExperimentEventNum(v);
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

    // fill KO observable variables
    self.projects(projList);

    // select first project
    self.selectProject(projList[0]);

    function getExperimentEventNum(exp: DT.Experiment) {
      let sum = 0;
      _.each(exp.dataruns, datarun => {
        sum += datarun.events.length;
      });
      return sum;
    }
  }

  /**
   * Update KO observable variables when selecting a project
   */
  private selectProject(project: Project) {
    this.activeProject(project);
    this.experiments(project.experiments);
    this.pipelines(project.pipelines);
  }
}

export default PageLanding;
