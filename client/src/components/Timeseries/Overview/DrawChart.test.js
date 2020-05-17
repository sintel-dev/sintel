import React from 'react';
import { DrawChart } from './DrawChart';
import { dataRun } from '../../../tests/testmocks/dataRun';

describe('Testing Draw Chart component -> ', () => {
  const drawhartProps = {
    dataRun,
    selectedPeriod: {
      eventRange: [343.07148437499995, 348.74648437499997],
    },
  };

  it('Should render without crasing', () => {
    const mountedDrawChart = shallow(<DrawChart {...drawhartProps} />, { disableLifecycleMethods: true });

    mountedDrawChart.setState({
      width: 200,
      height: 20,
      drawableWidth: 180,
      drawableHeight: 15,
    });
    expect(mountedDrawChart).toMatchSnapshot();
  });
});
