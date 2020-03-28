import * as d3 from 'd3';
import { FocusChartConstants } from './Constants';
import { fromMonthToIndex, maxDaysInMonth, toTimestamp } from '../../../model/utils/Utils';

const { TRANSLATE_TOP, CHART_MARGIN, TRANSLATE_LEFT, MAX_VALUE, MIN_VALUE } = FocusChartConstants;

export const getWrapperSize = () => {
  const wrapperOffsetMargin = 40;
  const wrapperHeight = document.querySelector('#content-wrapper').clientHeight;
  const overViewHeight = document.querySelector('#overview-wrapper').clientHeight;
  const chartControlsHeight = document.querySelector('#chartControls').clientHeight + 20;
  const height = wrapperHeight - (overViewHeight + TRANSLATE_TOP + wrapperOffsetMargin + chartControlsHeight);
  const width = document.querySelector('.focus-chart').clientWidth;
  return { width, height };
};

export const getScale = (width, height, datarun) => {
  const [minTX, maxTX] = d3.extent(datarun, time => time[0]);
  const [minTY, maxTY] = d3.extent(datarun, time => time[1]);
  const drawableWidth = width - 2 * CHART_MARGIN - TRANSLATE_LEFT;
  const drawableHeight = height - 3.5 * CHART_MARGIN;

  const xCoord = d3.scaleTime().range([0, drawableWidth]);
  const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

  const minX = Math.min(MIN_VALUE, minTX);
  const maxX = Math.max(MAX_VALUE, maxTX);

  const minY = Math.min(MIN_VALUE, minTY);
  const maxY = Math.max(MAX_VALUE, maxTY);

  xCoord.domain([minX, maxX]);
  yCoord.domain([minY, maxY]);

  return { xCoord, yCoord };
};

export const drawLine = (data, periodRange, maxTimeSeries) => {
  const { width, height } = getWrapperSize();
  const { zoomValue } = periodRange;
  const { xCoord, yCoord } = getScale(width, height - 3, maxTimeSeries);
  const xCoordCopy = xCoord.copy();

  if (zoomValue !== 1) {
    xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
  }

  const line = d3
    .line()
    .x(d => xCoord(d[0]))
    .y(d => yCoord(d[1]));
  return line(data);
};

export const normalizeHanlers = chart => {
  const brushHandlers = d3.selectAll(`.${chart} rect.handle`);
  const overlay = d3.select(`.${chart} .selection`);

  if (overlay === undefined) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  const overlayWidth = overlay._groups[0][0] !== null && overlay.attr('width');
  if (overlayWidth === '0' || overlayWidth === null) {
    return;
  }

  const { height } = getWrapperSize();
  brushHandlers
    .attr('y', function() {
      return height / 2 - height / 6;
    })
    .attr('height', function() {
      return height / 4;
    })
    .attr('ry', 3);
};

export const getSelectedRange = (selectedPeriod, reviewRange, maxTimeSeries) => {
  let dateRangeStart = 0;
  let dateRangeStop = 0;

  if (selectedPeriod.year) {
    const { year } = selectedPeriod;
    dateRangeStart = toTimestamp(`01/01/${year} 00:00:00`);
    dateRangeStop = toTimestamp(`12/31/${year} 23:59:59`);
  }

  if (selectedPeriod.month !== '') {
    const { year, month } = selectedPeriod;
    const monthIndex = fromMonthToIndex(month);
    const maxMonthDays = maxDaysInMonth(year, monthIndex);

    dateRangeStart = toTimestamp(`${monthIndex}/01/${year} 00:00:00`);
    dateRangeStop = toTimestamp(`${monthIndex}/${maxMonthDays}/${year} 23:59:59`);
  }

  if (reviewRange === 'year') {
    dateRangeStart = maxTimeSeries[0][0] / 1000;
    dateRangeStop = maxTimeSeries[maxTimeSeries.length - 1][0] / 1000;
  }

  if (reviewRange === 'month') {
    const { year } = selectedPeriod;
    dateRangeStart = toTimestamp(`01/01/${year} 00:00:00`);
    dateRangeStop = toTimestamp(`12/31/${year} 23:59:59`);
  }

  return { dateRangeStart, dateRangeStop };
};
