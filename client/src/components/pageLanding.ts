import * as pip from '../services/pip';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as DT from '../services/server.itf';
import * as d3 from 'd3';
import { getProjects } from '../services/dataProcessor';
import { Matrix } from './vis/matrix';
import { fromIDtoTag, fromTagToID } from '../services/helpers';

export interface Experiment extends DT.Experiment {
  eventNum: number;
  tagStats?: { [index: string]: number };
}

export interface Pipeline extends DT.Pipeline {
  experimentNum: number;
}

export interface Project {
  name: string;
  signalNum?: number;
  experiments: Experiment[];
  experimentNum: number;
  uniquePipelineNum: number;
  pipelines: Pipeline[];
}

class PageLanding {

  public projects = ko.observableArray<Project>([]);
  public experiments = ko.observableArray<Experiment>([]);
  public pipelines = ko.observableArray<Pipeline>([]);

  // currently active
  public activeProject = ko.observable<Project>(null);

  private previousGoExperiment: Experiment = null;
  private matrixDict: { [index: string]: Matrix };

  private svg = d3.select('#page-landing .svg-link');


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
    pip.header.trigger('page:change', 'exp');
    pip.content.trigger('page:change', 'exp');

    if (this.previousGoExperiment == null
      || this.previousGoExperiment.id !== experiment.id) {
      this.previousGoExperiment = experiment;
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
          // highlight experiment card && dot
          $(`.exp-row .card`).removeClass('active');
          $(`.card[name=${cdata.id}]`).addClass('active');
          $(`.exp-row .dot`).removeClass('active');
          $(`.dot[name=${cdata.id}]`).addClass('active');
          // highlight pipeline card && dot
          let pipe = _.find(self.pipelines(), d => d.name === cdata.pipeline);
          $(`.pipe-row .card`).removeClass('active');
          $(`.card[name=${pipe.id}]`).addClass('active');
          $(`.pipe-row .dot`).removeClass('active');
          $(`.dot[name=${pipe.id}]`).addClass('active');
          // highlight links
          $('.card-link').removeClass('active');
          $(`.card-link[name=${cdata.id}]`).addClass('active');
        }
        break;
      case 'pipe':
        {
          let cdata = data as DT.Pipeline;
          // highlight pipeline card && dot
          $(`.pipe-row .card`).removeClass('active');
          $(`.card[name=${cdata.id}]`).addClass('active');
          $(`.pipe-row .dot`).removeClass('active');
          $(`.dot[name=${cdata.id}]`).addClass('active');
          // highlight experiment card && dot & link
          $(`.exp-row .card`).removeClass('active');
          $(`.exp-row .dot`).removeClass('active');
          $('.card-link').removeClass('active');
          _.each(self.experiments(), exp => {
            if (exp.pipeline === cdata.name) {
              $(`.card[name=${exp.id}]`).addClass('active');
              $(`.dot[name=${exp.id}]`).addClass('active');
              $(`.card-link[name=${exp.id}]`).addClass('active');
            }
          });
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
          let currentOffset = $('.proj-cards').scrollLeft();
          $('.proj-cards').animate({ scrollLeft: currentOffset + offsetLeft }, animationTime);
        }
        break;
      case 'exp':
        {
          let cdata = data as Experiment;
          // highlight experiment card && dot
          $(`.exp-row .card`).removeClass('active');
          $(`.card[name=${cdata.id}]`).addClass('active');
          $(`.exp-row .dot`).removeClass('active');
          $(`.dot[name=${cdata.id}]`).addClass('active');
          // highlight pipeline card && dot
          let pipe = _.find(self.pipelines(), d => d.name === cdata.pipeline);
          $(`.pipe-row .card`).removeClass('active');
          $(`.card[name=${pipe.id}]`).addClass('active');
          $(`.pipe-row .dot`).removeClass('active');
          $(`.dot[name=${pipe.id}]`).addClass('active');
          // highlight links
          $('.card-link').removeClass('active');
          $(`.card-link[name=${cdata.id}]`).addClass('active');

          let offsetLeft = $(`.card[name=${cdata.id}]`).position().left;
          let currentOffset = $('.exp-cards').scrollLeft();
          $('.exp-cards').animate({ scrollLeft: currentOffset + offsetLeft }, animationTime);
        }
        break;
      case 'pipe':
        {
          let cdata = data as DT.Pipeline;
          // highlight pipeline card && dot
          $(`.pipe-row .card`).removeClass('active');
          $(`.card[name=${cdata.id}]`).addClass('active');
          $(`.pipe-row .dot`).removeClass('active');
          $(`.dot[name=${cdata.id}]`).addClass('active');
          // highlight experiment card && dot & link
          $(`.exp-row .card`).removeClass('active');
          $(`.exp-row .dot`).removeClass('active');
          $('.card-link').removeClass('active');
          _.each(self.experiments(), exp => {
            if (exp.pipeline === cdata.name) {
              console.log('activated');
              $(`.card[name=${exp.id}]`).addClass('active');
              $(`.dot[name=${exp.id}]`).addClass('active');
              $(`.card-link[name=${exp.id}]`).addClass('active');
            }
          });
          let offsetLeft = $(`.card[name=${cdata.id}]`).position().left;
          let currentOffset = $('.pipe-cards').scrollLeft();
          $('.pipe-cards').animate({ scrollLeft: currentOffset + offsetLeft }, animationTime);
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

  private initDotLinks() {
    let self = this;
    let exps = self.experiments();
    let pipes = self.pipelines();
    let items = $('#page-slider .page');
    let done = false;

    d3.selectAll('.card-link').remove();

    items.get(1).addEventListener(
      'transitionend',
      () => { done = true; update(); },
      { once: true }
    );

    setTimeout(() => {
      if (!done) { update(); }
    }, 1500);

    function update(delay = 500) {
      setTimeout(addLinks, 500);
    }

    function addLinks() {
      // for (let i = 0; i < exps.length; i++) {
      //   for (let j = 0; j < pipes.length; j++) {
      //     let dotExp = $(`.exp-row .dot[name=${exps[i].id}]`);
      //     let dotPipe = $(`.pipe-row .dot[name=${pipes[j].id}]`);
      //     if (dotExp.length === 0 || dotPipe.length === 0) {
      //       update();
      //       return;
      //     }
      //   }
      // }

      // at first, remove all the links
      d3.selectAll('.card-link').remove();

      // add links
      _.each(exps, exp => {
        _.each(pipes, pipe => {
          if (exp.pipeline !== pipe.name) { return; }
          let dotExpOffset = $(`.exp-row .dot[name=${exp.id}]`).offset();
          let dotPipeOffset = $(`.pipe-row .dot[name=${pipe.id}]`).offset();
          let hh = $('header').height();
          let dh = $(`.exp-row .dot[name=${exp.id}]`).height() / 2;
          let curve = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis);
          let [x0, y0, x1, y1] = [
            dotExpOffset.left + dh, dotExpOffset.top - hh + dh,
            dotPipeOffset.left + dh, dotPipeOffset.top - hh + dh
          ];
          let [xm0, ym0, xm1, ym1] = [x0, (y0 + y1) / 2, x1, (y0 + y1) / 2];
          let points = [[x0, y0], [xm0, ym0], [xm1, ym1], [x1, y1]] as [number, number][];
          self.svg.append('path')
            .attr('class', 'card-link')
            .attr('name', exp.id)
            .attr('d', curve(points));
        });
      });
    }

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

    pip.pageLanding.on('update:experiments', () => {
      getProjects().then(projects => {
        self.projects(projects);
        let selectedProject = _.find(projects, d => d.name === self.activeProject().name);
        let pipelines = selectedProject.pipelines;
        _.each(pipelines, pipe => {
          let count = 0;
          for (let i = 0; i < selectedProject.experiments.length; i++) {
            if (selectedProject.experiments[i].pipeline === pipe.name) { count++; }
          }
          pipe.experimentNum = count;
        });
        self.pipelines(pipelines);

        let activeExperimentID = $(`.exp-row .card.active`).attr('name');
        self.activeProject(selectedProject);
        $(`.exp-row .card`).removeClass('active');
        $(`.exp-row .dot`).removeClass('active');
        $(`.pipe-row .card`).removeClass('active');
        $(`.pipe-row .dot`).removeClass('active');
        self.experiments(selectedProject.experiments);
        // self.initDotLinks();
        self.visualize();
        let selectedExperiment = _.find(selectedProject.experiments, d => d.id === activeExperimentID);
        self.onSelectCard('exp', selectedExperiment);
      });
    });
  }

  /**
   * Update KO observable variables when selecting a project
   */
  private selectProject(project: Project) {
    let ap = this.activeProject();
    if (ap && ap.name === project.name) {
      return;
    } // do nothing if select the name project
    this.activeProject(project);
    $(`.exp-row .card`).removeClass('active');
    $(`.exp-row .dot`).removeClass('active');
    $(`.pipe-row .card`).removeClass('active');
    $(`.pipe-row .dot`).removeClass('active');
    this.experiments(project.experiments);

    let pipelines = project.pipelines;
    _.each(pipelines, pipe => {
      let count = 0;
      for (let i = 0; i < project.experiments.length; i++) {
        if (project.experiments[i].pipeline === pipe.name) { count++; }
      }
      pipe.experimentNum = count;
    });

    this.pipelines(_.cloneDeep(pipelines));

    // this.initDotLinks();
    this.visualize();
  }

  private visualize() {
    let self = this;

    let experiments = self.experiments();
    let maxTagNum = Number.MIN_SAFE_INTEGER;
    let maxEventNum = Number.MIN_SAFE_INTEGER;
    let maxScore = Number.MIN_SAFE_INTEGER;

    _.each(experiments, exp => {
      let tagStats: { [index: string]: number } = {};
      for (let i = 0; i < 7; i += 1) { tagStats[String(i)] = 0; }
      _.each(exp.dataruns, datarun => {
        for (let i = 0; i < datarun.events.length; i += 1) {
          let tid = fromTagToID(datarun.events[i].tag);
          tid = tid === 'untagged' ? '0' : tid;
          if (!_.has(tagStats, tid)) { tagStats[tid] = 0; }
          tagStats[tid] += 1;
          maxTagNum = maxTagNum < tagStats[tid] ? tagStats[tid] : maxTagNum;

          maxScore = maxScore > datarun.events[i].score ? maxScore : datarun.events[i].score;
          maxEventNum = maxEventNum < datarun.events.length ? datarun.events.length : maxEventNum;
        }
      });
      exp.tagStats = tagStats;
    });


    _.each(experiments, exp => {
      $(`.exp-row .matrix-container[name=${exp.id}]`).empty();
      // self.matrixDict[exp.id] =
      new Matrix(
        $(`.exp-row .matrix-container[name=${exp.id}]`)[0],
        exp,
        { maxTagNum, maxEventNum, maxScore: Math.ceil(maxScore * 1.05) }
      );
    });

  }
}

export default PageLanding;
