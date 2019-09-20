import { Server, JQueryStaticExt } from './server.itf';
import { server as host } from '../config';

let jqueryExt = $ as JQueryStaticExt;

let server: Server = new jqueryExt.RestClient(
  `${host}/api/v1/`,
  {
    cache: 5,                 // Cache requests for 5 seconds
    cachableMethods: ['GET'],
    stringifyData: true,      // True for passing all POST data through JSON.stringify
  }
);

server.add('datasets');

server.add('dataruns');

server.add('experiments');

server.add('pipelines');

server.add('events');

server.add('comments');

server.add('data');

server.add('test');


/**
 * usage examples:
 *
 * server.test.read<dataType>(id)
 * GET  /test/:id/
 *
 * server.test.del<dataType>(id)
 * DELETE  /test/:id/
 *
 * server.test.update<dataType>(id, {data: 1})
 * PUT  /test/:id/
 * Request includes body "{data: 1}"
 *
 * server.test.create<dataType>(id, {data: 1}, {data: 1})
 * POST  /test/:id/?data=1
 * Request includes body "{data: 1}"
 */

export default server;
