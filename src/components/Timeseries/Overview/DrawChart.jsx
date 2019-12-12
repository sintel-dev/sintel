import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { drawChart } from './chartUtils';

const DrawChart = ({ dataRun, onPeriodTimeChange }) => {
  useEffect(() => {
    const width = document.querySelector('.overview-wrapper').offsetWidth - 65;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange);
  }, [dataRun, onPeriodTimeChange]);

  return (
    <div className={`_${dataRun.id}`} /> // @TODO - find a better way to target this element
  );
};

DrawChart.propTypes = {
  dataRun: PropTypes.object,
  onPeriodTimeChange: PropTypes.func,
};

export default DrawChart;
