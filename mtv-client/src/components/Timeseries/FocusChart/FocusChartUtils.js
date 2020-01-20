import * as d3 from 'd3';

function getScale(width, height) {
    let x;
    let y;
    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);
    return { x, y };
}

const drawChartAxes = (chartID, width, height) => {
  const chart = d3.select(chartID)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'focus-chart');

    const { x, y } = getScale(width, height);

    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisLeft(y);
    let axisG = chart.append('g');

    axisG.append('g')
      .attr('transform', `translate(16, ${height - 20})`)
      .attr('class', 'axis axis--x')
      .call(xAxis);

    axisG.append('g')
    .attr('class', 'axis axis--y')
    .attr('transform', 'translate(15, -10)')
    .call(yAxis.ticks(5, ',f'));
};

export function drawChart(width, height) {
  drawChartAxes('#focusChart', width, height);
}
