import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drawChart } from './chartUtils';

class DrawChart extends Component {
  componentDidMount() {
    const { dataRun, onPeriodTimeChange, selectedPeriod } = this.props;
    const width = document.querySelector('.overview-wrapper').offsetWidth - 65;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange, selectedPeriod);
  }

  render() {
    return <div className={`_${this.props.dataRun.id}`} />; // @TODO - find a better way to target this element
  }
}

DrawChart.propTypes = {
  dataRun: PropTypes.object,
  onPeriodTimeChange: PropTypes.func,
  selectedPeriod: PropTypes.array,
};

export default DrawChart;
