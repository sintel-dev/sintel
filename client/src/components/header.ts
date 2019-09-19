import * as _ from 'lodash';
import * as pip from '../services/pip-client';
import * as ko from 'knockout';

class Header {

    private pagebackBtn =  $('#header .pageback-btn');

    /**
     * Create an instance of header
     * @param {string} [eleId] HTMLElement ID used for binding Knockout
     */
    constructor(eleId: string) {
        let self = this;
        ko.applyBindings(self, $(eleId)[0]);
    }

    /**
     * Set up events handlers coming from other components
     */
    public setupEventHandlers() {
        let self = this;

        pip.header.on('page:change:exp', () => {
            self.pagebackBtn
                .removeClass(['left', 'right'])
                .addClass('left')
                .fadeIn(300);
        });
    }

    /**
     * Knockout: click event handler.
     *
     * Invoked after clicking the backward button
     */
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
