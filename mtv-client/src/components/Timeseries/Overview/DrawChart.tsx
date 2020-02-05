import React, { Component } from 'react';
import { drawChart, updateBrushPeriod } from './chartUtils';
import { Props as DatarunProps } from './Datarun';

let props: DatarunProps;
type Props = {
  dataRun: typeof props.datarun;
  onPeriodTimeChange: typeof props.onChangePeriod;
  selectedPeriod: typeof props.selectedPeriodRange;
  selectedDatarunID: typeof props.selectedDatarunID;
};

class DrawChart extends Component<Props> {
  componentDidMount() {
    const { dataRun, onPeriodTimeChange } = this.props;
    const width = document.querySelector('.time-row').clientWidth;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange);
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

export default DrawChart;
