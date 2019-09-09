import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import 'select2';
import * as RSI from '../services/rest-server.interface';
import dataProcessor from '../services/data-processor';

import server from '../services/rest-server';

class PageLanding {

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

        // todo
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        // todo
    }

    public goExp() {
        pip.content.trigger('page:change', 'exp');
    }

}

export default PageLanding;
