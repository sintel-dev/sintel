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
    datarun: string;
    start_time: number;
    stop_time: number;
    score: number;
    id: string;
}

/****** restful api *****/

interface Response {
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
     * @param string GET/POST/UPDATE/DEL
     * @param options config options
     *
     * @returns null
     */
    (name: string, method: string, options?: Object): void;
}

interface Resource {
    add: AddResource;
    addVerb: AddVerb;
    read(id1?: any, ...rest: any[]): Response;     // GET
    create(id1?: any, ...rest: any[]): Response;   // POST
    update(id1?: any, ...rest: any[]): Response;   // UPDATE
    del(id1?: any, ...rest: any[]): Response;      // DEL
}

interface Verb {
    (id1?: any, ...rest: any[]): Response;
}

/***************** add your interface here******************/

interface Datasets extends Resource {
    // sub-resources
    dataruns: Resource;

    // verbs
    // foo: Verb;
}

export interface Server {
    add: AddResource;
    // resource list
    datasets: Datasets;
    pipelines: Resource;
    events: Resource;
    comments: Resource;
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
