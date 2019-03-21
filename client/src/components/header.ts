import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import server from '../services/rest-server';
import { Dataset, Datarun } from '../services/rest-server.interface';

class Header {

    public datasets = ko.observableArray([]);
    public dataruns = ko.observableArray([]);
    public selected = {
        dataset: ko.observable({name: '', index: 0, html: ''}),
        datarun: ko.observable({name: '', id: '', index: 0, html: ''})
    };
    public activeDatasets = ko.observable(new Set());
    public activeDataruns = ko.observable(new Set());


    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        server.datasets.read().done((datasets_: string[]) => {
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
            let html = `<a href="#" class="text">${dataset_.name}</a>`;
            self.selected.dataset({name: dataset_.name, index, html});

            server.datasets.dataruns.read(dataset_.name).done(
                (dataruns_: Datarun[]) => {
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
            let createdTime = datarun_.insert_time;
            createdTime = _.replace(createdTime, 'T', ' ');
            createdTime = createdTime.substring(0, 19);   // 2019-03-17 13:12:25
            let html = `<a href="#" class="text">${createdTime}</a>`;
            self.selected.datarun({
                name: createdTime,
                id: datarun_.id,
                index,
                html
            });

            pip.content.trigger('datarun:select', {
                dataset: self.selected.dataset().name,
                datarun: self.selected.datarun()
            });

            pip.sidebar.trigger('datarun', datarun_);

            server.pipelines.read(datarun_.pipeline).done(pipeline => {
                pip.sidebar.trigger('pipeline', pipeline);
            });
        }
    }

    public onLoadAllDataruns() {
        let self = this;
        if (self.selected.dataset().name !== '') {
            pip.content.trigger('datarun:loadAll', {
                dataset: self.selected.dataset().name,
                dataruns: self.dataruns()
            });
        }
    }
}

export default Header;
