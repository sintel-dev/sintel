import * as d3 from 'd3';
import { FocusChartConstants } from '../FocusChart/Constants';
import { formatDate } from '../../../model/utils/Utils';

// @TODO - technical debt, make this a normal react class
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
  const { maxTimeSeries } = dataRun;
  const timeSeriesMin = maxTimeSeries[0][0];
  const timeSeriesMax = maxTimeSeries[maxTimeSeries.length - 1][0];
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

const handleBrushTooltip = (selectedRange = null, dataRun) => {
  let leftCoord = 0;
  let topCoord = 0;
  if (d3.event.sourceEvent === undefined) {
    leftCoord = d3.event.clientX;
    topCoord = d3.event.clientX;
  } else {
    leftCoord = d3.event.sourceEvent.sourceEvent.clientX;
    topCoord = d3.event.sourceEvent.sourceEvent.clientY;
  }

  const { xCoord } = getScale(chartWidth, 36, dataRun);

  const startDate = formatDate(new Date(xCoord.invert(selectedRange[0]).getTime()));
  const endDate = formatDate(new Date(xCoord.invert(selectedRange[1]).getTime()));
  const tooltipHTML = `<ul>
      <li><span>starts:</span> <span>${startDate.day}/${startDate.month}/${startDate.year}</span> <span>${startDate.time}</span> </li>
      <li><span>ends:</span> <span>${endDate.day}/${endDate.month}/${endDate.year}</span> <span>${endDate.time}</span></li>
    </ul>`;
  const offsetLeft = leftCoord + 10;
  const offsetTop = topCoord + 10;
  const brushTooltip = document.getElementById('brushTooltip');

  brushTooltip.classList.add('active');
  brushTooltip.setAttribute('style', `left: ${offsetLeft}px; top: ${offsetTop}px`);
  brushTooltip.innerHTML = tooltipHTML;
};

const removeTooltip = () => {
  const tooltip = document.getElementById('brushTooltip');
  tooltip.classList.remove('active');
  tooltip.innerHTML = '';
};

const updateTooltipCoords = () => {
  const { clientX, clientY } = d3.event;
  const tooltip = document.getElementById('brushTooltip');
  tooltip.setAttribute('style', `left: ${clientX + 10}px; top: ${clientY + 10}px`);
};

export const brushTooltip = (selectedRange, dataRun) => {
  const brushSelections = d3.selectAll('.brush .selection');
  brushSelections
    .on('mouseover', function() {
      handleBrushTooltip(selectedRange.eventRange, dataRun);
    })
    .on('mousemove', function() {
      updateTooltipCoords();
    })
    .on('mouseout', function() {
      removeTooltip();
    });
};

export function drawBrush(element, width, onPeriodTimeChange, onSelectDatarun, dataRun) {
  const brushHeight = 43;

  brush = d3.brushX().extent([[0, 0], [width, brushHeight]]);
  brushContext = element.append('g').attr('class', 'brushContext');
  brushContext
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${offset.left}, ${offset.top / 2})`)
    .on('mousedown', () => {
      onSelectDatarun(dataRun.id);
    })
    .call(brush);

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
    d3.event.sourceEvent !== null &&
      d3.event.sourceEvent.type === 'brush' &&
      handleBrushTooltip(d3.event.sourceEvent.selection, dataRun);
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

export function drawChart(width, height, dataRun, onPeriodTimeChange, onSelectDatarun) {
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
  drawBrush(svg, chartWidth, onPeriodTimeChange, onSelectDatarun, dataRun);
}

export function updateHighlithedEvents(datarun) {
  const { eventWindows, timeSeries } = datarun;
  const currentSvg = d3.selectAll(`#_${datarun.id}`);
  currentSvg.selectAll('.wave-event').remove();

  const highlightedEvents = eventWindows.map(currentEvent => ({
    period: timeSeries.slice(currentEvent[0], currentEvent[1] + 2),
    eventID: currentEvent[3],
  }));

  const { xCoord, yCoord } = getScale(chartWidth, 36, datarun);
  const svg = d3.select(`#_${datarun.id} .event-wrapper`);
  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  highlightedEvents.forEach(currentEvent =>
    svg
      .append('path')
      .attr('class', 'wave-event')
      .attr('id', `wawe_${currentEvent.eventID}`)
      .attr('transform', `translate(${offset.left}, ${offset.top})`)
      .attr('d', line(currentEvent.period)),
  );
}
