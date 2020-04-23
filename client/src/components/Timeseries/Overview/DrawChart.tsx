import React, { Component } from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import { RootState, DatarunDataType } from '../../../model/types';
import { formatDate } from '../../../model/utils/Utils';
import { FocusChartConstants } from '../FocusChart/Constants';
import {
  getCurrentEventDetails,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getIsAddingNewEvents,
  getIsPopupOpen,
} from '../../../model/selectors/datarun';
import { setTimeseriesPeriod, selectDatarun } from '../../../model/actions/datarun';

const { TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

type Props = {
  dataRun: DatarunDataType;
};

type ChartState = {
  width: number;
  height: number;
  drawableWidth: number;
  drawableHeight: number;
  offset?: {
    left?: number;
    top?: number;
    infoWidth?: number;
  };
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type ChartProps = StateProps & DispatchProps & Props;

class DrawChart extends Component<ChartProps, ChartState> {
  private brush: any;

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      drawableWidth: 0,
      drawableHeight: 0,
      offset: {
        left: 10,
        top: 6,
        infoWidth: 60,
      },
    };
  }

  componentDidMount() {
    const width: number = document.querySelector('.time-row').clientWidth;
    const height = 40;
    const { offset } = this.state;

    const chartWidth = width - offset.infoWidth - 2 * offset.left;
    const drawableWidth = chartWidth - 3;
    const drawableHeight = height - 5;
    this.getRatio();

    this.setState(
      {
        width: chartWidth,
        height,
        drawableWidth,
        drawableHeight,
      },
      () => {
        this.initBrush();
      },
    );
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.selectedPeriod.eventRange) !== JSON.stringify(this.props.selectedPeriod.eventRange)) {
      this.updateBrushes();
    }
  }

  getScale(width = this.state.width, height = this.state.height) {
    const { maxTimeSeries } = this.props.dataRun;

    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    const timeSeriesMin = maxTimeSeries[0][0];
    const timeSeriesMax = maxTimeSeries[maxTimeSeries.length - 1][0];
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    minValue = Math.min(minValue, timeSeriesMin);
    maxValue = Math.max(maxValue, timeSeriesMax);

    xCoord.domain([minValue, maxValue]);
    yCoord.domain([-1, 1]);

    return { xCoord, yCoord };
  }

  drawLine(eventData) {
    const { drawableWidth, drawableHeight } = this.state;
    const { xCoord, yCoord } = this.getScale(drawableWidth, drawableHeight);

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(eventData);
  }

  initBrush() {
    const self = this;
    const { width } = this.state;
    const brushInstance = d3.selectAll('.overview-brush');

    const brush = d3.brushX().extent([
      [0, 0],
      [width, 42],
    ]);
    const { xCoord } = this.getScale();

    brushInstance
      .on('mousedown', function () {
        // @ts-ignore
        self.handleBrushClick(this.getAttribute('id'));
      })
      .on('dblclick', function () {
        d3.select(this).call(self.brush.move, xCoord.range());
      })
      .call(brush);

    brush.on('brush', () => {
      this.handleBrushSelection();
    });
    this.brush = brush;
  }

  handleBrushDbClick(brushID) {
    const { xCoord } = this.getScale();
    d3.select(`#_${brushID}`).call(this.brush.move, xCoord.range());
  }

  getRatio() {
    const { width } = this.state;
    const focusChartWidth =
      document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const ratio = width / focusChartWidth;
    return { ratio };
  }

  handleBrushSelection() {
    const { isEditingEvent, isAddingNewEvent } = this.props;
    const selection = d3.event.selection && d3.event.selection;
    if (selection === null || isEditingEvent || isAddingNewEvent) {
      return;
    }
    const { ratio } = this.getRatio();
    const focusChartWidth = document.querySelector('#focusChartWrapper').clientWidth;
    const focusWidth = focusChartWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const existingRange = this.props.selectedPeriod.eventRange;
    const eventRange = [selection[0] / ratio, selection[1] / ratio];

    // prevent infinite loop call
    if (JSON.stringify(existingRange) === JSON.stringify(eventRange)) {
      return;
    }

    const zoomValue = d3.zoomIdentity.scale(focusWidth / (eventRange[1] - eventRange[0])).translate(-eventRange[0], 0);

    const selectedRange = {
      eventRange,
      zoomValue,
    };

    this.renderTooltip();

    selection && this.props.onChangePeriod(selectedRange);
  }

  updateBrush() {
    const { isEditingEvent, isAddingNewEvent } = this.props;
    if (isEditingEvent || isAddingNewEvent) {
      return;
    }
    const { ratio } = this.getRatio();
    const activeBrush = d3.select('.time-row.active g.overview-brush');
    const { eventRange } = this.props.selectedPeriod;

    const brushRange = [eventRange[0] * ratio, eventRange[1] * ratio];
    activeBrush.call(this.brush.move, brushRange);
  }

  getBrushRange(eventRange) {
    const { ratio } = this.getRatio();
    const chartStart = eventRange[0] * ratio;
    const chartEnd = eventRange[1] * ratio;
    return { chartStart, chartEnd };
  }

  updateBrushes() {
    const brushSelection = d3.selectAll('g.overview-brush');
    const { chartStart, chartEnd } = this.getBrushRange(this.props.selectedPeriod.eventRange);
    brushSelection.call(this.brush.move, [chartStart, chartEnd]);
  }

  handleBrushClick(dataRunID) {
    const { isEditingEvent, isAddingNewEvent, isPopupOpen } = this.props;
    !isEditingEvent && !isAddingNewEvent && !isPopupOpen && this.props.onSelectDatarun(dataRunID);
  }

  drawEvent(event, timeSeries) {
    const eventData: Array<number> = timeSeries.slice(event[0], event[1] + 2);
    return <path key={event[3]} className="wave-event" d={this.drawLine(eventData)} />;
  }

  drawData() {
    const { width, height, offset } = this.state;
    const { dataRun } = this.props;
    const { eventWindows, timeSeries } = dataRun;

    return (
      width > 0 &&
      height > 0 && (
        <g className="event-wrapper" transform={`translate(${offset.left}, ${offset.top})`}>
          <path className="wave-data" d={this.drawLine(timeSeries)} />
          {eventWindows.length > 0 && eventWindows.map((windowEvent) => this.drawEvent(windowEvent, timeSeries))}
        </g>
      )
    );
  }

  initTooltip() {
    const { eventRange } = this.props.selectedPeriod;
    const isBrushCreated = eventRange[0] !== 0 || eventRange[1] !== 0;
    if (!isBrushCreated) {
      return;
    }

    const selection = d3.selectAll('.overview-brush .selection');

    selection
      .on('mouseover', () => this.renderTooltip())
      .on('mouseout', () => this.destroyTooltip())
      .on('mousemove', () => this.updateTooltipCoords())
      .on('mousedown', () => this.updateTooltipCoords());
  }

  updateTooltipCoords() {
    const { clientX, clientY } = d3.event;
    const tooltip = document.getElementById('brushTooltip');
    tooltip.setAttribute('style', `left: ${clientX + 10}px; top: ${clientY + 10}px`);
  }

  destroyTooltip() {
    document.getElementById('brushTooltip').classList.remove('active');
    document.getElementById('brushTooltip').innerHTML = '';
  }

  renderTooltip() {
    const { eventRange } = this.props.selectedPeriod;

    const rootTooltip = document.getElementById('brushTooltip');
    let leftCoord = 0;
    let topCoord = 0;

    const { xCoord } = this.getScale();
    const startDate = formatDate(new Date(xCoord.invert(eventRange[0]).getTime()));
    const endDate = formatDate(new Date(xCoord.invert(eventRange[1]).getTime()));

    const tooltipDOM = `
      <ul>
        <li><span>starts:</span> <span>${startDate.day}/${startDate.month}/${startDate.year}</span> <span>${startDate.time}</span> </li>
        <li><span>ends:</span> <span>${endDate.day}/${endDate.month}/${endDate.year}</span> <span>${endDate.time}</span></li>
      </ul>`;

    rootTooltip.classList.add('active');
    rootTooltip.innerHTML = tooltipDOM;
    this.updateTooltipCoords();
    if (d3.event.sourceEvent === undefined) {
      this.updateTooltipCoords();
    } else {
      leftCoord = d3.event.sourceEvent.clientX;
      topCoord = d3.event.sourceEvent.clientY;
      rootTooltip.setAttribute('style', `left: ${leftCoord + 10}px; top: ${topCoord + 10}px`);
    }
  }

  render() {
    const { width, height } = this.state;

    return (
      <div>
        <svg width={width} height={height} className="wave-chart">
          {this.drawData()}
          <g
            className="overview-brush"
            width={width}
            height={height}
            id={this.props.dataRun.id}
            onMouseMove={() => this.initTooltip()}
            transform="translate(9,3)"
          />
        </svg>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  eventDetails: getCurrentEventDetails(state),
  selectedPeriod: getSelectedPeriodRange(state),
  isEditingEvent: getIsEditingEventRange(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  isPopupOpen: getIsPopupOpen(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectDatarun: (datarunID: string) => dispatch(selectDatarun(datarunID)),
  onChangePeriod: (period: { eventRange: Array<number>; zoomValue: object }) => dispatch(setTimeseriesPeriod(period)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(DrawChart);
