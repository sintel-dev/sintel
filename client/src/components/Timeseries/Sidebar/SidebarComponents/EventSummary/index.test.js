import React from 'react';
import EventSummary from './index';
import { grouppedEvents } from '../../../../tests/testmocks/grouppedEvents';

describe('Testing Event Summary component -> ', () => {
  const evtSummaryProps = {
    isSummaryVisible: true,
    selectedPeriodLevel: [],
    grouppedEvents,
  };

  it('Should render without crashing', () => {
    const evtSummaryComponent = shallow(<EventSummary {...evtSummaryProps} />);
    expect(evtSummaryComponent).toMatchSnapshot();
  });

  it('Should display propper button text', () => {
    const evtSummaryComponent = mount(<EventSummary {...evtSummaryProps} />);
    const btnTrigger = evtSummaryComponent.find('#toggleSummary');
    expect(btnTrigger.text()).toContain('HIDE');
    btnTrigger.simulate('click');

    expect(btnTrigger.text()).toContain('SHOW');
  });

  it('Should handle mouse over on column', () => {
    const spy = jest.spyOn(EventSummary.prototype, 'handleColHover');
    const evtSummaryComponent = mount(<EventSummary {...evtSummaryProps} />);
    const tableRow = evtSummaryComponent.find('.summary-details td').first();
    tableRow.simulate('mouseover');

    expect(spy).toBeCalledTimes(1);
  });
});
