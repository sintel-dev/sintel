import * as d3 from 'd3';

function getScale(w, h, dataRun) {
    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    const { timeSeries } = dataRun;
    const timeSeriesMin = timeSeries[0][0];
    const timeSeriesMax = timeSeries[timeSeries.length - 1][0];
    const x = d3.scaleTime().range([0, w]);
    const y = d3.scaleLinear().range([h, 0]);

    minValue = minValue > timeSeriesMin ? timeSeriesMin : minValue;
    maxValue = maxValue < timeSeriesMax ? timeSeriesMax : maxValue;
    x.domain([minValue, maxValue]);
    y.domain([-1, 1]);

    return { x, y };
  }

  function drawBrush (element, width, onPeriodTimeChange) {
    const brushHeight = 43;
    const xRange = d3.scaleTime().range([0, width]);
    const brush = d3.brushX()
      .extent([[0, 0], [width, brushHeight]]);
    const brushContext = element.append('g').attr('class', 'brushContext');

    brushContext.append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(5, 3)')
      .call(brush)
      .call(brush.move, xRange.range());


    const onBrushChange = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      onPeriodTimeChange(d3.event.selection);
    };
    brush.on('brush end', onBrushChange);
  }

export function drawChart(width, height, dataRun, onPeriodTimeChange) {
    const chartWidth = width - 10;

    const { timeSeries, eventWindows } = dataRun;
    const { x, y } = getScale(chartWidth, height, dataRun);
    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    const highlightedEvents = eventWindows.map(event => timeSeries.slice(event[0], event[1] + 2));
    const svg = d3.select(`._${dataRun.id}`)
      .append('svg')
      .attr('width', chartWidth)
      .attr('class', 'wave-chart');

    svg.append('path')
      .attr('class', 'wave-data')
      .attr('d', line(timeSeries))
      .attr('transform', 'translate(10, 6)');

    highlightedEvents.map(event =>
      svg.append('path')
        .attr('class', 'wave-event')
        .attr('transform', 'translate(10, 6)')
        .attr('d', line(event)),
    );
    drawBrush(svg, width, onPeriodTimeChange);
  }
