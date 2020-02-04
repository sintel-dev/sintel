type Dict<T> = {
  [index: string]: T;
};

/**
 * The data fetched from server with RESTAPI
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
