import {Events} from '../services/pip-client';
import * as ko from 'knockout';

class Dashboard extends Events {
    constructor(eleId: string) {
        super();
        ko.applyBindings(this, $(eleId)[0]);
    }
}

export default Dashboard;
