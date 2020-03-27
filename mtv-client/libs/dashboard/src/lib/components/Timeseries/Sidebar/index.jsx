import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import {
  getDatarunDetails,
  getSelectedPeriodLevel,
  getReviewPeriod,
  getIsEditingEventRange,
} from '../../../model/selectors/datarun';
import { getWrapperSize, drawArc, getDataScale } from './SidebarUtils';
import { setPeriodLevelAction, reviewPeriodAction } from '../../../model/actions/datarun';
import './Sidebar.scss';

class Sidebar extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      width: 0,
      height: 0,
      radius: 0,
      colSpacing: 0,
      rowSpacing: 30,
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState(
      {
        width,
        height,
        zoomValue: null,
        initialHeight: height,
      },
      () => {
        this.setGlyphRadius();
        this.initZoom();
      },
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.dataRun.period !== prevProps.dataRun.period) {
      this.setGlyphRadius();
    }
  }

  getColSpacing() {
    const { width, height } = this.state;
    const { nCols } = this.getColAmount();
    const diff = (width > height ? width - height : height - width) / nCols;
    const colSpacing = diff / nCols;

    return { colSpacing };
  }

  setGlyphRadius() {
    const { width, rowSpacing } = this.state;
    const { colSpacing } = this.getColSpacing();
    const { nCols } = this.getColAmount();
    const { dataRun } = this.props;
    const { period } = dataRun;
    const glyphCellDiameter = width / nCols - 3; // offset for the arc
    const radius = glyphCellDiameter / 2 - colSpacing; // / 2;
    const nRows = Math.round(dataRun.period.length / nCols);
    let height = nRows * (radius * 2 + rowSpacing);

    if (period[0].level === 'day') {
      height += radius * 3 + rowSpacing;
    }

    this.setState({
      radius,
      colSpacing,
      height,
    });
  }

  initZoom() {
    const { width, height } = this.state;
    let zoom = null;

    zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', () =>
        this.setState({
          zoomValue: d3.event.transform,
        }),
      );

    d3.select('#multiPeriodChart .zoom').call(zoom);
  }

  getFeatureCellCoords(currentPeriod, index) {
    const { width, colSpacing, rowSpacing, radius } = this.state;
    const { nCols } = this.getColAmount();
    const glyphCell = width / nCols;
    const colIteration = index % nCols > 0 ? index % nCols : 0;
    const rowIteration = Math.floor(index / nCols);
    let horizontalShift = (glyphCell + colSpacing / nCols) * colIteration + radius + 3;
    let verticalShift = (radius * 2 + rowSpacing) * rowIteration + radius + 3;

    if (currentPeriod.level === 'day') {
      let dayOffset = new Date(`${currentPeriod.parent.name} 1, ${currentPeriod.parent.parent.name} 00:00:00`).getDay();
      const hShiftAddition = (index + dayOffset) % nCols;
      const vShiftAddition = Math.floor((index + dayOffset) / nCols);

      horizontalShift = hShiftAddition * glyphCell + radius + 2;
      verticalShift = vShiftAddition * (glyphCell + rowSpacing / 2) + radius + 2;
    }
    return { horizontalShift, verticalShift };
  }

  getPathData(periodRange) {
    const { radius } = this.state;
    const { area } = getDataScale(radius * 0.1, radius, periodRange);
    return area(periodRange);
  }

  getColAmount() {
    const { selectedPeriodLevel, reviewRange } = this.props;

    let nCols = 3;
    if (!reviewRange) {
      if (selectedPeriodLevel.year) {
        nCols = 4;
      }
      if (selectedPeriodLevel.month) {
        nCols = 7;
      }
    } else {
      if (reviewRange === 'year') {
        nCols = 3;
      }
      if (reviewRange === 'month') {
        nCols = 4;
      }
      if (reviewRange === 'day') {
        nCols = 7;
      }
    }

    return { nCols };
  }

  drawData() {
    const { width, zoomValue, radius } = this.state;
    const { setPeriodRange, dataRun, isEditingEventRange } = this.props;
    const { period, grouppedEvents } = dataRun;

    return (
      width > 0 &&
      radius > 0 &&
      period.map((currentPeriod, periodIndex) => {
        const { horizontalShift, verticalShift } = this.getFeatureCellCoords(currentPeriod, periodIndex);
        const arcData = drawArc(currentPeriod, grouppedEvents, radius, periodIndex);

        return (
          <g transform={zoomValue} key={currentPeriod.name}>
            <g
              className="feature-cell"
              transform={`translate(${horizontalShift}, ${verticalShift})`}
              onClick={() => !isEditingEventRange && setPeriodRange(currentPeriod)}
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

                <text className="radial-text" y={radius + 15} x={0}>
                  {currentPeriod.name}
                </text>
                {arcData.length &&
                  arcData.map(arc => (
                    <path key={arc.eventID} d={arc.pathData} className={arc.tag} fill={arc.tagColor} />
                  ))}
              </g>
              <circle
                r={radius * 0.85}
                className="wrapper"
                fill="url(#blueGradient)"
                clipPath={`url(#clip_${currentPeriod.name})`}
              />
            </g>
          </g>
        );
      })
    );
  }

  renderWeekDays() {
    const { dataRun } = this.props;
    const { period } = dataRun;
    const { width } = this.state;
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const { nCols } = this.getColAmount();
    const cellWidth = width / nCols;

    return (
      period[0].level === 'day' && (
        <ul className="week-days">
          {weekDays.map(currentDay => (
            <li style={{ width: `${cellWidth}px` }} key={currentDay}>
              {currentDay}
            </li>
          ))}
        </ul>
      )
    );
  }

  render() {
    const { experimentData, dataRun, selectedPeriodLevel, reviewPeriod, reviewRange, isEditingEventRange } = this.props;
    const { period } = dataRun;
    const { width, height, initialHeight } = this.state;

    const getWrapperHeight = () => {
      let wrapperHeight = initialHeight;

      if (period[0].level === 'day') {
        wrapperHeight -= 20; // wrapper heading height (day names)
      }
      return wrapperHeight;
    };

    return (
      <div className="right-sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header
            headerTitle={dataRun.signal}
            reviewPeriod={reviewPeriod}
            reviewRange={reviewRange}
            currentPeriod={selectedPeriodLevel}
            isEditingEventRange={isEditingEventRange}
            dataRun={dataRun}
            selectedPeriodLevel={selectedPeriodLevel}
          />

          <div id="dataWrapper" className="data-wrapper">
            {this.renderWeekDays()}
            <div className="wrapper-container scroll-style" style={{ height: `${getWrapperHeight()}px` }}>
              <svg id="multiPeriodChart" width={width} height={height}>
                <rect className="zoom" width={width} height={height} />
                {this.drawData(period)}
                <defs>
                  <radialGradient id="blueGradient">
                    <stop offset="0" stopColor="#B2C1FF" />
                    <stop offset="100" stopColor="rgba(216,216,216,0)" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
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
    selectedPeriodLevel: getSelectedPeriodLevel(state),
    reviewRange: getReviewPeriod(state),
    isEditingEventRange: getIsEditingEventRange(state),
  }),
  dispatch => ({
    setPeriodRange: periodLevel => dispatch(setPeriodLevelAction(periodLevel)),
    reviewPeriod: periodLevel => dispatch(reviewPeriodAction(periodLevel)),
  }),
)(Sidebar);
