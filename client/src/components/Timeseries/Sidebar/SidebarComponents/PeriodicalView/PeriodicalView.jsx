import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  getDatarunDetails,
  getGrouppedDatarunEvents,
  getIsTimeSyncModeEnabled,
  getIsEventModeEnabled,
  getIsEditingEventRange,
} from 'src/model/selectors/datarun';
import * as _ from 'lodash';
import { setPeriodRangeAction } from 'src/model/actions/datarun';
import { getIsRelativeScaleEnabled, getIsSummaryViewActive } from 'src/model/selectors/sidebar';
import { getWrapperSize, drawArc, getDataScale } from '../../SidebarUtils';

import Header from '../Header';

class PeriodicalView extends Component {
  constructor(props) {
    super(props);
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

  getPathData(periodRange, currentPeriodExtent) {
    const { radius } = this.state;
    const { isRelativeScaleEnabled } = this.props;

    if (periodRange.length === 1) {
      periodRange = new Array(360).fill(periodRange[0]);
    }

    const { area } = getDataScale(radius * 0.1, radius, periodRange, isRelativeScaleEnabled, currentPeriodExtent);

    return area(periodRange);
  }

  getWrapperHeight = () => {
    const { dataRun, isSummaryViewActive } = this.props;
    const { initialHeight } = this.state;
    let wrapperHeight = initialHeight;

    if (dataRun.period[0].level === 'day') {
      return isSummaryViewActive ? wrapperHeight - 198 : wrapperHeight - 81; // day names height calculus
    }
    if (!isSummaryViewActive) {
      return wrapperHeight - 58;
    }
    return wrapperHeight - 175;
  };

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
    const currentPeriodExtent = [Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER];
    _.each(dataRun.period, (currentPeriod) => {
      currentPeriodExtent[0] = Math.min(_.min(currentPeriod.bins), currentPeriodExtent[0]);
      currentPeriodExtent[1] = Math.max(_.max(currentPeriod.bins), currentPeriodExtent[1]);
    });

    return (
      width > 0 &&
      radius > 0 &&
      dataRun.period.map((currentPeriod, periodIndex) => {
        const { horizontalShift, verticalShift } = this.getFeatureCellCoords(currentPeriod, periodIndex);
        const arcData = drawArc(currentPeriod, grouppedEvents, radius, periodIndex);
        const { name, bins, level } = currentPeriod;
        return (
          <g key={name}>
            <g
              className={`feature-cell level-${level}`}
              transform={`translate(${horizontalShift}, ${verticalShift})`}
              onClick={() => level !== 'day' && setPeriodRange(currentPeriod)}
            >
              <path
                id={`path_${name}`}
                d={this.getPathData(bins, currentPeriodExtent)}
                className="feature-area radial-cursor"
              />
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
              <circle r={radius} className="wrapper" fill="url(#blueGradient)" clipPath={`url(#clip_${name})`} />
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

  render() {
    const { width, height } = this.state;
    return (
      <div>
        <Header />
        <div id="dataWrapper" className="data-wrapper">
          {this.renderWeekDays()}
          <div className="wrapper-container scroll-style" style={{ maxHeight: `${this.getWrapperHeight()}px` }}>
            <svg id="multiPeriodChart" width={width} height={height}>
              {this.drawData()}
              <defs>
                <radialGradient id="blueGradient">
                  <stop offset="0" stopColor="rgba(178, 193, 255, 0.7)" />
                  <stop offset="100" stopColor="rgba(178, 193, 255, 0.2)" />
                  {/* <stop offset="100" stopColor="rgba(89, 93, 106, 0.2)" /> */}
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    dataRun: getDatarunDetails(state),
    isEditingEventRange: getIsEditingEventRange(state),
    grouppedEvents: getGrouppedDatarunEvents(state),
    isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
    isEventModeEnabled: getIsEventModeEnabled(state),
    isRelativeScaleEnabled: getIsRelativeScaleEnabled(state),
    isSummaryViewActive: getIsSummaryViewActive(state),
  }),
  (dispatch) => ({
    setPeriodRange: (periodLevel) => dispatch(setPeriodRangeAction(periodLevel)),
  }),
)(PeriodicalView);
