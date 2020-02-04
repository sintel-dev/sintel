import * as d3 from 'd3';
import { FocusChartConstants } from './Constants';

const { CHART_MARGIN, TRANSLATE_LEFT, MAX_VALUE, MIN_VALUE } = FocusChartConstants;

const { TRANSLATE_TOP } = FocusChartConstants;
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
