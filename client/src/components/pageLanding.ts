import * as pip from '../services/pip';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as DT from '../services/server.itf';
import { headerConfig } from '../services/globals';
import { getProjects } from '../services/dataProcessor';

export interface Experiment extends DT.Experiment {
  eventNum: number;
}

export interface Project {
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
    let self = this;

    ko.applyBindings(this, $(eleId)[0]);
    self.setupEventHandlers();
    self.setupOwnEventHandlers();

    getProjects().then(projects => {
      self.projects(projects);
      self.selectProject(projects[0]);  // select project#0 by default
    });
  }

  /**
   * Invoked when clicking go detail button
   * in an experiment card
   *
   * @param experiment The experiment data
   */
  public onGoExperiment(experiment: Experiment) {
    if (this.previousGoExperiment == null
        || this.previousGoExperiment.id !== experiment.id) {
          headerConfig.experiment = experiment;
          pip.header.trigger('page:change', 'exp');
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
   * Update KO observable variables when selecting a project
   */
  private selectProject(project: Project) {
    this.activeProject(project);
    this.experiments(project.experiments);
    this.pipelines(project.pipelines);
  }
}

export default PageLanding;
