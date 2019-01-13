import {Server, JQueryStaticExt} from './pip-server.interface';
import * as $rest from 'jquery.rest';



$rest;
let jquery = $ as JQueryStaticExt;


// step1: initialize a RESTful client
let server: Server = new jquery.RestClient(
    'http://127.0.0.1:3001/api/v1/',
    {
        cache: 120,                 // This will cache requests for 5 seconds
        cachableMethods: ['GET'],
        stringifyData: true         // true for "Content-Type = application/json"
    }
);



// step2: construct your APIs below
server.add('test');
server.test.add('nest1');
server.test.add('nest2');
server.test.addVerb('action1', 'POST');
server.test.addVerb('action2', 'POST');


// step3: remember to modify the PipServer interface accordingly

export default server;

