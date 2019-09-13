import {Server, JQueryStaticExt} from './rest-server.interface';
import {server as sv} from '../config';

let jqueryExt = $ as JQueryStaticExt;

let server: Server = new jqueryExt.RestClient(
    `${sv}/api/v1/`,
    {
        cache: 5,                 // This will cache requests for 5 seconds
        cachableMethods: ['GET'],
        stringifyData: true,      // true for "Content-Type = application/json"
        request: function(resource, options) {
            // customize your request here
            return $.ajax(options);
        }
    }
);

server.add('datasets');

server.add('dataruns');

server.add('pipelines');

server.add('events');

server.add('comments');

server.add('data');

server.add('experiments');


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
