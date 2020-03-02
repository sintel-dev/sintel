import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import Resource from './restResource';
import {
  DatasetDataType,
  DatasetsResponse,
  DatarunDataType,
  DatarunsResponse,
  ExperimentDataType,
  ExperimentsResponse,
  PipelinesResponse,
  EventsResponse,
  CommentsResponse,
  DataResponse,
} from '../types/index';
import { PipelineDataType } from '../types/pipeline';
import { EventDataType } from '../types/event';
import { CommentDataType } from '../types/comment';
import g from './g';
import * as _ from 'lodash';

export class RestClient {
  private server: AxiosInstance;

  // default config for http request
  private requestConfig: AxiosRequestConfig = {
    baseURL: 'http://127.0.0.1:3000/api/v1/',
    // timeout: 2000,
  };

  public test: Resource<any, any>;
  public datasets: Resource<DatasetDataType, DatasetsResponse>;
  public dataruns: Resource<DatarunDataType, DatarunsResponse>;
  public experiments: Resource<ExperimentDataType, ExperimentsResponse>;
  public pipelines: Resource<PipelineDataType, PipelinesResponse>;
  public events: Resource<EventDataType, EventsResponse>;
  public comments: Resource<CommentDataType, CommentsResponse>;
  public data: Resource<any, DataResponse>;

  private resourceList = ['test', 'datasets', 'dataruns', 'experiments', 'pipelines', 'events', 'comments', 'data'];
  /**
   *
   * @param config AxiosRequestConfig
   */
  constructor(config: AxiosRequestConfig) {
    this.requestConfig = { ...this.requestConfig, ...config };
    this.server = axios.create(this.requestConfig);

    this.server.defaults.headers.common['Authorization'] = 'AUTH_TOKEN';
    // add resources
    _.each(this.resourceList, rname => {
      this[rname] = new Resource(this.server, `${rname}/`);
    });
  }

  public authorize(uid: string, token: string) {
    this.server.defaults.headers.common['Authorization'] = token;
    g.auth = { uid, token };
  }
}

export default new RestClient({
  baseURL: 'http://127.0.0.1:3000/api/v1/',
});
