import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import { getWrapperSize } from './SidebarUtils';
import './Sidebar.scss';

class Sidebar extends Component {
  componentDidMount() {
    const { width, height } = getWrapperSize();
    const chart = d3.select('#multiPeriodChart');

    this.setState(
      {
        width,
        height,
        chart,
      },
      () => {
        this.drawData();
      },
    );
  }

  getFeatureCellCoords(index) {
    const { width } = this.state;
    let nCols = 3;
    const diameter = width / nCols;

    const colIteration = index % nCols > 0 ? index % nCols : 0;
    const rowIteration = Math.floor(index / nCols);
    const horizontalShift = diameter * colIteration + diameter / 2;
    const verticalShift = rowIteration * diameter + diameter / 2;

    return `translate(${horizontalShift}, ${verticalShift})`;
  }

  drawFeatureTarget(featureCell, range) {
    const graphSpacing = 10;
    const { width } = this.state;
    const radius = width / 3 / 2 - graphSpacing;

    // drawing target circles
    const target = featureCell.append('g').attr('class', 'target');

    featureCell
      .append('text')
      .attr('class', 'radial-text')
      .text(range.name)
      .attr('x', function(data, arg, svgEls) {
        // eslint-disable-next-line no-bitwise
        const textOffset = ~~svgEls[0].getBBox().width;
        return -(textOffset / 2);
      })
      .attr('y', (data, arg, svgEls) => {
        // eslint-disable-next-line no-bitwise
        const textOffset = ~~svgEls[0].getBBox().height;
        return radius + textOffset;
      });

    target.append('circle').attr('r', radius);
    target.append('circle').attr('r', radius * 0.7);
    target.append('circle').attr('r', radius * 0.4);

    // drawing circle lines
    target
      .append('line')
      .attr('x1', -radius)
      .attr('x2', radius);

    target
      .append('line')
      .attr('y1', -radius)
      .attr('y2', radius);

    target
      .append('circle')
      .attr('class', 'target-info')
      .attr('r', radius * 0.1);
  }

  getDataScale(innerRadius, outerRadius) {
    let angle = d3.scaleLinear().range([0, 2 * Math.PI]);
    debugger;
    let radius = d3
      .scaleLinear()
      .range([innerRadius, outerRadius])
      .clamp(true);

    let area = d3
      .areaRadial()
      .angle((d, i) => {
        console.log('----', d, i);
        debugger;
        return angle(i);
      })
      .innerRadius(d => radius(0))
      .outerRadius(d => {
        console.log(']=====', d);
        return radius(d);
      })
      .curve(d3.curveCardinalClosed);

    let area0 = d3
      .areaRadial()
      .angle((d, i) =>
        // console.log(i);
        angle(i),
      )
      .innerRadius(d => radius(0))
      .outerRadius(d => radius(0))
      .curve(d3.curveCardinalClosed);

    return { angle, radius, area, area0 };
  }

  drawGradient() {
    const { chart } = this.state;
    const defs = chart.append('defs');
    const offset = defs.append('radialGradient').attr('id', 'blueGradient');
    offset
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#B2C1FF');

    offset
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(216,216,216,0)');
  }

  drawFeatureCell(range, index) {
    const { width } = this.state;
    const radius = width / 3 / 2;
    const { chart } = this.state;
    const { area, area0 } = this.getDataScale(9.047208333333332, 72.37766666666666);
    const featureCell = chart
      .append('g')
      .attr('class', 'feature-cell')
      .attr('transform', this.getFeatureCellCoords(index));

    this.drawFeatureTarget(featureCell, range);

    featureCell
      .append('circle')
      .attr('class', 'wrapper')
      .attr('r', radius * 0.85)
      .attr('fill', 'url(#blueGradient)');

    let path = featureCell
      .append('path')
      .datum(range.bins)
      .attr('class', 'feature-area radial-cursor')
      .attr('id', `path_${range.name}`)
      .attr('d', area0);

    let clipPath = featureCell.append('clipPath');

    clipPath
      .attr('id', `clip_${range.name}`)
      .append('use')
      .attr('xlink:href', `#path_${range.name}`);

    path.attr('d', area);

    // .on('click', () => self.trigger('select', o));
  }

  drawData() {
    const { chart, width, height } = this.state;
    const { dataRun } = this.props;
    const { period } = dataRun;

    chart.attr('width', width).attr('height', height);
    period.map((range, index) => this.drawFeatureCell(range, index));
    this.drawGradient();
  }

  render() {
    const { experimentData, dataRun } = this.props;
    return (
      <div className="sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header headerTitle={dataRun.signal} />
          <div className="data-wrapper" id="dataWrapper">
            <svg id="multiPeriodChart" />
          </div>
        </Loader>
      </div>
    );
  }
}

export default connect(state => ({
  experimentData: getSelectedExperimentData(state),
  dataRun: getDatarunDetails(state),
}))(Sidebar);
