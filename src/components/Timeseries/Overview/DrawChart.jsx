import React, { useEffect, Component } from 'react';
import PropTypes from 'prop-types';
import { drawChart, updateBrushPeriod } from './chartUtils';

class DrawChart extends Component {
  componentDidMount() {
    const { dataRun, onPeriodTimeChange, selectedPeriod } = this.props;
    const width = document.querySelector('.overview-wrapper').offsetWidth - 65;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange, selectedPeriod, this.props.dataRun.id);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const [nextPeriodStart, nextPeriodEnd] = nextProps.selectedPeriod;
    const [currentPeriodStart, currentPeriodEnd] = this.props.selectedPeriod;

    if (nextPeriodStart !== currentPeriodStart || nextPeriodEnd !== currentPeriodEnd) {
      updateBrushPeriod(nextProps.selectedPeriod);
     }
  }

  render() {
    return <div className={`_${this.props.dataRun.id}`} />; // @TODO - find a better way to target this element
  }
}

// const DrawChart = ({ dataRun, onPeriodTimeChange, selectedPeriod }) => {
//   useEffect(() => {
//     const width = document.querySelector('.overview-wrapper').offsetWidth - 65;
//     const height = 36;
//     drawChart(width, height, dataRun, onPeriodTimeChange);
//   }, [dataRun, onPeriodTimeChange, selectedPeriod]);

//   return (
//     <div className={`_${dataRun.id}`} /> // @TODO - find a better way to target this element
//   );
// };

DrawChart.propTypes = {
  dataRun: PropTypes.object,
  onPeriodTimeChange: PropTypes.func,
  selectedPeriod: PropTypes.array,
};

export default DrawChart;
