import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleSimilarShapesModalAction, getSimilarShapesAction } from 'src/model/actions/similarShapes';
import { getDatarunDetails, getCurrentEventDetails } from 'src/model/selectors/datarun';
import * as d3 from 'd3';
import Loader from 'src/components/Common/Loader';
import { RootState } from '../../../../../model/types';
import Dropdown from '../../../../Common/Dropdown';
import {
  getIsSimilarShapesModalOpen,
  getIsSimilarShapesLoading,
  getSimilarShapesFound,
} from '../../../../../model/selectors/similarShapes';
import { CloseIcon } from '../../../../Common/icons';
import './SimilarShapes.scss';
import { timestampToDate } from '../../../AggregationLevels/AggregationChart/Utils';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = StateProps & DispatchProps;

class SimilarShapes extends Component<Props, {}> {
  componentDidMount() {
    if (!this.props.isModalOpen) {
      return;
    }

    this.props.getSimilarShapes();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentEvent.id !== this.props.currentEvent.id) {
      this.props.getSimilarShapes();
    }
  }

  getScale(data) {
    const MIN_VALUE = Number.MAX_SAFE_INTEGER;
    const MAX_VALUE = Number.MIN_SAFE_INTEGER;
    const width = 210;
    const height = 122;
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    const [minTX, maxTX] = d3.extent(data, (time: Array<number>) => time[0]);
    const [minTY, maxTY] = d3.extent(data, (time: Array<number>) => time[1]);

    const minX = Math.min(MIN_VALUE, minTX);
    const maxX = Math.max(MAX_VALUE, maxTX);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  onTagSelect(tag) {
    // Yet to be implemented
    return tag;
  }

  drawLine(data) {
    const { xCoord, yCoord } = this.getScale(data);
    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(data);
  }

  renderShapeDetails(shape) {
    const { timeSeries } = this.props.dataRun;
    const { start, end } = shape;
    const startTime = start * 1000;
    const stopTime = end * 1000;
    const startIndex = timeSeries.findIndex((element) => startTime - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex((element) => stopTime - element[0] < 0);
    const event = timeSeries.slice(startIndex, stopIndex);

    return (
      <div className="shape-details" key={startTime}>
        <div className="info">
          <ul>
            <li>
              <span>Start:</span>
              {timestampToDate(startTime)}
            </li>
            <li>
              <span>Ends:</span>
              {timestampToDate(stopTime)}
            </li>
            <li>
              <span>Similarity:</span>
              <span>88%</span>
            </li>
            <li>
              <Dropdown onChange={(tag) => this.onTagSelect(tag)} />
            </li>
          </ul>
        </div>
        <div className="drawing">
          <svg width="210" height="122" className="shape-chart">
            <path d={this.drawLine(event)} />
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { isModalOpen, toggleSimilarShapesModal, isSimilarShapesLoading, similarShapes } = this.props;
    const isActive = isModalOpen ? 'active' : '';
    return (
      isModalOpen && (
        <div className={`similar-shapes ${isActive}`}>
          <button type="button" onClick={() => toggleSimilarShapesModal(false)} className="close">
            <CloseIcon />
          </button>
          <h3>Similar Segments List</h3>
          <ul className="select-controls">
            <li>Override segments tags:</li>
            <li>
              <Dropdown onChange={(tag) => this.onTagSelect(tag)} />
            </li>
          </ul>
          <div className="results scroll-style">
            <Loader isLoading={isSimilarShapesLoading}>
              {similarShapes.length && similarShapes.map((shape) => this.renderShapeDetails(shape))}
            </Loader>
          </div>
        </div>
      )
    );
  }
}

const mapState = (state: RootState) => ({
  isModalOpen: getIsSimilarShapesModalOpen(state),
  isSimilarShapesLoading: getIsSimilarShapesLoading(state),
  similarShapes: getSimilarShapesFound(state),
  dataRun: getDatarunDetails(state),
  currentEvent: getCurrentEventDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  toggleSimilarShapesModal: (modalState) => dispatch(toggleSimilarShapesModalAction(modalState)),
  getSimilarShapes: () => dispatch(getSimilarShapesAction()),
});

export default connect<StateProps, DispatchProps, RootState>(mapState, mapDispatch)(SimilarShapes);
