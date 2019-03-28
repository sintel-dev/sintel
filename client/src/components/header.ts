import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import server from '../services/rest-server';
import { Dataset, Datarun } from '../services/rest-server.interface';

class Header {

    public datasets = ko.observableArray<Dataset>([]);
    public dataruns = ko.observableArray<Datarun>([]);
    public selected = {
        dataset: ko.observable({index: 0, name: ''}),
        datarun: ko.observable({index: 0, id: ''})
    };
    public activeDatasets = ko.observable(new Set());
    public activeDataruns = ko.observable(new Set());


    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        server.datasets.read().done((datasets_: Dataset[]) => {
            self.datasets(datasets_);
        });
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;
        pip.header.on('datarun:updateActives', (dataruns_: string[]) => {
            self.activeDataruns(new Set(dataruns_));
        });
    }

    // the following public methods are triggered by user interactions

    public onSelectDataset(dataset_: Dataset, index: number) {
        let self = this;
        const oldName = self.selected.dataset().name;
        if (oldName !== dataset_.name) {
            self.selected.dataset({index, name: dataset_.name});

            server.dataruns.read({}, {dataset: dataset_.name}).done(
                (dataruns_: Datarun[]) => {
                    // update dararuns' html
                    _.each(dataruns_, d => {
                        d.start_time = _.replace(d.start_time.substring(0, 19), 'T', ' ');
                        d.html = `
                            <span>▪ &nbsp; ${d.id} </span> <br>
                            <span>&nbsp; &nbsp; created on ${d.start_time}</span>
                        `;
                    });

                    self.dataruns(dataruns_);

                    // auto select the first one
                    self.onSelectDatarun(dataruns_[0], 0);
                }
            );

            // update dataset information on sidebar
            pip.sidebar.trigger('dataset', dataset_);
        }
    }

    public onSelectDatarun(datarun_: Datarun, index: number) {
        let self = this;
        let oid = self.selected.datarun().id;

        if (!self.activeDataruns().has(datarun_.id)) {
            self.selected.datarun({index, id: datarun_.id});

            pip.content.trigger('datarun:select', {
                dataset: self.selected.dataset().name,
                datarun: datarun_
            });

            pip.sidebar.trigger('datarun', datarun_);

            server.pipelines.read(datarun_.pipeline).done(pipeline => {
                pip.sidebar.trigger('pipeline', pipeline);
            });
        }
    }

    public onLoadAllDataruns() {
        let self = this;
        console.log('loadall');
        // if (self.selected.dataset().name !== '') {
        //     pip.content.trigger('datarun:loadAll', {
        //         dataset: self.selected.dataset().name,
        //         dataruns: self.dataruns()
        //     });
        // }
    }
}

export default Header;
