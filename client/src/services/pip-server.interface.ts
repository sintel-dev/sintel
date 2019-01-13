interface Response {
    done(data: any, textStatus?: any, xhrObject?: any): any;
}

interface Resource {
    read(id1?: any, ...rest: any[]): Response;     // GET
    create(id1?: any, ...rest: any[]): Response;   // POST
    update(id1?: any, ...rest: any[]): Response;   // UPDATE
    del(id1?: any, ...rest: any[]): Response;      // DEL
}

interface Verb {
    (id1?: any, ...rest: any[]): Response;
}

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


interface Test extends Resource{
    add: AddResource;
    addVerb: AddVerb;

    // nested resource list
    nest1: Resource;
    nest2: Resource;

    // verb list
    action1: Verb;
    action2: Verb;
}


export interface Server {
    add: AddResource;

    // resource list
    test: Test;
}


export interface JQueryStaticExt extends JQueryStatic {
    RestClient: any;
    // RestClient: new (url: string, options?: Object) => Server;
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