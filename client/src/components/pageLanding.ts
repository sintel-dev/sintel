import * as pip from '../services/pipClient';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as RSI from '../services/server.interface';
import dataProcessor from '../services/dataProcessor';
import { headerConfig } from '../services/globals';

import server from '../services/server';

interface ProjectDict {
  [index: string]: number;
}


class PageLanding {

  public projects = ko.observableArray<string>([]);
  public experiments = ko.observableArray<RSI.Experiment>([]);
  public selected = {
    project: ko.observable<{ index: number, name: string }>(null),
    experiment: ko.observable<{ index: number, name: string }>(null)
  };
  public empDetails = ko.observable(null);

  private expList;
  private once = false;

  private projectList;

  /**
   * Create landing page instance
   * 
   * @param eleId HTMLElement ID used for binding Knockout
   */
  constructor(eleId: string) {
    let self = this;

    // initialize Knockout Variables
    ko.applyBindings(self, $(eleId)[0]);

    // todo
    // $('.exp-cards').on('click', function(evt) {
    //     console.log('click');
    //     self.goExp();
    // });

    server.experiments.read<any>({}, {})
      .done(data => {
        let a: ProjectDict = {};
        console.log(data);
        _.each(data.experiments, exp => {

        });
        a['sdf'] = 10;
      })
      .fail(data => {
        console.error(data.responseText);
      });
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

  public filterExp() {
    // pass
  }

  // the following public methods are triggered by user interactions on header
  public onSelectProject(proj: string, index: number) {
    let self = this;
    this.selected.project({ index, name: proj });
    headerConfig.project = proj;

    let experiments = _.filter(self.expList, d => d.project === proj);
    self.experiments(experiments);
    self.selected.experiment({ index: -1, name: '' });    // select nothing
  }

  public onSelectExperiment(exp: RSI.Experiment, index: number) {
    this.selected.experiment({ index, name: exp.name });
    headerConfig.experiment = exp;
    pip.content.trigger('experiment:change', exp);
  }

  private async test() {
    let ok = await server.comments.read<ProjectDict>({}, {
      event_id: 1
    });
    ok[1] = 2;
    let b: ProjectDict = {}
  }

}

export default PageLanding;
