import React, { Component } from 'react';
import { drawChart, updateBrushPeriod, updateHighlithedEvents, brushTooltip } from './chartUtils';
import { Props as DatarunProps } from './Datarun';

let props: DatarunProps;
type Props = {
  dataRun: typeof props.datarun;
  onPeriodTimeChange: typeof props.onChangePeriod;
  selectedPeriod: typeof props.selectedPeriodRange;
  selectedDatarunID: typeof props.selectedDatarunID;
  onSelectDatarun: typeof props.onSelectDatarun;
};

class DrawChart extends Component<Props> {
  componentDidMount() {
    const { dataRun, onPeriodTimeChange, onSelectDatarun } = this.props;
    const width = document.querySelector('.time-row').clientWidth;
    const height = 36;
    drawChart(width, height, dataRun, onPeriodTimeChange, onSelectDatarun);
  }

  componentDidUpdate(prevProps) {
    const { selectedPeriod } = this.props;

    // @TODO - investigate how this can be set in immerJS as a compound object
    if (JSON.stringify(prevProps.selectedPeriod) !== JSON.stringify(selectedPeriod)) {
      updateBrushPeriod(selectedPeriod);
      brushTooltip(selectedPeriod, this.props.dataRun);
    }
    if (prevProps.dataRun.eventWindows !== this.props.dataRun.eventWindows) {
      updateHighlithedEvents(this.props.dataRun);
    }
  }

  render() {
    return <div className={`_${this.props.dataRun.id}`} />; // @TODO - find a better way to target this element
  }
}

export default DrawChart;
