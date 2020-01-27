import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drawChart, updateBrushPeriod } from './chartUtils';

class DrawChart extends Component {
  componentDidMount() {
    const { dataRun, onPeriodTimeChange, selectedPeriod } = this.props;
    const width = document.querySelector('.overview-wrapper').offsetWidth - 65;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange, selectedPeriod);
  }

  componentDidUpdate(prevProps) {
    const { selectedPeriod } = this.props;

    // @TODO - investigate how this can be set in immerJS as a compound object
    if (JSON.stringify(prevProps.selectedPeriod) !== JSON.stringify(selectedPeriod)) {
      updateBrushPeriod(selectedPeriod);
    }
  }

  render() {
    return <div className={`_${this.props.dataRun.id}`} />; // @TODO - find a better way to target this element
  }
}

DrawChart.propTypes = {
  dataRun: PropTypes.object,
  onPeriodTimeChange: PropTypes.func,
  selectedPeriod: PropTypes.object,
};

export default DrawChart;
