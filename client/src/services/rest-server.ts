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
server.add('datasets');
/**
 * usage:
 *
 * return the db list
 * server.dbs.read()
 * Get  /dbs/
 */


server.datasets.add('dataruns');
/**
 * usage:
 *
 * return the signal list of a db
 * server.dbs.signals.read('dbName')
 * Get  /dbs/dbName/signals/
 *
 * return all the signal data
 * server.dbs.signals.read('dbName', 'sigName')
 * Get  /dbs/dbName/signals/sigName/
 *
 * return the signal date from start_time to end_time
 * server.dbs.signals.read('dbName', 'sigName', {},
 *      {'start': timestamp1, 'end': timestamp2})
 * Get  /dbs/dbName/signals/sigName/?start=timestamp1&end=timestamp2
 */

// server.dbs.signals.read('dbName', 'sigName', {'start': timestamp1}, {'end': timestamp2})



// step3: remember to modify the PipServer interface accordingly


export default server;
