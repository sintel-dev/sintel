import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import 'select2';
import * as RSI from '../services/rest-server.interface';
import dataProcessor from '../services/data-processor';
import {headerConfig} from '../services/globals';

import server from '../services/rest-server';

class PageLanding {

    public projects = ko.observableArray<string>([]);
    public experiments = ko.observableArray<RSI.Experiment>([]);
    public selected = {
        project: ko.observable<{index: number, name: string}>(null),
        experiment: ko.observable<{index: number, name: string}>(null)
    };
    public empDetails =  ko.observable(null);

    private expList;

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        // todo
        $('.exp-cards').on('click', function(evt) {
            console.log('click');
            self.goExp();
        });

        server.experiments.read<RSI.Response>().done( (data: RSI.Experiment[]) => {
            self.expList = data;

            let projects = _.chain(data).map(d => d.project).uniq().value();
            self.projects(projects);
            self.onSelectProject(projects[0], 0);

            let experiments = _.filter(data, d => d.project === projects[0]);
            self.experiments(experiments);
            self.selected.experiment({index: -1, name: ''});    // select nothing
            // self.onSelectExperiment(experiments[0], 0);
        });
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        // todo
    }

    public goExp() {
        let self = this;
        pip.content.trigger('page:change', 'exp');
        self.onSelectExperiment(self.experiments()[0], 0);
    }

    // the following public methods are triggered by user interactions on header
    public onSelectProject(proj: string, index: number) {
        let self = this;
        this.selected.project({index, name: proj});
        headerConfig.project = proj;

        let experiments = _.filter(self.expList, d => d.project === proj);
        self.experiments(experiments);
        self.selected.experiment({index: -1, name: ''});    // select nothing
    }

    public onSelectExperiment(exp: RSI.Experiment, index: number) {
        console.log(exp);
        this.selected.experiment({index, name: exp.name});
        headerConfig.experiment = exp;
        pip.content.trigger('experiment:change', exp);
    }

}

export default PageLanding;
