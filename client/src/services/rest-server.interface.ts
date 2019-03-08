interface Response {
    done(data: any, textStatus?: any, xhrObject?: any): any;
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
