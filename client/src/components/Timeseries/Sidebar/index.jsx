import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import {
  getDatarunDetails,
  getIsEditingEventRange,
  getGrouppedDatarunEvents,
  getIsEventModeEnabled,
  getIsTimeSyncModeEnabled,
  getScrollHistory,
} from '../../../model/selectors/datarun';
import { getWrapperSize, drawArc, getDataScale } from './SidebarUtils';
import { setPeriodRangeAction, setScrollHistoryAction } from '../../../model/actions/datarun';
import './Sidebar.scss';
import SimilarShapes from './SimilarShapes';

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
        initialHeight: height,
      },
      () => {
        this.setGlyphRadius();
      },
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.dataRun.period !== prevProps.dataRun.period) {
      this.setGlyphRadius();
    }
  }

  getColSpacing(period) {
    const periodLevel = period[0];
    let colSpacing = 3;

    if (periodLevel === 'day') {
      colSpacing = 2;
    }

    return { colSpacing };
  }

  setGlyphRadius() {
    const { width, rowSpacing } = this.state;
    const nCols = this.getColAmount();
    const { dataRun } = this.props;
    const { period } = dataRun;
    const { colSpacing } = this.getColSpacing(period);
    const glyphCellDiameter = width / nCols - 3; // offset for the arc
    const radius = glyphCellDiameter / 2 - colSpacing; // / 2;
    const nRows = Math.round(dataRun.period.length / nCols);
    let height = nRows * (radius * 2 + rowSpacing);

    if (period[0].level === 'day') {
      height += radius * 3.4 + rowSpacing;
    }

    this.setState({
      radius,
      colSpacing,
      height,
    });
  }

  getFeatureCellCoords(currentPeriod, index) {
    const { width, colSpacing, rowSpacing, radius } = this.state;
    const nCols = this.getColAmount();
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
    const { dataRun } = this.props;
    const { period } = dataRun;
    const { level } = period[0];

    switch (level) {
      case 'month':
        return 4;
      case 'day':
        return 7;
      default:
        return 3;
    }
  }

  drawData() {
    const { width, radius } = this.state;
    const { setPeriodRange, dataRun, grouppedEvents, isEventModeEnabled } = this.props;

    return (
      width > 0 &&
      radius > 0 &&
      dataRun.period.map((currentPeriod, periodIndex) => {
        const { horizontalShift, verticalShift } = this.getFeatureCellCoords(currentPeriod, periodIndex);
        const arcData = drawArc(currentPeriod, grouppedEvents, radius, periodIndex);
        const { name, bins } = currentPeriod;
        return (
          <g key={name}>
            <g
              className={`feature-cell level-${currentPeriod.level}`}
              transform={`translate(${horizontalShift}, ${verticalShift})`}
              onClick={() => currentPeriod.level !== 'day' && setPeriodRange(currentPeriod)}
            >
              <path id={`path_${name}`} d={this.getPathData(bins)} className="feature-area radial-cursor" />
              <clipPath id={`clip_${name}`}>
                <use href={`#path_${name}`} />
              </clipPath>
              <g className="target">
                <circle r={radius} />
                <circle r={radius * 0.7} />
                <circle r={radius * 0.4} />
                <circle r={radius * 0.1} className="target-info" />
                <line x1={-radius} x2={radius} />
                <line y1={-radius} y2={radius} />

                <text className="radial-text" y={radius + 15} x={0}>
                  {name}
                </text>
                {isEventModeEnabled &&
                  arcData.length &&
                  arcData.map((arc) => (
                    <path key={arc.eventID} d={arc.pathData} className={arc.tag} fill={arc.tagColor} />
                  ))}
              </g>
              <circle r={radius * 0.85} className="wrapper" fill="url(#blueGradient)" clipPath={`url(#clip_${name})`} />
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
    const nCols = this.getColAmount();
    const cellWidth = width / nCols;

    return (
      period[0].level === 'day' && (
        <ul className="week-days">
          {weekDays.map((currentDay) => (
            <li style={{ width: `${cellWidth}px` }} key={currentDay}>
              {currentDay}
            </li>
          ))}
        </ul>
      )
    );
  }

  getWrapperHeight = () => {
    const { dataRun } = this.props;
    const { initialHeight } = this.state;
    let wrapperHeight = initialHeight;

    if (dataRun.period[0].level === 'day') {
      wrapperHeight -= 20; // wrapper heading height (day names)
    }
    return wrapperHeight;
  };

  render() {
    const { experimentData } = this.props;
    const { width, height } = this.state;
    return (
      <div className="right-sidebar">
        <SimilarShapes />
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header />
          <div id="dataWrapper" className="data-wrapper">
            {this.renderWeekDays()}
            <div className="wrapper-container scroll-style" style={{ height: `${this.getWrapperHeight()}px` }}>
              <svg id="multiPeriodChart" width={width} height={height}>
                {this.drawData()}
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
  (state) => ({
    experimentData: getSelectedExperimentData(state),
    dataRun: getDatarunDetails(state),
    isEditingEventRange: getIsEditingEventRange(state),
    grouppedEvents: getGrouppedDatarunEvents(state),
    isEventModeEnabled: getIsEventModeEnabled(state),
    isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
    scrollHistory: getScrollHistory(state),
  }),
  (dispatch) => ({
    setPeriodRange: (periodLevel) => dispatch(setPeriodRangeAction(periodLevel)),
    setScrollHistory: (period) => dispatch(setScrollHistoryAction(period)),
  }),
)(Sidebar);
