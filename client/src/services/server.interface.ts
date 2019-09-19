/****** define the document format returned by server *****/

export interface Dataset {
  id: string;
  insert_time: string;
  name: string;
  signal_set: string;
  start_time: number;
  stop_time: number;
  created_by: string;
}

export interface Datarun {
  id: string;
  insert_time: string;
  start_time: string;
  end_time: string;
  dataset: string;
  status: string;
  created_by: string;
  events: number;
  pipeline: string;
  html?: string;
}

export interface Pipeline {
  insert_time: string;
  name: string;
  mlpipeline: {
    primitives: any;
    init_params: any;
    output_names: any;
  };
  created_by: string;
}

export interface Event {
  insert_time?: string;
  dataset?: string;
  offset?: number;
  datarun: string;
  start_time: number;
  stop_time: number;
  score: number;
  id: string;
}

export interface Comment {
  insert_time?: string;
  created_by?: string;
  text: string;
  event: string;
  id: string;
}

export interface Station {
  name: string;
  Lat: number;
  Lng: number;
}

export interface Experiment {
  id: string;
  name: string;
  model_num: number;
  event_num: number;
  project: string;
  pipeline: Pipeline;
  start_time: string;
  end_time: string;
  created_by: string;
}

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

/****** restful api *****/

export interface Response {
  done<T>(data: T, textStatus?: any, xhrObject?: any): any;
}

// textStatus values:
// ['timeout', 'error', 'notmodified', 'success', 'parseerror']

interface AddResource {
  /**
   * add a resource
   * @param string resource name
   * @param Object config options
   *
   * @returns null
   */
  (name: string, options?: Object): void;
}

interface AddVerb {
  /**
   * add a Verb
   * @param string resource name
   * @param string GET/POST/PUT/DEL
   * @param options config options
   *
   * @returns null
   */
  (name: string, method: string, options?: Object): void;
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
  (id1?: any, ...rest: any[]): Response;
}

/***************** add your interface here******************/

// interface Datasets extends Resource {
//     // sub-resources
//     dataruns: Resource;

//     // verbs
//     // foo: Verb;
// }

export interface Server {
  add: AddResource;
  // resource list
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
  RestClient: new (url: string, options?: Object) => Server;
}


/** examples to interact with recourse
 * server.test.read();              GET /api/v1/test/
 * server.test.read(42);            GET /api/v1/test/42/
 * server.test.read('forty-two');   GET /api/v1/test/forty-two/
 *
 * Retrieve resutls:
 * let request = server.test.read();
 * request.done(function (data, textStatus, xhrObject) {});
 * or
 * server.test.read().done(function (data, textStatus, xhrObject) {});
 *
 * Nest Recourse:
 * server.test.add('foo');
 * server.test.foo.read('param1', 'param2');    GET /api/v1/test/param1/foo/param2/
 *
 *
 *
 * Add Verb:
 * server.test.addVerb('run', 'GET', { stringifyData: false });
 * server.test.run(data);
 *
 * For more:
 * https://github.com/jpillora/jquery.rest
 *
 */
