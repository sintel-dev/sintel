import { DatarunDataType } from './datarun';
import { DatasetDataType } from './dataset';
import { ExperimentDataType } from './experiment';
import { PipelineDataType } from './pipeline';
import { EventDataType } from './event';
import { CommentDataType } from './comment';

export type DatarunsResponse = {
  dataruns: DatarunDataType[];
};

export type ExperimentsResponse = {
  experiments: ExperimentDataType[];
};

export type DatasetsResponse = {
  datasets: DatarunDataType[];
};

export type PipelinesResponse = {
  pipelines: PipelineDataType[];
};

export type CommentsResponse = {
  comments: CommentDataType[];
};

export type EventsResponse = {
  events: EventDataType[];
};

export type DataResponse = {
  datasets: DatasetDataType[];
  dataruns: DatarunDataType[];
  events: Array<EventDataType[]>;
  predictions: Array<{
    names: string[];
    data: Array<number[]>;
    offset: number;
  }>;
  raws: Array<{
    year: number;
    data: Array<Array<{ means: number[]; counts: number[] }>>;
  }>;
};
