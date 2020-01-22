import * as d3 from 'd3';

const offset = {
  offsetWidth: 55,
  offsetHeight: 110,
  minValue: Number.MAX_SAFE_INTEGER,
  maxValue: Number.MIN_SAFE_INTEGER,
};

const pageCoords = {
  width: 0,
  height: 0,
  translateTop: 88,
  translateLeft: 38,
};

const transition = d3.transition().duration(500);

function getScale(dataRun) {
  const { offsetWidth, offsetHeight, minValue, maxValue } = offset;
  const { width, height } = pageCoords;
  const { timeSeries } = dataRun;

  const [minTX, maxTX] = d3.extent(timeSeries, time => time[0]);
  const [minTY, maxTY] = d3.extent(timeSeries, time => time[1]);

  const xCoord = d3.scaleTime().range([0, width - offsetWidth]);
  const yCoord = d3.scaleLinear().range([height - offsetHeight, 0]);

  const minX = Math.min(minValue, minTX);
  const maxX = Math.max(maxValue, maxTX);

  const minY = Math.min(minValue, minTY);
  const maxY = Math.max(maxValue, maxTY);

  xCoord.domain([minX, maxX]);
  yCoord.domain([minY, maxY]);

  return { xCoord, yCoord };
}

const drawChartWithAxis = (chartID, datarun) => {
  const graph = document.querySelector('#focusGraph');
  const { width, height, translateTop, translateLeft } = pageCoords;
  const { xCoord, yCoord } = getScale(datarun);
  const xAxis = d3.axisBottom(xCoord);
  const yAxis = d3.axisLeft(yCoord);

  const createChart = () => {
    const chart = d3.select(chartID)
      .append('svg')
      .attr('id', 'focusGraph')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'focus-chart');

    drawChartData(datarun);

    const axisG = chart
      .append('g')
      .attr('class', 'chart-axis')
      .attr('transform', `translate(${translateLeft}, 0)`);

    axisG.append('g')
      .attr('transform', `translate(0, ${height - 22})`)
      .attr('class', 'axis axis--x')
      .call(xAxis);

    axisG.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', `translate(0, ${translateTop})`)
      .call(yAxis.ticks(5, ',f'));
  };

  const updateChart = () => {
    drawChartData(datarun); // Should reside here, it's drawing data first and axes after (z-index)
    const focusGraph = d3.select('#focusGraph');
    focusGraph
      .select('.axis.axis--x')
      .attr('transform', `translate(0, ${height - 22})`)
      .transition(transition)
      .call(xAxis);

      focusGraph
        .select('.axis.axis--y')
        .attr('transform', `translate(0, ${translateTop})`)
        .transition(transition)
        .call(yAxis.ticks(5, ',f'));
  };

  graph ? updateChart() : createChart();
};

const drawChartData = (datarun) => {
  const { xCoord, yCoord } = getScale(datarun);
  const { width, height, translateTop, translateLeft } = pageCoords;
  const path = d3.select('.chart-data');
  const chart = d3.select('#focusGraph');

  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));

  // eslint-disable-next-line no-underscore-dangle
  if (path._groups[0][0] === null) {
    const chartLine = chart
      .append('g')
      .attr('class', 'chart-data')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${translateLeft}, ${translateTop})`);

    chartLine.append('path')
      .attr('class', 'chart-waves')
      .transition(transition)
      .attr('d', () => line(datarun.timeSeries));
  } else {
    d3.select('.chart-waves')
      .transition(transition)
      .attr('d', () => line(datarun.timeSeries));
  }
};

export function drawChart(width, height, datarun) {
  pageCoords.width = width;
  pageCoords.height = height;
  drawChartWithAxis('#focusChart', datarun);
}
