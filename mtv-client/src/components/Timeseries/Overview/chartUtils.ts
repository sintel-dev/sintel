import * as d3 from 'd3';
import { FocusChartConstants } from '../FocusChart/Constants';

const { TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

let brush = null;
let brushContext = null;
let chartWidth = 0;

const offset = {
  left: 10,
  top: 6,
  handlersWidth: 6,
  infoWidth: 60,
};
let focusChartWidth = 0;
let ratio = 0;

const getScale = (width, height, dataRun) => {
  let minValue = Number.MAX_SAFE_INTEGER;
  let maxValue = Number.MIN_SAFE_INTEGER;
  const { timeSeries } = dataRun;
  const timeSeriesMin = timeSeries[0][0];
  const timeSeriesMax = timeSeries[timeSeries.length - 1][0];
  const xCoord = d3.scaleTime().range([0, width]);
  const yCoord = d3.scaleLinear().range([height, 0]);

  minValue = Math.min(minValue, timeSeriesMin);
  maxValue = Math.max(maxValue, timeSeriesMax);

  xCoord.domain([minValue, maxValue]);
  yCoord.domain([-1, 1]);

  return { xCoord, yCoord };
};

const drawRange = eventRange => {
  const chartStart = eventRange[0] * ratio;
  const chartEnd = eventRange[1] * ratio;

  return { chartStart, chartEnd };
};

const setRatio = width => {
  chartWidth = width - offset.infoWidth - 2 * offset.left;
  focusChartWidth = document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
  ratio = chartWidth / focusChartWidth;
};

export function drawBrush(element, width, onPeriodTimeChange) {
  const brushHeight = 43;
  const xRange = d3.scaleTime().range([0, width]);

  brush = d3.brushX().extent([
    [0, 0],
    [width, brushHeight],
  ]);
  brushContext = element.append('g').attr('class', 'brushContext');
  brushContext
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${offset.left}, ${offset.top / 2})`)
    .call(brush)
    .call(brush.move, xRange.range());

  brush.on('brush', () => {
    const eventRangeSelection = d3.event.selection && d3.event.selection;
    const eventRange = [eventRangeSelection[0] / ratio, eventRangeSelection[1] / ratio];
    const zoomValue = d3.zoomIdentity
      .scale(focusChartWidth / (eventRange[1] - eventRange[0]))
      .translate(-eventRange[0], 0);

    const periodRange = {
      eventRange,
      zoomValue,
    };

    eventRangeSelection && onPeriodTimeChange(periodRange);
  });
}

export function updateBrushPeriod(event) {
  let currentBrush = d3.select('.time-row.active g.brush');

  if (currentBrush.attr('simulate')) {
    return;
  }

  let selection = d3.selectAll('g.brush');

  currentBrush.attr('active', true);
  selection.attr('simulate', true);
  const { chartStart, chartEnd } = drawRange(event.eventRange);

  selection.call(brush.move, [chartStart, chartEnd]).on('end', () => {
    selection.attr('simulate', null);
    currentBrush.attr('active', null);
  });

  currentBrush.attr('active', null);
  selection.attr('simulate', null);
}

export function updateEventHihlight(eventDetails, width) {
  const { dataRun, updatedEventDetails } = eventDetails;
  const { timeSeries } = dataRun;
  const { xCoord, yCoord } = getScale(width, 36, dataRun);

  const startIndex = timeSeries.findIndex(element => updatedEventDetails.start_time - element[0] < 0) - 1;
  const stopIndex = timeSeries.findIndex(element => updatedEventDetails.stop_time - element[0] < 0);
  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  d3.select(`#wawe_${updatedEventDetails.id}`).attr('d', line(timeSeries.slice(startIndex, stopIndex)));
}

export function drawChart(width, height, dataRun, onPeriodTimeChange) {
  setRatio(width);
  const { timeSeries, eventWindows } = dataRun;

  const { xCoord, yCoord } = getScale(chartWidth, height, dataRun);
  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  const highlightedEvents = eventWindows.map(event => ({
    period: timeSeries.slice(event[0], event[1] + 2),
    eventID: event[3],
  }));

  const svg = d3
    .select(`._${dataRun.id}`)
    .append('svg')
    .attr('id', `_${dataRun.id}`)
    .attr('width', width)
    .attr('class', 'wave-chart');

  const eventWrapper = svg.append('g').attr('class', 'event-wrapper');
  eventWrapper
    .append('path')
    .attr('class', 'wave-data')
    .attr('d', line(timeSeries))
    .attr('transform', `translate(${offset.left}, ${offset.top})`);

  highlightedEvents.forEach(event =>
    eventWrapper
      .append('path')
      .attr('class', 'wave-event')
      .attr('id', `wawe_${event.eventID}`)
      .attr('transform', `translate(${offset.left}, ${offset.top})`)
      .attr('d', line(event.period)),
  );

  drawBrush(svg, chartWidth, onPeriodTimeChange);
}

export function updateHighlithedEvents(datarun) {
  const { events, eventWindows, timeSeries } = datarun;
  const currentSvg = d3.selectAll(`#_${datarun.id}`);

  events.forEach(event => {
    currentSvg.select(`#wawe_${event.id}`).remove();
  });

  const highlightedEvents = eventWindows.map(event => ({
    period: timeSeries.slice(event[0], event[1] + 2),
    eventID: event[3],
  }));

  const { xCoord, yCoord } = getScale(chartWidth, 36, datarun);
  const svg = d3.select(`#_${datarun.id} .event-wrapper`);
  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  highlightedEvents.forEach(event =>
    svg
      .append('path')
      .attr('class', 'wave-event')
      .attr('id', `wawe_${event.eventID}`)
      .attr('transform', `translate(${offset.left}, ${offset.top})`)
      .attr('d', line(event.period)),
  );
}
