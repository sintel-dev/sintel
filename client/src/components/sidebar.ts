import {format} from 'd3';
import * as pip from '../services/pip-client';
import * as RSI from '../services/rest-server.interface';
import * as ko from 'knockout';
import * as _ from 'lodash';

class Sidebar {

    public avgEventNum = ko.observable(null);
    public exp = ko.observable<RSI.Experiment>(null);
    public stations = ko.observableArray([]);
    public blocks = ko.observableArray([]);

    private maxLength = 30;

    public setupEventHandlers() {
        let self = this;

        // from header
        pip.sidebar.on('experiment:change', (exp: RSI.Experiment) => {
            let _exp = _.cloneDeep(exp);
            _exp.start_time = exp.start_time.substring(0, 9);

            let blocks = [];
            self.avgEventNum(format('.2f')(exp.event_num / exp.model_num));
            for (let i = 0; i < _exp.pipeline.mlpipeline.primitives.length; i += 1) {
                let splits = _.split(_exp.pipeline.mlpipeline.primitives[i], '.');
                if (splits[splits.length - 2] !== 'data_dumper') {
                    blocks.push({
                        html: `<span>${_.last(splits)}</span>`,
                        name: _.last(splits),
                        fullName: _exp.pipeline.mlpipeline.primitives[i],
                        params: []
                    });
                }
            }

            _.each(_exp.pipeline.mlpipeline.init_params, (v, k) => {
                let idx = 1;
                let tagIdx = k.indexOf('#');
                let name = k;
                if (tagIdx >= 0) {
                    idx = +k.substring(tagIdx + 1);
                    name = k.substring(0, tagIdx);
                }

                let currentIdx = 0;
                for (let i = 0; i < blocks.length; i += 1) {
                    let splits = _.split(name, '.');
                    if (_.last(splits) === blocks[i].name) {
                        currentIdx += 1;
                    }
                    if (currentIdx === idx) {
                        blocks[i].params = _.toPairs(v);
                        break;
                    }
                }

                let _k = k.replace('#1', '');
                let blockName = _.last(_.split(_k, '.'));
            });

            _.each(blocks, bl => {
                if (bl.params.length > 0) {
                    bl.html += `<span class="pull-right-container">
                                    <i class="fa fa-angle-left pull-right"></i>
                                </span>`;
                }
            });

            self.blocks(blocks);
            self.exp(_exp);
        });

    }

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(this, $(eleId)[0]);

        let menu = $('.sidebar-menu') as any;
        menu.tree({accordion: false});

        // open the sidebar tree menu
        $('#sm1').click();
        $('#sm2').click();
    }

}

export default Sidebar;



// function RMSE(ts1, ts2) {
//     let squareSum = 0;
//     for (let i = 0; i < ts1.length; i++) {
//         squareSum += (ts1[i][1] - ts2[i][1]) * (ts1[i][1] - ts2[i][1]);
//     }
//     return Math.sqrt(squareSum / ts1.length);
// }

// function MAPE(tsG, tsP) {
//     let s = 0, c = 0;
//     for (let i = 0; i < tsG.length; i++) {
//         if (tsG[i][1] === 0) { continue; }
//         c += 1;
//         s += Math.abs((tsP[i][1] - tsG[i][1]) / tsG[i][1]);
//     }
//     return s / c;
// }
