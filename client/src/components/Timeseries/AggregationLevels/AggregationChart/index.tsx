import React, { Component } from 'react';
import Loader from 'src/components/Common/Loader';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from 'src/model/types';
import { getDatarunDetails, getCurrentEventDetails } from 'src/model/selectors/datarun';
import { getAggregationTimeLevel } from 'src/model/selectors/aggregationLevels';
import { FocusChartConstants } from '../../FocusChart/Constants';
import { getAggregationChartCoords, timestampToDate } from './Utils';

const { MIN_VALUE, MAX_VALUE, TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

type State = {
  width: number;
  height: number;
  zoomValue: any;
};
type StateProps = ReturnType<typeof mapState>;

class AggregationChart extends Component<StateProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 450,
      zoomValue: 1,
    };
  }

  componentDidMount() {
    const { width } = getAggregationChartCoords();
    this.setState({
      width,
    });
  }

  componentDidUpdate() {
    this.renderChartAxis();
    const { width } = getAggregationChartCoords();
    if (this.state.width !== width) {
      this.setState(
        {
          width,
        },
        () => this.initZoom(),
      );
    }
  }

  parseDataInterval(data) {
    const { currentAggregationLevel } = this.props;

    let initialStartDate = data[0];
    let initialStopDate = new Date(initialStartDate[0] + currentAggregationLevel.timeInMiliseconds).getTime();
    let processedInterval = [initialStartDate];

    data.forEach((currentData) => {
      if (currentData[0] >= initialStopDate) {
        processedInterval.push(currentData);
        initialStopDate = new Date(currentData[0] + currentAggregationLevel.timeInMiliseconds).getTime();
      }
    });
    processedInterval.push(data[data.length - 1]);
    return processedInterval;
  }

  drawLine(data) {
    const { xCoord, yCoord } = this.getScale();
    const { zoomValue } = this.state;
    const xCoordCopy = xCoord.copy();
    const { start_time, stop_time } = this.props.currentEventDetails;
    const filteredData = data.filter((currentData) => currentData[0] >= start_time && currentData[0] <= stop_time);

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(this.parseDataInterval(filteredData));
  }

  getScale() {
    const { width, height } = this.state;
    const { dataRun, currentEventDetails } = this.props;
    const { start_time, stop_time } = currentEventDetails;
    const { maxTimeSeries } = dataRun;
    const [minTY, maxTY] = d3.extent(maxTimeSeries, (time: Array<number>) => time[1]);
    const drawableWidth = width - TRANSLATE_LEFT;
    const drawableHeight = height - 3.5 * CHART_MARGIN;
    const xCoord = d3.scaleTime().range([0, drawableWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const minX = Math.min(MIN_VALUE, start_time);
    const maxX = Math.max(MAX_VALUE, stop_time);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  initZoom() {
    const { width, height } = this.state;
    const zoomWidth = width - TRANSLATE_LEFT;

    const zoom = d3
      .zoom()
      .scaleExtent([1, zoomWidth])
      .translateExtent([
        [0, 0],
        [zoomWidth, height],
      ])
      .extent([
        [0, 0],
        [zoomWidth, height],
      ])
      .on('zoom', () => zoomHandler());

    d3.select('.aggregation-zoom').call(zoom);

    const zoomHandler = () => {
      let currentZoom = d3.event.transform;

      if (currentZoom === 1) {
        return;
      }
      this.setState({
        zoomValue: currentZoom,
      });
    };
  }

  drawChartData() {
    const { width, height } = this.state;
    const { timeSeries } = this.props.dataRun;

    return (
      width > 0 && (
        <g className="aggregation-focus" transform={`translate(${TRANSLATE_LEFT - 10}, ${CHART_MARGIN})`}>
          <defs>
            <clipPath id="aggregationClip">
              <rect width={width - TRANSLATE_LEFT} height={height} />
            </clipPath>
          </defs>
          <g className="aggregation-data" clipPath="url(#aggregationClip)">
            <path className="aggregation-wawes" d={this.drawLine(timeSeries)} />
            <rect className="aggregation-zoom" width={width} height={height} />
          </g>
          <g className="aggregation-axis">
            <g className="axis axis--x" transform={`translate(0, ${height - 3.5 * CHART_MARGIN})`} />
            <g className="axis axis--y" />
          </g>
        </g>
      )
    );
  }

  renderChartAxis() {
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const { zoomValue } = this.state;

    if (zoomValue !== 1) {
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    d3.select('.aggregation-axis .axis.axis--x').call(xAxis);
    d3.select('.aggregation-axis .axis.axis--y').call(yAxis).call(yAxis.ticks(5, ',f'));
  }

  renderEventDetails() {
    const { currentEventDetails } = this.props;
    const { start_time, stop_time, signal } = currentEventDetails;
    return (
      <div className="event-details">
        <ul>
          <li>
            <p>Start</p>
            <p>{timestampToDate(start_time)}</p>
          </li>
          <li>
            <p>Stop</p>
            <p>{timestampToDate(stop_time)}</p>
          </li>
          <li>
            <p>Dataset</p>
            <p>{signal}</p>
          </li>
          {/* Addiitonal info required */}
          {/* <li>
            <p>Experiment</p>
            <p>Will Follow Soon</p>
          </li> */}
        </ul>
      </div>
    );
  }

  render() {
    const { width, height } = this.state;
    return (
      width > 0 && (
        <Loader isLoading={width === 0}>
          {this.renderEventDetails()}
          <div className="aggregation-chart">
            <svg width={width} height={height} id="aggregationChart">
              {this.drawChartData()}
            </svg>
          </div>
        </Loader>
      )
    );
  }
}

const mapState = (state) => ({
  dataRun: getDatarunDetails(state),
  currentEventDetails: getCurrentEventDetails(state),
  currentAggregationLevel: getAggregationTimeLevel(state),
});

export default connect<StateProps, {}, {}, RootState>(mapState)(AggregationChart);
