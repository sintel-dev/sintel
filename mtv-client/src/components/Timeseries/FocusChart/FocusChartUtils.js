import * as d3 from 'd3';

// function getScale(width, height) {
//     let xAxis;
//     let yAxis;
//     xAxis = d3.scaleTime().range([0, width]);
// }

export function drawChart(width, height) {
    const chart = d3.select('#focusChart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'focus-chart');

    let xAxis = d3.axisBottom(20);
    let yAxis = d3.axisLeft(20);
    let axisG = chart.append('g')
      .attr('transform', `translate(0, ${height})`);

    axisG.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${height})`);
        // .call(xAxis);

    // axisG.append('g')
    //     .attr('class', 'axis axis--y')
    //     .call(yAxis.ticks(5, ',f'));

        // let line = d3.line()
        // .x(d => x(d[0]))
        // .y(d => y(d[1]));
}
