import server from '../services/rest-server';
import {headerConfig} from '../services/globals';
import * as _ from 'lodash';
import * as pip from '../services/pip-client';
import * as RSI from '../services/rest-server.interface';
import * as ko from 'knockout';

class Header {

    private pagebackBtn =  $('#header .pageback-btn');

    constructor(eleId: string) {
        let self = this;
        // initialize Knockout Variables
        ko.applyBindings(self, $(eleId)[0]);

    }

    // handle events coming from other components
    public setupEventHandlers() {
        let self = this;

        pip.header.on('page:change:exp', () => {
            self.pagebackBtn
                .removeClass(['left', 'right'])
                .addClass('left')
                .fadeIn(300);
        });
    }

    public goBack() {
        let self = this;
        if (self.pagebackBtn.hasClass('left')) {
            self.pagebackBtn.removeClass('left').addClass('right');
            pip.content.trigger('page:change', 'landing');
        } else {
            self.pagebackBtn.removeClass('right').addClass('left');
            pip.content.trigger('page:change', 'exp');
        }

    }
}

export default Header;
