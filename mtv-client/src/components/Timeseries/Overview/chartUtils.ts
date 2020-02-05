import * as d3 from 'd3';

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

function getScale(width, height, dataRun) {
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
}

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

const getRatio = eventRange => {
  let node: any = document.querySelector('.focus');
  focusChartWidth = parseInt(node.attributes.width.value, 10);
  ratio = chartWidth / focusChartWidth;
  const start = eventRange[0] * ratio;
  const end = eventRange[1] * ratio;

  return { start, end };
};

export function updateBrushPeriod(event) {
  let currentBrush = d3.select('.time-row.active g.brush');

  if (currentBrush.attr('simulate')) {
    return;
  }

  let selection = d3.selectAll('g.brush');

  currentBrush.attr('active', true);
  selection.attr('simulate', true);
  const { start, end } = getRatio(event.eventRange);

  selection.call(brush.move, [start, end]).on('end', () => {
    selection.attr('simulate', null);
    currentBrush.attr('active', null);
  });

  currentBrush.attr('active', null);
  selection.attr('simulate', null);
}

export function drawChart(width, height, dataRun, onPeriodTimeChange) {
  chartWidth = width - offset.infoWidth - 2 * offset.left;
  const { timeSeries, eventWindows } = dataRun;
  const { xCoord, yCoord } = getScale(chartWidth, height, dataRun);
  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  const highlightedEvents = eventWindows.map(event => timeSeries.slice(event[0], event[1] + 2));
  const svg = d3
    .select(`._${dataRun.id}`)
    .append('svg')
    .attr('width', width)
    .attr('class', 'wave-chart');

  svg
    .append('path')
    .attr('class', 'wave-data')
    .attr('d', line(timeSeries))
    .attr('transform', `translate(${offset.left}, ${offset.top})`);

  highlightedEvents.forEach(event => {
    svg
      .append('path')
      .attr('class', 'wave-event')
      .attr('transform', `translate(${offset.left}, ${offset.top})`)
      .attr('d', line(event));
  });
  drawBrush(svg, chartWidth, onPeriodTimeChange);
}
