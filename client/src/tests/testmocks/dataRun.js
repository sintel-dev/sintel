import { timeSeries } from './timeSeries';
import { datarunEvents } from './datarunEvents';
import { maxTimeSeries } from './dataRunMaxTimeSeries';
import { timeseriesPredictions } from './timeSeriesPredictions';

export const dataRun = {
  id: '5da80105abc56689357439e6',
  experiment: '5da80104abc56689357439e5',
  signal: 'S-1',
  start_time: '2019-10-17T05:49:57.076000',
  end_time: '2019-10-17T05:57:53.668000',
  status: 'done',
  events: datarunEvents,
  timeSeries,
  eventWindows: [
    [0, 100, 0.06778753037169406, '5da802e1abc5668935743a04', null],
    [10, 150, 0.1063191879375398, '5da802e1abc5668935743a05', null],
    [15, 400, 0.12700117335524264, '5da802e1abc5668935743a06', null],
    [20, 120, 0.17587530027941106, '5da802e1abc5668935743a07', null],
    [50, 500, 0.34263584276549913, '5da802e1abc5668935743a08', null],
    [150, 200, 0.4277890585414085, '5da802e1abc5668935743a09', null],
  ],
  maxTimeSeries,
  timeseriesPred: timeseriesPredictions,
};
