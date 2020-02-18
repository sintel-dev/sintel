import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import {
  getSelectedExperimentData,
  getSelectedPeriodLevel,
  getIsPeriodLevelSelected,
} from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import { getWrapperSize } from './SidebarUtils';
import './Sidebar.scss';
import { setPeriodLevelAction, reviewPeriodAction } from '../../../model/actions/datarun';

const graphSpacing = 10;

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
    const nCols = this.getColAmount();
    const diameter = width / nCols;

    const colIteration = index % nCols > 0 ? index % nCols : 0;
    const rowIteration = Math.floor(index / nCols);
    const horizontalShift = diameter * colIteration + diameter / 2;
    const verticalShift = rowIteration * diameter + diameter / 2;
    return { horizontalShift, verticalShift };
  }

  getDataScale(innerRadius, outerRadius, periodRange) {
    const scaleAngle = d3
      .scaleLinear()
      .range([0, 2 * Math.PI])
      .domain([0, periodRange.length - 0.08]);

    const scaleRadius = d3
      .scaleLinear()
      .range([innerRadius, outerRadius])
      .clamp(true)
      .domain([0, 1.2]);

    const area = d3
      .areaRadial()
      .angle((d, i) => scaleAngle(i))
      .innerRadius(() => scaleRadius(0))
      .outerRadius(d => scaleRadius(d))
      .curve(d3.curveCardinalClosed);

    const area0 = d3
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
    const nCols = this.getColAmount();
    const radius = width / nCols / 2 - graphSpacing;

    const { area } = this.getDataScale(radius * 0.1, radius, periodRange);
    return area(periodRange);
  }

  getColAmount() {
    const { selectedPeriodLevel, isPeriodLevelSelected } = this.props;
    if (isPeriodLevelSelected) {
      if (selectedPeriodLevel.level === 'year') {
        return 4;
      }
      if (selectedPeriodLevel.level === 'month') {
        return 7;
      }
    }
    return 3;
  }

  drawData() {
    const { width } = this.state;
    const { setPeriodLevel, isPeriodLevelSelected, dataRun } = this.props;
    const { period } = dataRun;

    const periodData = isPeriodLevelSelected ? period[0].children : period;
    const radius = width / this.getColAmount() / 2 - graphSpacing;

    return (
      width > 0 &&
      periodData.map((currentPeriod, index) => {
        const { horizontalShift, verticalShift } = this.getFeatureCellCoords(index);
        return (
          <g
            key={currentPeriod.name}
            className="feature-cell"
            transform={`translate(${horizontalShift}, ${verticalShift})`}
            onClick={() => setPeriodLevel(currentPeriod)}
          >
            <path
              id={`path_${currentPeriod.name}`}
              d={this.getPathData(currentPeriod.bins)}
              className="feature-area radial-cursor"
            />
            <clipPath id={`clip_${currentPeriod.name}`}>
              <use href={`#path_${currentPeriod.name}`} />
            </clipPath>
            <g className="target">
              <circle r={radius} />
              <circle r={radius * 0.7} />
              <circle r={radius * 0.4} />
              <circle r={radius * 0.1} className="target-info" />
              <line x1={-radius} x2={radius} />
              <line y1={-radius} y2={radius} />

              <text className="radial-text" y={radius + 15} x={-15}>
                {currentPeriod.name}
              </text>
            </g>
            <circle
              r={radius * 0.85}
              className="wrapper"
              fill="url(#blueGradient)"
              clipPath={`url(#clip_${currentPeriod.name})`}
            />
          </g>
        );
      })
    );
  }

  render() {
    const { experimentData, dataRun, selectedPeriodLevel, isPeriodLevelSelected, reviewPeriod } = this.props;
    const { period } = dataRun;
    const { width, height } = this.state;
    return (
      <div className="sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header
            headerTitle={dataRun.signal}
            reviewPeriod={reviewPeriod}
            isPeriodLevelSelected={isPeriodLevelSelected}
            currentPeriod={selectedPeriodLevel}
          />
          <div>{selectedPeriodLevel && selectedPeriodLevel.name}</div>
          <div className="data-wrapper" id="dataWrapper">
            <svg id="multiPeriodChart" width={width} height={height}>
              {this.drawData(period)}
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
    isPeriodLevelSelected: getIsPeriodLevelSelected(state),
    selectedPeriodLevel: getSelectedPeriodLevel(state),
  }),
  dispatch => ({
    setPeriodLevel: periodLevel => dispatch(setPeriodLevelAction(periodLevel)),
    reviewPeriod: periodLevel => dispatch(reviewPeriodAction(periodLevel)),
  }),
)(Sidebar);
