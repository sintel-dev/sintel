import {Server, JQueryStaticExt} from './rest-server.interface';


let jqueryExt = $ as JQueryStaticExt;

// step1: initialize a RESTful client
let server: Server = new jqueryExt.RestClient(
    'http://127.0.0.1:3000/api/v1/',
    {
        cache: 120,                 // This will cache requests for 5 seconds
        cachableMethods: ['GET'],
        stringifyData: true         // true for "Content-Type = application/json"
    }
);


// step2: add your resources
server.add('dbs');
server.dbs.add('signals');


// step3: remember to modify the PipServer interface accordingly


export default server;
