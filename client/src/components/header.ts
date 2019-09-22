import * as _ from 'lodash';
import * as pip from '../services/pip';
import * as ko from 'knockout';

class Header {

  private pageSwitchBtn = $('#header .page-switch-btn');

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

    pip.header.on('page:change', (pageName: string) => {
      if (pageName === 'exp') {
        self.pageSwitchBtn
          .removeClass(['left', 'right'])
          .addClass('left')
          .fadeIn(300);
      }
    });
  }

  /**
   * Knockout: click event handler.
   *
   * Invoked after clicking the backward button
   */
  public pageSwitch() {
    let self = this;
    if (self.pageSwitchBtn.hasClass('left')) {
      self.pageSwitchBtn.removeClass('left').addClass('right');
      pip.content.trigger('page:change', 'landing');
    } else {
      self.pageSwitchBtn.removeClass('right').addClass('left');
      pip.content.trigger('page:change', 'exp');
    }

  }
}

export default Header;
