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
  beforeAll(() => {
    chartUtils.getWrapperSize = jest.fn().mockReturnValue({ width: 300, height: 300 });
    utils.formatDate = jest.fn().mockReturnValue({
      startDate: {
        day: 'mon',
      },
    });
  });

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
  };

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

  // should handle zoom
  // test zoom presence
  // toogle zoom
  // update zoom on click
});
