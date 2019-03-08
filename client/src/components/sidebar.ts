import * as pip from '../services/pip-client';
import * as ko from 'knockout';

class Sidebar {

    public setupEventHandlers() {
        let self = this;
    }

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(this, $(eleId)[0]);
    }
}

export default Sidebar;
