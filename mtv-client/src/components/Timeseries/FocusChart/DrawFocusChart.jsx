import React, { Component } from 'react';
import { drawChart } from './FocusChartUtils';

class DrawFocusChart extends Component {
    componentDidMount() {
        drawChart(400, 500);
    }

    render() {
      return <div id="focusChart" />;
    }
}

export default DrawFocusChart;
