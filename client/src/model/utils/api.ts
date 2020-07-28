import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { API_URL, SESSION_TOKEN } from './constants';
// import { SESSION_TOKEN } from '@nx-react/session';

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

export class RestClient {
    private server: AxiosInstance;

    // default config for http request
    private requestConfig: AxiosRequestConfig = {
        baseURL: API_URL,
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
        this.server.interceptors.request.use(this.requestInterceptor);
        this.server.interceptors.response.use(this.responseSuccessInterceptor, this.responseFailInterceptor);
    }

    public requestInterceptor(config) {
        const authHeader = Cookies.get(SESSION_TOKEN);
        if (!authHeader) {
            return config;
        }

        return {
            ...config,
            headers: {
                ...config.headers,
                Authorization: authHeader,
            },
        };
    }

    public responseSuccessInterceptor(response) {
        return response;
    }

    public responseFailInterceptor(error) {
        if (error.response.status === 401) {
            window.location.href = '/logout';
        }

        return Promise.reject(error);
    }
}

export default new RestClient({
    baseURL: 'http://127.0.0.1:3000/api/v1/',
});
