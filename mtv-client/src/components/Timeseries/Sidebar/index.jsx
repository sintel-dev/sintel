import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import { getWrapperSize } from './SidebarUtils';
import './Sidebar.scss';
import { setPeriodRangeAction } from '../../../model/actions/datarun';

class Sidebar extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();

    this.setState({
      width,
      height,
    });
  }

  getFeatureCellCoords(index) {
    const { width } = this.state;
    let nCols = 3;
    const diameter = width / nCols;

    const colIteration = index % nCols > 0 ? index % nCols : 0;
    const rowIteration = Math.floor(index / nCols);
    const horizontalShift = diameter * colIteration + diameter / 2;
    const verticalShift = rowIteration * diameter + diameter / 2;
    return { horizontalShift, verticalShift };
  }

  getDataScale(innerRadius, outerRadius, periodRange) {
    let scaleAngle = d3
      .scaleLinear()
      .range([0, 2 * Math.PI])
      .domain([0, periodRange.bins.length - 0.08]);

    let scaleRadius = d3
      .scaleLinear()
      .range([innerRadius, outerRadius])
      .clamp(true)
      .domain([0, 1.2]);

    let area = d3
      .areaRadial()
      .angle((d, i) => scaleAngle(i))
      .innerRadius(() => scaleRadius(0))
      .outerRadius(d => scaleRadius(d))
      .curve(d3.curveCardinalClosed);

    let area0 = d3
      .areaRadial()
      .angle((d, i) => {
        scaleAngle(i);
      })
      .innerRadius(() => scaleRadius(0))
      .outerRadius(() => scaleRadius(0))
      .curve(d3.curveCardinalClosed);

    return { scaleAngle, scaleRadius, area, area0 };
  }

  getPathData(periodRange) {
    const { width } = this.state;
    const graphSpacing = 10;
    const radius = width / 3 / 2 - graphSpacing;

    const { area } = this.getDataScale(radius * 0.1, radius, periodRange);
    return area(periodRange.bins);
  }

  drawData(periodRange, index) {
    const graphSpacing = 10;
    const { width } = this.state;
    const { setPeriodRange } = this.props;
    const radius = width / 3 / 2 - graphSpacing;
    const { horizontalShift, verticalShift } = this.getFeatureCellCoords(index);

    return (
      width > 0 && (
        <g
          key={periodRange.name}
          className="feature-cell"
          transform={`translate(${horizontalShift}, ${verticalShift})`}
          onClick={() => setPeriodRange(periodRange.children[0].level)}
        >
          <path
            id={`path_${periodRange.name}`}
            d={this.getPathData(periodRange)}
            className="feature-area radial-cursor"
          />
          <clipPath id={`clip_${periodRange.name}`}>
            <use href={`#path_${periodRange.name}`} />
          </clipPath>
          <g className="target">
            <circle r={radius} />
            <circle r={radius * 0.7} />
            <circle r={radius * 0.4} />
            <circle r={radius * 0.1} className="target-info" />
            <line x1={-radius} x2={radius} />
            <line y1={-radius} y2={radius} />

            <text className="radial-text" y={radius + 15} x={-15}>
              {periodRange.name}
            </text>
          </g>
          <circle
            r={radius * 0.85}
            className="wrapper"
            fill="url(#blueGradient)"
            clipPath={`url(#clip_${periodRange.name})`}
          />
        </g>
      )
    );
  }

  render() {
    const { experimentData, dataRun } = this.props;
    const { period } = dataRun;
    const { width, height } = this.state;
    return (
      <div className="sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header headerTitle={dataRun.signal} />
          <div className="data-wrapper" id="dataWrapper">
            <svg id="multiPeriodChart" width={width} height={height}>
              {period.map((periodRange, index) => this.drawData(periodRange, index))}
              <defs>
                <radialGradient id="blueGradient">
                  <stop offset="0" stopColor="#B2C1FF" />
                  <stop offset="100" stopColor="rgba(216,216,216,0)" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </Loader>
      </div>
    );
  }
}

export default connect(
  state => ({
    experimentData: getSelectedExperimentData(state),
    dataRun: getDatarunDetails(state),
  }),
  dispatch => ({
    setPeriodRange: periodRange => dispatch(setPeriodRangeAction(periodRange)),
  }),
)(Sidebar);
