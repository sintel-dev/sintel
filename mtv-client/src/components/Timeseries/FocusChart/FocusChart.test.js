import React from 'react';
import { FocusChart } from './FocusChart';
import { dataRun } from '../../../tests/testmocks/dataRun';
import { renderWithStore } from '../../../tests/utils';

jest.mock('./ShowErrors', () => () => 'Show Errors component');
jest.mock('./EventDetails', () => () => 'Event Details Component');
jest.mock('./ZoomControls', () => () => 'Zoom Controls Component');
jest.mock('./FocusChartEvents/AddEvent', () => () => 'Add Event Component');

describe('Testing FocusChart component ->', () => {
  const focusChartProps = {
    dataRun,
    isPredictionVisible: false,
    isTooltipVisible: false,
    periodRange: {
      zoomValue: 1,
      eventRange: (2)[(0, 0)],
    },
    reviewRange: null,
    zoomCounter: 0,
    zoomDirection: '',
    isEditingRange: false,
    width: 300,
    height: 100,
  };
  const mountedFocusChart = renderWithStore({}, <FocusChart {...focusChartProps} />);

  it('Should render FocusChart without crashing', () => {
    expect(mountedFocusChart).toMatchSnapshot();
  });

  // should render tooltip
  // should handle zoom
  // test zoom presence
  // toogle zoom
  // update zoom on click
  //
});
