import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { Dataset, Datarun, Pipeline } from '../services/rest-server.interface';

class Sidebar {

    public dataset = ko.observable({});
    public datarun = ko.observable({});
    public pipeline = ko.observable({
        mlpipeline: {
            primitives: []
        }
    });

    private maxLength = 30;

    public setupEventHandlers() {
        let self = this;

        pip.sidebar.on('dataset', (dataset_: Dataset) => {
            let datasetCopy = _.cloneDeep(dataset_);

            let dt = new Date(+datasetCopy.start_time * 1000);
            datasetCopy.start_time = `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()} ` as any;
            // `${dt.getUTCHours()}:${dt.getUTCMinutes()}:${dt.getUTCSeconds()}` as any;

            dt = new Date(+datasetCopy.stop_time * 1000);
            datasetCopy.stop_time = `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}` as any;
            // `${dt.getUTCHours()}:${dt.getUTCMinutes()}:${dt.getUTCSeconds()}` as any;

            self.dataset(datasetCopy);
        });

        pip.sidebar.on('datarun', (datarun_: Datarun) => {
            // datarun_.insert_time = datarun_.insert_time.substring(0, 19);
            datarun_.start_time = datarun_.insert_time.substring(0, 10);
            // datarun_.end_time = datarun_.insert_time.substring(0, 19);
            self.datarun(datarun_);
        });

        pip.sidebar.on('pipeline', (pipeline_: Pipeline) => {
            pipeline_.insert_time = pipeline_.insert_time.substring(0, 19);
            (pipeline_.mlpipeline as any).primitivesAbbr = [];
            _.each(pipeline_.mlpipeline.primitives, (p, i) => {
                const sp = p.split('.');
                const name = _.last(sp);
                (pipeline_.mlpipeline as any).primitivesAbbr.push(name);
            });
            // pipeline_.mlpipeline.primitives = JSON.stringify(pipeline_.mlpipeline.primitives);
            pipeline_.mlpipeline.init_params = JSON.stringify(pipeline_.mlpipeline.init_params);
            pipeline_.mlpipeline.output_names = JSON.stringify(pipeline_.mlpipeline.output_names);
            self.pipeline(pipeline_ as any);
        });
    }

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(this, $(eleId)[0]);

        let menu = $('.sidebar-menu') as any;
        menu.tree({
            accordion: false
        });
    }
}

export default Sidebar;
