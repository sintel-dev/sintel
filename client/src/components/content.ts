import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import * as _ from 'lodash';
import PageExp from './page-exp';
import PageLanding from './page-landing';

import server from '../services/rest-server';

class Content {

    private pageExp: PageExp;
    private pageLanding: PageLanding;

    private slider = $('#page-slider');
    private items = this.slider.find('.page');
    private currentItem = this.items.last();


    constructor() {
        let self = this;

        // By default, show the landing page

        self.slider.addClass('ready');
        self.changePage('landing');

        self.items.get(0).addEventListener('transitionend',
            () => {
                self.slider.addClass('loaded');
            }, {
                once: true
            }
        );

        // initialize page content

        self.initPageLanding();
        self.initPageExp();

    }

    public setupEventHandlers() {
        let self = this;

        pip.content.on('page:change', pageName => {
            self.changePage(pageName);
            // update corresponding page
        });
    }

    private initPageLanding() {
        let self = this;
        self.pageLanding = new PageLanding('#page-landing');
        self.pageLanding.setupEventHandlers();
    }

    private initPageExp() {
        let self = this;
        self.pageExp = new PageExp('#page-exp');
        self.pageExp.setupEventHandlers();
    }

    /**
     * Event handler for changing page
     * @param {String} pageName The target page name
     */
    private changePage(pageName) {
        let self = this;
        self.slider.removeClass(['prev', 'next']);
        if (pageName !== 'landing') {
            self.slider.addClass('next');
        } else {
            self.slider.addClass('prev');
        }

        // reset classes
        self.items.removeClass(['prev', 'active']);

        // set prev

        const prevItem = self.currentItem;

        // set active
        const activeItem = self.items.filter(function (index) {
            let item = $(this);
            return item.hasClass(`page-${pageName}`);
        });

        self.currentItem = activeItem;

        prevItem.addClass('prev');
        activeItem.addClass('active');
    }
}

export default Content;
