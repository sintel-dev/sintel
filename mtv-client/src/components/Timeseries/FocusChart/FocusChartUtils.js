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
};

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

const drawChartAxis = (chartID, datarun) => {
  const transition = d3.transition().duration(500);
  const graph = document.querySelector('#focusGraph');
  const { width, height } = pageCoords;
  const { xCoord, yCoord } = getScale(datarun);
  const xAxis = d3.axisBottom(xCoord);
  const yAxis = d3.axisLeft(yCoord);

  const chart = d3.select(chartID)
    .append('svg')
    .attr('id', 'focusGraph')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'focus-chart');

  if (!graph) {
    const axisG = chart
      .append('g')
      .attr('class', 'chart-axis')
      .attr('transform', 'translate(38, 0)');

    axisG.append('g')
      .attr('transform', `translate(0, ${height - 22})`)
      .attr('class', 'axis axis--x')
      .call(xAxis);

    axisG.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(0, 88)')
      .call(yAxis.ticks(5, ',f'));
  } else {
    const focusGraph = d3.select('#focusGraph');
    focusGraph
      .select('.axis.axis--x')
      .transition(transition)
      .call(xAxis);

      focusGraph
        .select('.axis.axis--y')
        .transition(transition)
        .call(yAxis.ticks(5, ',f'));
    }
};


export function drawChart(width, height, datarun) {
  pageCoords.width = width;
  pageCoords.height = height;
  drawChartAxis('#focusChart', datarun);
}
