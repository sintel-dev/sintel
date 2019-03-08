import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import server from '../services/rest-server';

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

    public onSelectDataset(name: string, index: number) {
        let self = this;
        let oldName = self.selected.dataset().name;
        if (oldName !== name) {
            let html = `<a href="#" class="text">${name}</a>`;
            self.selected.dataset({name, index, html});

            server.datasets.dataruns.read(name).done(dataruns_ => {
                self.dataruns(dataruns_);
            });
        }
    }

    public onSelectDatarun(datarun_, index: number) {
        let self = this;
        let oid = self.selected.datarun().id;
        if (oid !== datarun_.id) {
            let html = `<a href="#" class="text">${datarun_.insert_time}</a>`;
            self.selected.datarun({
                name: datarun_.insert_time,
                id: datarun_.id,
                index,
                html
            });

            pip.content.trigger('datarun:select', {
                dataset: self.selected.dataset().name,
                datarun: self.selected.datarun().id
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
