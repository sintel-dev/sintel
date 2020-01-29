export const FocusChartConstants = {
  MIN_VALUE: Number.MAX_SAFE_INTEGER,
  MAX_VALUE: Number.MIN_SAFE_INTEGER,
  CHART_WIDTH: 0,
  CHART_HEIGHT: 0,
  TRANSLATE_TOP: 90,
  TRANSLATE_LEFT: 38,
  DRAW_EVENTS_TIMEOUT: 400,
  CHART_MARGIN: 10,
};

export const colorSchemes = {
  tag: [
    '#FFCD00', // investigate
    '#7CA8FF', // do not investigate
    '#A042FF', // postpone
    '#F64242', // problem
    '#F5FF00', // previously seen
    '#45F642', // normal
    '#C7C7C7', // untagged
  ],
};
