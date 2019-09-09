import server from '../services/rest-server';
import {headerConfig} from '../services/globals';
import * as _ from 'lodash';
import * as pip from '../services/pip-client';
import * as RSI from '../services/rest-server.interface';
import * as ko from 'knockout';

class Header {

    constructor(eleId: string) {
        let self = this;
        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

    }

    // handle events coming from other components
    public setupEventHandlers() {
        // no events currently
    }

}

export default Header;
