import React from 'react';
import renderer from 'react-test-renderer';
import { FocusChart } from './FocusChart';
import { dataRun } from '../../../tests/testmocks/dataRun';

import * as chartUtils from './FocusChartUtils';
import * as utils from '../../../model/utils/Utils';

jest.mock('./ShowErrors', () => () => 'Show Errors component');
jest.mock('./EventDetails', () => () => 'Event Details Component');
jest.mock('./ZoomControls', () => () => 'Zoom Controls Component');
jest.mock('./FocusChartEvents/AddEvent', () => () => 'Add Event Component');

describe('Testing FocusChart component -> ', () => {
  const focusChartProps = {
    dataRun,
    isPredictionVisible: false,
    periodRange: {
      zoomValue: 1,
      eventRange: (2)[(0, 0)],
    },
    reviewRange: null,
    zoomCounter: 0,
    zoomDirection: '',
    isEditingRange: false,
    isZoomEnabled: true,
    setPeriodRange: jest.fn().mockReturnValue({ eventRange: [200, 300], zoomValue: 2.33 }),
  };

  beforeAll(() => {
    chartUtils.getWrapperSize = jest.fn().mockReturnValue({ width: 300, height: 300 });
    utils.formatDate = jest.fn().mockReturnValue({
      startDate: {
        day: 'mon',
      },
    });
  });

  it('Set focus chart dimensions in state', () => {
    const mountedFocusChart = shallow(<FocusChart {...focusChartProps} />);
    expect(mountedFocusChart.instance().state.width).toBe(300);
    expect(mountedFocusChart.instance().state.height).toBe(300);
  });

  it('Should Render without crashing', () => {
    const mountedFocusChart = renderer.create(<FocusChart {...focusChartProps} />).toJSON();

    expect(mountedFocusChart).toMatchSnapshot();
  });

  it('Should render fousChart predictions', () => {
    const mountedFocusChart = renderer.create(<FocusChart {...focusChartProps} isPredictionVisible />);
    expect(mountedFocusChart).toMatchSnapshot();
  });

  it('Should render event tooltip', () => {
    const mountedFocusChart = shallow(<FocusChart {...focusChartProps} />);
    mountedFocusChart.setState({
      isTooltipVisible: false,
    });

    mountedFocusChart.find('#_5da802e1abc5668935743a07').simulate('mousemove', (event) => {
      mountedFocusChart.setState({
        eventData: {
          xCoord: 200,
          yCoord: 300,
          startDate: event.clientX,
          stopDate: event.clientX,
        },
      });
    });

    expect(mountedFocusChart.instance().state.isTooltipVisible).toBe(true);
  });

  it('Should handle updateZoomOnClick method', () => {
    const spy = jest.spyOn(FocusChart.prototype, 'updateZoomOnClick');
    const mountedFocusChart = mount(<FocusChart {...focusChartProps} zoomCounter={0} />);
    mountedFocusChart.setProps({ zoomCounter: 1, zoomDirection: 'In' });
    mountedFocusChart.update();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Should handle toggleZoom method', () => {
    const spy = jest.spyOn(FocusChart.prototype, 'toggleZoom');
    const mountedFocusChart = mount(<FocusChart {...focusChartProps} />);
    mountedFocusChart.setProps({ isEditingRange: true });
    mountedFocusChart.update();
    expect(spy).toHaveBeenCalledTimes(1);

    mountedFocusChart.setProps({ isEditingRange: false });
    mountedFocusChart.update();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('Should handle updateChartZoomOnSelectPeriod method', () => {
    const spy = jest.spyOn(FocusChart.prototype, 'updateChartZoomOnSelectPeriod');
    const mountedFocusChart = mount(<FocusChart {...focusChartProps} />);
    mountedFocusChart.setProps({ selectedPeriod: { year: 2009, month: '' } });
    mountedFocusChart.update();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
