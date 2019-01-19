import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import server from '../services/rest-server';
import {App} from '../main';

class Header {

    public dbList = ko.observableArray([]);
    public signalList = ko.observableArray([]);
    public selected = {
        db: ko.observable({name: '', index: 0, html: ''}),
        signal: ko.observable({name: '', index: 0, html: ''})
    };
    public activatedSignalList = ko.observable(new Set());


    public initKnockoutVariables(eleId: string) {
        let self = this;
        ko.applyBindings(self, $(eleId)[0]);
        server.dbs.read().done(dbs => {
            self.dbList(dbs);
        });
    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;
        pip.header.on('signal:updateActivation', (dbSignals: string[]) => {
            // dbSignal: dbName_signalName;
            self.activatedSignalList(new Set(dbSignals));
        });
    }

    constructor(eleId: string) {
        this.initKnockoutVariables(eleId);
    }

    // the following methods are triggered by user interactions

    public onSelectDB(name: string, index: number) {
        let self = this;
        let oldName = self.selected.db().name;
        if (oldName !== name) {
            let html = `<a href="#" class="text">${name}</a>`;
            self.selected.db({name, index, html});
            server.dbs.signals.read(name).done(signals => {
                self.signalList(signals);
            });
        }
    }

    public onSelectSignal(name: string, index: number) {
        let self = this;
        let oldName = self.selected.signal().name;
        if (oldName !== name) {
            let html = `<a href="#" class="text">${name}</a>`;
            self.selected.signal({name, index, html});
            // send updated signal to content view
            pip.content.trigger('signal:select', {
                db: self.selected.db().name,
                signal: self.selected.signal().name
            });
        }
    }

    public onLoadAllSignals() {
        let self = this;
        if (self.selected.db().name !== '') {
            pip.content.trigger('signal:loadAll', {
                db: self.selected.db().name,
                signalList: self.signalList()
            });
        }
    }
}

export default Header;
