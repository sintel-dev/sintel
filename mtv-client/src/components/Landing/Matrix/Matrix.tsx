import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { RootState, ExperimentDataType } from '../../../model/types';
import { fromIDtoTag, getTagColor } from '../utils';
import { TagStats, Scale } from './types';
import './Matrix.scss';
import { getMatrixSize } from './MatrixUtils';

// @TODO - gather `tagStats` from selectors/experiment
// import { getProcessedMatrixData } from '../../../model/selectors/experiment'; - later use

type ownProps = {
  experiment: ExperimentDataType;
  tagStats: TagStats;
  scale: Scale;
};
type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = ownProps & StateProps & DispatchProps;
interface LocalState {
  width: number;
  height: number;
}

export class Matrix extends Component<Props, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    const { width, height } = getMatrixSize();

    this.setState({
      width: Math.max(width, this.option.width),
      height: Math.max(height, this.option.height),
    });
  }

  private option = {
    height: 160, // min height
    width: 180, // min width
    margin: {
      top: 10,
      right: 5,
      bottom: 5,
      left: 2,
    },
    matrixHeight: 100,
    matrixWidth: 120,
  };

  private drawScore(scale, dataruns) {
    const self = this;
    const currentMaxScore = Math.min(6, scale.maxScore);
    let width = self.option.matrixWidth;
    let height = self.option.height - self.option.matrixHeight;
    let bins = new Array(10).fill(0);
    let binNum = bins.length;
    let interval = -1;
    interval = currentMaxScore / binNum;
    let maxCount = 0;
    let outerMaxNum = 0;

    let fx = d3.scaleLinear().range([0, width]);
    let fy = d3.scaleLinear().range([0, height - 16]);

    let area = d3
      .area()
      .x((d) => d[0])
      .y0(0)
      .y1((d) => d[1])
      .curve(d3.curveCardinal);

    dataruns.forEach((currentDatarun) => {
      const { events } = currentDatarun;

      events.forEach((currentEvent) => {
        if (currentEvent.score > currentMaxScore) {
          outerMaxNum += 1;
        } else {
          let idx = Math.trunc(currentEvent.score / interval);
          if (idx === currentEvent.score / interval) {
            idx -= 1;
          }
          bins[idx] += 1;
          maxCount = maxCount < bins[idx] ? bins[idx] : maxCount;
        }
      });
    });

    fx.domain([0, binNum]);
    fy.domain([0, maxCount]);

    let points = _.map(_.range(binNum), (i) => [fx(i + 0.5), -fy(bins[i])]) as [number, number][];
    points.unshift([0, 0]);
    points.push([fx(binNum), -fy(outerMaxNum)]);

    return (
      <g>
        <g transform={`translate(${self.option.width - width}, ${height - 16})`}>
          <path className="area" d={area(points)} />
          <text transform="translate(-10, 12)" className="axis-text" textAnchor="text-anchor">
            0
          </text>
          <text transform={`translate(${width - 20}, 12)`} className="axis-text" textAnchor="text-anchor">
            {currentMaxScore}
          </text>
        </g>
      </g>
    );
  }

  private drawAreaChart(scale) {
    const self = this;
    let width = self.option.matrixWidth;
    let symbol = d3.symbol().size(36);
    let cellWidth = self.option.width - self.option.matrixWidth;
    let cellHeight = self.option.matrixHeight;

    let tScore = false;
    const { experiment } = this.props;
    const { dataruns } = experiment;

    dataruns.forEach((currentDatarun) => {
      const { events } = currentDatarun;

      events.forEach((currentEvent) => {
        if (currentEvent.score > 0) {
          tScore = true;
        }
      });
    });

    return (
      <g>
        <g transform={`translate(${cellWidth}, ${self.option.height - cellHeight})`}>
          <line className="sep-line" x1="0" y1="-14" x2={width} y2="-14" />
          <g transform="translate(4, -8)">
            <path d={symbol.type(d3.symbolTriangle)()} fill="#616365" />
          </g>
          <g transform={`translate(${width - 6}, -8)`}>
            <path d={symbol.type(d3.symbolTriangle)()} fill="#616365" />
          </g>
        </g>
        {tScore && this.drawScore(scale, dataruns)}
      </g>
    );
  }

  private drawCell(cellData, index, scale) {
    const self = this;
    const width = self.option.matrixWidth;
    const rowNum = 6;
    const color = d3.scaleLinear<any>().range(['#A3A4A5', '#43434E']).domain([0, scale.maxEventNum]);

    const fx = d3
      .scaleBand()
      .range([0, width])
      .domain(_.map(d3.range(rowNum), (d) => String(d)))
      .padding(0.1);

    const size = fx.bandwidth();

    return (
      <rect
        className="cell"
        width={size}
        height={size}
        fill={color(cellData[1])}
        x={fx(String(index % rowNum))}
        y={(size + fx.paddingInner() * 1.2) * Math.trunc(index / rowNum)}
        key={Math.random()}
      >
        <title>{`Signal: ${cellData[0]}\nEvents: ${cellData[1]}`}</title>
      </rect>
    );
  }

  private drawMatrix(tagStats, scale) {
    const self = this;
    scale.maxScore = Math.ceil(scale.maxScore);
    let sortedTagStats = _.sortBy(_.toPairs(tagStats), (tag) => +tag[0]);
    let cellWidth = self.option.width - self.option.matrixWidth;
    let cellHeight = self.option.matrixHeight;

    const rh = 7;
    const rm = 3;

    sortedTagStats.push(sortedTagStats[0]);
    sortedTagStats.shift();

    const fx = d3
      .scaleBand()
      .domain(_.map(sortedTagStats, (d) => d[0]))
      .rangeRound([0, cellHeight])
      .paddingInner(0.1);

    const fy = d3
      .scaleLinear()
      .range([0, cellWidth - rh - rm])
      .domain([0, scale.maxTagNum]);

    const curve = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis);

    const drawBarPath = (tag) => {
      if (tag[1] === 0) {
        return null;
      }

      const [x0, y0, x1, y1] = [-fy(tag[1]) + 1 - rm, fx(tag[0]), -fy(tag[1]) + 1 - rm, fx(tag[0]) + fx.bandwidth()];
      const [xm0, ym0, xm1, ym1] = [x0 - rh, y0, x1 - rh, y1];

      const path = curve([
        [x0, y0],
        [xm0, ym0],
        [xm1, ym1],
        [x1, y1],
      ]);
      return path;
    };

    const cells: [string, number][] = _.chain(self.props.experiment.dataruns)

      .map((d) => [d.signal, d.events.length])
      .sortBy((d) => d[0])
      .value() as [string, number][];

    return (
      <g transform={`translate(${self.option.margin.left}, ${self.option.margin.top})`}>
        <g transform={`translate(${cellWidth}, ${self.option.height - cellHeight})`}>
          {sortedTagStats.map((currentTag: Array<any>) => (
            <g key={Math.random()}>
              <rect
                className="bar"
                x={-fy(currentTag[1]) - rm}
                y={fx(currentTag[0])}
                width={fy(currentTag[1])}
                height={fx.bandwidth()}
                fill={getTagColor(fromIDtoTag(currentTag[0]))}
              >
                <title>
                  {fromIDtoTag(currentTag[0])}: {currentTag[1]}
                </title>
              </rect>
              {drawBarPath(currentTag) && (
                <path className="bar-hat" d={drawBarPath(currentTag)} fill={getTagColor(fromIDtoTag(currentTag[0]))} />
              )}
            </g>
          ))}
          <line className="sep-line" x1={0} y1={0} x2={0} y2={cellHeight} />
        </g>
        <g transform={`translate(${cellWidth}, ${self.option.height - cellHeight})`}>
          {cells && cells.map((cell, index) => this.drawCell(cell, index, scale))}
        </g>
        {this.drawAreaChart(scale)}
      </g>
    );
  }

  render() {
    const { width, height } = this.state;
    const { tagStats, scale } = this.props;

    return (
      <div data-eid={this.props.experiment.id} className="matrix">
        <svg width={width} height={height} className="matrix-svg">
          {this.drawMatrix(tagStats, scale)}
        </svg>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({});

const mapDispatch = (dispatch: Function) => ({});

export default connect<StateProps, DispatchProps, ownProps, RootState>(mapState, mapDispatch)(Matrix);
