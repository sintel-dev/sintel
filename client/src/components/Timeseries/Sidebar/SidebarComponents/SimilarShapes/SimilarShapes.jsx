import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import './SimilarShapes.scss';
import {
  toggleSimilarShapesAction,
  getSimilarShapesAction,
  saveSimilarShapesAction,
  resetSimilarShapesAction,
  shapesTagsOverrideAction,
} from 'src/model/actions/similarShapes';
import { getCurrentEventDetails, getDatarunDetails, getIsEditingEventRange } from 'src/model/selectors/datarun';
import {
  getIsSimilarShapesLoading,
  getSimilarShapesCoords,
  getIsSimilarShapesActive,
} from 'src/model/selectors/similarShapes';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { setActiveEventAction } from 'src/model/actions/datarun';
import Dropdown from 'src/components/Common/Dropdown';

const shapesLanding = () => (
  <div className="shapes-landing">
    <p>Select an Event in order to see Similar Segments</p>
  </div>
);

const shapesLoader = () => (
  <div className="shapes-landing">
    <p>Loading</p>
  </div>
);

class SimilarShapes extends Component {
  componentDidUpdate(prevProps) {
    const currentEventID =
      (this.props.currentEvent && this.props.currentEvent.id) ||
      (prevProps.currentEvent && prevProps.currentEvent.id) ||
      null;
    if (prevProps.currentEvent && prevProps.currentEvent.id !== currentEventID) {
      this.props.resetSimilarShapes();
    }
  }

  getScale(data) {
    const MIN_VALUE = Number.MAX_SAFE_INTEGER;
    const MAX_VALUE = Number.MIN_SAFE_INTEGER;
    const width = 210;
    const height = 122;
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    const [minTX, maxTX] = d3.extent(data, (time) => time[0]);
    const [minTY, maxTY] = d3.extent(data, (time) => time[1]);

    const minX = Math.min(MIN_VALUE, minTX);
    const maxX = Math.max(MAX_VALUE, maxTX);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  drawLine(event) {
    const { xCoord, yCoord } = this.getScale(event);

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(event);
  }

  getShapeDetails(shape) {
    const { timeSeries } = this.props.dataRun;
    const { start, end, similarity } = shape;
    const startTime = start * 1000;
    const stopTime = end * 1000;

    const eventInterval = timeSeries.slice(start, end);
    const format = d3.format('.2f');

    return {
      startTime: timestampToDate(startTime),
      stopTime: timestampToDate(stopTime),
      similarity: format(similarity * 100),
      eventInterval,
    };
  }

  getCurrentEventShape() {
    const { currentEvent, dataRun } = this.props;
    const { timeSeries } = dataRun;
    const { start_time, stop_time } = currentEvent;
    const startIndex = timeSeries.findIndex((currentSeries) => currentSeries[0] === start_time);
    const stopIndex = timeSeries.findIndex((currentSeries) => currentSeries[0] === stop_time);
    const eventInterval = timeSeries.slice(startIndex, stopIndex + 1);

    return this.drawLine(eventInterval);
  }

  renderShapeFooter() {
    const { deleteEvent, saveShapes, similarShapes, currentEvent } = this.props;
    if (!similarShapes.length || currentEvent === null) {
      return null;
    }

    return (
      <div className="shape-footer">
        <ul>
          <li>
            <button type="button" className="clean delete" onClick={deleteEvent}>
              Delete
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <button type="button" className="clean" onClick={() => this.resetShapes()}>
              Cancel
            </button>
          </li>
          <li>
            <button type="button" className="save" onClick={saveShapes}>
              Save changes
            </button>
          </li>
        </ul>
      </div>
    );
  }

  renderShapes() {
    const { similarShapes, currentEvent } = this.props;

    if (currentEvent === null) {
      return null;
    }

    return similarShapes.map((currentShape) => {
      const { startTime, stopTime, similarity, eventInterval } = this.getShapeDetails(currentShape);
      return (
        <div className="shape-details" key={currentShape.start}>
          <table className="info">
            <tbody>
              <tr>
                <th>Start:</th>
                <td>{startTime}</td>
              </tr>
              <tr>
                <th>End:</th>
                <td>{stopTime}</td>
              </tr>
              <tr>
                <th>Similarity:</th>
                <td>{similarity}%</td>
              </tr>
              <tr>
                <th>Tag</th>
                <td>
                  <Dropdown />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="drawing">
            <svg width="134" height="127" className="shape-chart">
              <path d={this.drawLine(eventInterval)} />
              <path d={this.getCurrentEventShape()} className="current-event-shape" />
            </svg>
          </div>
        </div>
      );
    });
  }

  renderEventData() {
    const { currentEvent, similarShapes } = this.props;
    const { start_time, stop_time } = currentEvent || { start_time: null, stop_time: null };
    const activeClass = similarShapes.length ? 'active' : '';
    return (
      <div className={`form-row ${activeClass}`}>
        <div className="form-wrapper">
          <label htmlFor="from">From</label>
          {(start_time !== null && timestampToDate(start_time)) || <p>-</p>}
        </div>
        <div className="form-wrapper">
          <label htmlFor="to">To</label>
          {(stop_time !== null && timestampToDate(stop_time)) || <p>-</p>}
        </div>
      </div>
    );
  }

  renderShapeOptions() {
    const { currentEvent, similarShapes } = this.props;
    if (similarShapes.length) {
      return null;
    }
    return (
      <div className="form-row">
        <div className="form-wrapper">
          <label htmlFor="algorithm">Select Algorithm</label>
        </div>
        <div className="form-wrapper">
          <ul className="algorithms">
            <li>
              <input type="radio" name="algotitm" id="euclidian" disabled={currentEvent === null} />
              <label htmlFor="euclidian">
                <span />
                Euclidean
              </label>
            </li>
            <li>
              <input type="radio" name="algotitm" id="dtw" disabled={currentEvent === null} />
              <label htmlFor="dtw">
                <span />
                DTW
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  resetShapes() {
    const { setActiveEvent, toggleSimilarShapes, resetSimilarShapes } = this.props;
    resetSimilarShapes();
    toggleSimilarShapes(false);
    setActiveEvent(null);
  }

  shapeTagOverride() {
    const { overrideAllTags } = this.props;
    return (
      <div className="shape-form overwrite">
        <div className="form-row">
          <div className="form-wrapper ">
            <p>Override all segments tags</p>
            <p className="recent">5 most similar segments</p>
          </div>
          <div className="form-wrapper">
            <div className="shape-options">
              <Dropdown onChange={(tag) => overrideAllTags(tag.value)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSearchControls() {
    const { currentEvent, getSimilarShapes, similarShapes, isSimilarShapesLoading, isEditingEventRange } = this.props;
    const isSearchDisabled =
      currentEvent === null || (!similarShapes.length && isSimilarShapesLoading) || isEditingEventRange;
    if (currentEvent === null) {
      return shapesLanding();
    }

    if (similarShapes.length) {
      return this.shapeTagOverride();
    }

    return (
      <>
        <div className="submit">
          <ul>
            <li>
              <button className="clean" type="button" onClick={() => this.resetShapes()} disabled={isSearchDisabled}>
                CANCEL
              </button>
            </li>
            <li>
              <button
                className="clean trigger"
                type="button"
                onClick={() => getSimilarShapes()}
                disabled={isSearchDisabled}
              >
                SEARCH SIMILAR
              </button>
            </li>
          </ul>
        </div>
        <div className="clear" />
      </>
    );
  }

  renderShapeFormular() {
    const { currentEvent, isEditingEventRange, isSimilarShapesLoading } = this.props;
    const shapesDisabled = currentEvent === null || isEditingEventRange ? 'disabled' : '';

    return (
      <div className={`shapes-option ${shapesDisabled}`}>
        <div className="shape-container">
          <div className="shape-form">
            {this.renderEventData()}
            {this.renderShapeOptions()}
          </div>
          {this.renderSearchControls()}
          <div className="scroll-style">
            {isSimilarShapesLoading ? (
              shapesLoader()
            ) : (
              <div className="shapes-results scroll-style">{this.renderShapes()}</div>
            )}
          </div>
          {this.renderShapeFooter()}
        </div>
      </div>
    );
  }

  render() {
    return <div className="similar-shapes-wrapper">{this.renderShapeFormular()}</div>;
  }
}

export default connect(
  (state) => ({
    currentEvent: getCurrentEventDetails(state),
    similarShapes: getSimilarShapesCoords(state),
    dataRun: getDatarunDetails(state),
    isSimilarShapesLoading: getIsSimilarShapesLoading(state),
    isSimilarShapesActive: getIsSimilarShapesActive(state),
    isEditingEventRange: getIsEditingEventRange(state),
  }),
  (dispatch) => ({
    toggleSimilarShapes: (state) => dispatch(toggleSimilarShapesAction(state)),
    getSimilarShapes: () => dispatch(getSimilarShapesAction()),
    saveShapes: () => dispatch(saveSimilarShapesAction()),
    setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
    resetSimilarShapes: () => dispatch(resetSimilarShapesAction()),
    overrideAllTags: (tag) => dispatch(shapesTagsOverrideAction(tag)),
  }),
)(SimilarShapes);
