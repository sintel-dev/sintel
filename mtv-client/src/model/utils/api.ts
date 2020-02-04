import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
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

export class RestClient {
  private server: AxiosInstance;
  // default config for http request
  private requestConfig: AxiosRequestConfig = {
    baseURL: 'http://127.0.0.1:3000/api/v1/',
    timeout: 2000,
  };

  public test: Resource<any, any>;
  public datasets: Resource<DatasetDataType, DatasetsResponse>;
  public dataruns: Resource<DatarunDataType, DatarunsResponse>;
  public experiments: Resource<ExperimentDataType, ExperimentsResponse>;
  public pipelines: Resource<PipelineDataType, PipelinesResponse>;
  public events: Resource<EventDataType, EventsResponse>;
  public comments: Resource<CommentDataType, CommentsResponse>;
  public data: Resource<any, DataResponse>;

  /**
   *
   * @param config AxiosRequestConfig
   */
  constructor(config: AxiosRequestConfig) {
    this.requestConfig = { ...this.requestConfig, ...config };
    this.server = axios.create(this.requestConfig);

    // add resources
    this.test = new Resource(this.server, 'test/');
    this.datasets = new Resource(this.server, 'datasets/');
    this.dataruns = new Resource(this.server, 'dataruns/');
    this.experiments = new Resource(this.server, 'experiments/');
    this.pipelines = new Resource(this.server, 'pipelines/');
    this.events = new Resource(this.server, 'events/');
    this.comments = new Resource(this.server, 'comments/');
    this.data = new Resource(this.server, 'data/');
  }
}

class Resource<T, R> {
  /**
   *
   * @param server AxiosInstance
   * @param url Recourse end point
   */
  constructor(private server: AxiosInstance, private url: string) {}

  /**
   * Get all items
   * @param data body data - in most cases, this should be {}
   * @param params URL parameters
   */
  public all(data = {}, params = {}): Promise<R> {
    const promise = this.server.get<R>(this.url, { data, params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Get one item
   * @param id the item ID (name) to be retrieved
   * @param data body data – in most cases, this should be {}
   * @param params URL parameters
   */
  public find(id, data = {}, params = {}): Promise<T> {
    const newUrl = this.url + `${id}/`;
    const promise = this.server.get<T>(newUrl, { data, params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Create an item.
   * @param data the item data to create
   * @param params URL parameters
   */
  public create(data = {}, params = {}): Promise<T> {
    const promise = this.server.post<T>(this.url, data, { params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Delete an item.
   * @param id the item ID (name) to delete
   * @returns Promise of the response's status
   */
  public delete(id): Promise<number> {
    const newUrl = this.url + `${id}/`;
    const promise = this.server.delete<number>(newUrl);
    return promise
      .then(res => {
        return res.status;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Update an item.
   * @param id the item ID (name) to update
   * @param data the updated data of this item
   * @param params URL parameters
   */
  public update(id, data = {}, params = {}): Promise<T> {
    const newUrl = this.url + `${id}/`;
    const promise = this.server.put<T>(newUrl, data, { params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Allow customize your request.
   * @param config request config
   * @param id item id
   */
  public request<Z>(config: AxiosRequestConfig = {}, id?: string): Promise<Z> {
    let newUrl = this.url;
    if (id !== undefined) {
      newUrl += `${id}/`;
    }
    const promise = this.server.get<Z>(newUrl, config);
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
}

export default new RestClient({
  baseURL: 'http://127.0.0.1:3000/api/v1/',
});
