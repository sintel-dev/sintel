import React, { Component } from 'react';
import { drawChart } from './FocusChartUtils';

class DrawFocusChart extends Component {
  componentDidMount() {
    const { width, height } = this.getBoxSizes();
    drawChart(width, height);
  }

  getBoxSizes() {
    const buffer = 40;
    const wrapperHeight = document.querySelector('#content-wrapper').clientHeight - buffer;
    const overViewHeight = document.querySelector('#overview-wrapper').clientHeight - buffer;
    const height = wrapperHeight - overViewHeight - buffer;
    const width = document.querySelector('#overview-wrapper').clientWidth - buffer / 2;

    return { width, height };
  }

  render() {
    return <div id="focusChart" />;
  }
}

export default DrawFocusChart;
