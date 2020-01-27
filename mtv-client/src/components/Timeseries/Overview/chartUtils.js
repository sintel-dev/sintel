import * as d3 from 'd3';

let brush = null;
let brushContext = null;

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

export function drawBrush(element, width, onPeriodTimeChange, selectedPeriod) {
  width -= 25;
  const brushHeight = 43;
  const xRange = selectedPeriod.length
    ? d3.scaleTime().range(selectedPeriod.eventRange)
    : d3.scaleTime().range([0, width]);

  brush = d3.brushX().extent([
    [0, 0],
    [width, brushHeight],
  ]);
  brushContext = element.append('g').attr('class', 'brushContext');
  brushContext
    .append('g')
    .attr('class', 'brush')
    .attr('transform', 'translate(5, 3)')
    .call(brush)
    .call(brush.move, xRange.range());

  brush.on('brush', () => {
    const eventRange = d3.event.selection && d3.event.selection;
    const zoomValue = d3.zoomIdentity.scale(width / (eventRange[1] - eventRange[0])).translate(-eventRange[0], 0);
    const periodRange = {
      eventRange,
      zoomValue,
    };
    eventRange && onPeriodTimeChange(periodRange);
  });
}

export function updateBrushPeriod(selectedPeriod) {
  let currentBrush = d3.select(document.querySelector('.time-row.active g.brush'));

  if (currentBrush.attr('simulate')) {
    return;
  }

  let selection = d3.selectAll(document.querySelectorAll('g.brush'));

  currentBrush.attr('active', true);
  selection.attr('simulate', true);

  selection.call(brush.move, selectedPeriod.eventRange).on('end', () => {
    selection.attr('simulate', null);
    currentBrush.attr('active', null);
  });

  currentBrush.attr('active', null);
  selection.attr('simulate', null);
}

export function drawChart(width, height, dataRun, onPeriodTimeChange, selectedPeriod) {
  const chartWidth = width - 35;
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
    .attr('width', chartWidth)
    .attr('class', 'wave-chart');

  svg
    .append('path')
    .attr('class', 'wave-data')
    .attr('d', line(timeSeries))
    .attr('transform', 'translate(10, 6)');

  highlightedEvents.forEach(event => {
    svg
      .append('path')
      .attr('class', 'wave-event')
      .attr('transform', 'translate(10, 6)')
      .attr('d', line(event));
  });
  drawBrush(svg, width, onPeriodTimeChange, selectedPeriod);
}
