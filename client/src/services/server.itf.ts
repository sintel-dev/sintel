/****** Restful Server Definition *****/
// https://github.com/jpillora/jquery.rest

interface Options {
  url?: string;  // ''
  cache?: number;  // 0
  isSingle?: boolean;  // false
  autoClearCache?: boolean;  // false
  cachableMethods?: string[];  // ['GET']
  methodOverride?: boolean;  // false
  stringifyData?: boolean; // false
  stripTrailingSlash?: boolean;  // false
  username?: string; // null
  password?: string; // null
  verbs?: Object;  // {'create': 'POST', 'read': 'GET', 'update': 'PUT', 'del': 'DELETE'}
  ajax?: JQueryAjaxSettings;
  request?: <T>(resource, options) => JQueryDeferred<T>;
}

interface AddResource {
  /**
   * Add a resource.
   * @param name Resource name
   * @param [options] Config options
   *
   * @returns Return a resource
   */
  (name: string, options?: Options): Resource;
}

interface AddVerb {
  /**
   * Add a Verb
   * @param name Resource name
   * @param method GET/POST/PUT/DEL
   * @param [options] Config options
   *
   * @returns null
   */
  (name: string, method: string, options?: Options): Verb;
}

interface Resource {
  add: AddResource;
  addVerb: AddVerb;
  read<T>(id1?: any, ...rest: any[]): JQueryDeferred<T>;     // GET
  create<T>(id1?: any, ...rest: any[]): JQueryDeferred<T>;   // POST
  update<T>(id1?: any, ...rest: any[]): JQueryDeferred<T>;   // PUT
  del<T>(id1?: any, ...rest: any[]): JQueryDeferred<T>;      // DEL
}

interface Verb {
  <T>(id1?: any, ...rest: any[]): JQueryDeferred<T>;
}

export interface Server {
  add: AddResource;
  datasets: Resource;
  dataruns: Resource;
  pipelines: Resource;
  events: Resource;
  comments: Resource;
  data: Resource;
  stations: Resource;
  experiments: Resource;
  test: Resource;
}

export interface JQueryStaticExt extends JQueryStatic {
  RestClient: new (url: string, options?: Options) => Server;
}



/****** Resource Data Types (DT) ******/

type Dict<T> = {
  [index: string]: T;
};

export type Pipeline = {
  id: string;
  insert_time: string;
  name: string;
  created_by: string;
  mlpipeline: {
    primitives: string[];
    init_params: Dict<Dict<any>>;
    output_params: Dict<Dict<any>>;
    outputs: Dict<{name: string, variable: string}[]>;
  };
};

export type Comment = {
  id: string;
  text: string;
  created_by: string;
  insert_time: string;
  event?: string;
};

export type Datarun = {
  id: string;
  signal: string;
  experiment: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  events?: Event[];
  prediction?: {
    names: string[],
    data: number[][]
  };
  raw?: {
    year: number,
    timestamp: number,
    data: {means: number[], counts: number[]}[][]
  }[];
};

export type Dataset = {
  id: string;
  insert_time: string;
  name: string;
  entity_id?: string;
};

export type Event = {
  id: string;
  score: number;
  tag: string;
  start_time: number;
  stop_time: number;
  insert_time?: string;
  datarun?: string;
  comments?: Comment[];
};

export type Experiment = {
  id: string;
  project: string;
  dataset: string;
  date_creation: string;
  created_by: string;
  pipeline: string;
  dataruns: Datarun[];
};

export type Signal = {
  id: string;
  insert_time: string;
  name: string;
  dataset: string;
  start_time: number;
  stop_time: number;
  created_by: string;
};

export interface Data {
  datasets: Dataset[];
  dataruns: Datarun[];
  events: Array<Event[]>;
  predictions: Array<{
    names: string[],
    data: Array<number[]>,
    offset: number
  }>;
  raws: Array<{
    year: number,
    data: Array<Array<{ means: number[], counts: number[] }>>
  }>;
}
