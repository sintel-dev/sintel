export const FETCH_PIPELINES = 'FETCH_PIPELINES';
export const SELECT_PIPELINE = 'SELECT_PIPELINE';

export type FetchPipelinesAction = {
  type: typeof FETCH_PIPELINES;
  promise: Promise<PipelinesResponse>;
  result?: PipelinesResponse; // only exist when promise gets resolved
  error?: string; // only exist when promise gets rejected
};

export type SelectPipelineAction = {
  type: typeof SELECT_PIPELINE;
  selectedPipelineName: string;
};

/**
 * Pipeline State format
 */
export type PipelinesState = {
  isPipelinesLoading: boolean;
  pipelineList: PipelineDataType[];
  selectedPipelineName: string;
};

// Will be extended by PipelineDataType
interface Dict<T> {
  [index: string]: T;
}

/**
 * The single pipeline item fetched from server with RESTAPI
 * API: find | delete | create | update
 */
export type PipelineDataType = {
  id: string;
  insert_time: string;
  name: string;
  created_by: string;
  mlpipeline: {
    primitives: string[];
    init_params: Dict<Dict<any>>;
    output_params: Dict<Dict<any>>;
    outputs: Dict<{ name: string; variable: string }[]>;
  };
};

/**
 * The array of pipeline items fetched from server with RESTAPI
 * API: all
 */
export type PipelinesResponse = {
  pipelines: PipelineDataType[];
};
