"use strict";

const jsonrpc = require('../jsonrpc');

const requestObj = jsonrpc.request('123', 'update', {list: [1, 2, 3]});
const notificationObj = jsonrpc.notification('update', {list: [1, 2, 3]})
const successObj = jsonrpc.success('123', 'OK')
const errorObj = jsonrpc.error('123', new jsonrpc.JsonRpcError('some error', 99))
const parseObj = jsonrpc.parse('{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}')
const parseObjBatch = jsonrpc.parse(
    JSON.stringify([
        {'jsonrpc': '2.0', 'method': 'sum', 'params': [1, 2, 4], 'id': '1'},
        {'jsonrpc': '2.0', 'method': 'foo.get', 'params': {'name': 'myself'}},
        {'jsonrpc': '2.0', 'result': 19, 'id': '2'},
        {'jsonrpc': '2.0', 'error': {'code': -32600, 'message': 'Invalid Request'}, 'id': null},
      ])
)

console.log(requestObj)
console.log(notificationObj)
console.log(successObj)
console.log(errorObj)
console.log(parseObj)
console.log(parseObjBatch)

// RequestObject {
//     jsonrpc: '2.0',
//     id: '123',
//     method: 'update',
//     params: { list: [ 1, 2, 3 ] } }
//   NotificationObject {
//     jsonrpc: '2.0',
//     method: 'update',
//     params: { list: [ 1, 2, 3 ] } }
//   SuccessObject { jsonrpc: '2.0', id: '123', result: 'OK' }
//   ErrorObject {
//     jsonrpc: '2.0',
//     id: '123',
//     error: JsonRpcError { message: 'some error', code: 99 } }
//   JsonRpcParsed {
//     payload:
//      RequestObject { jsonrpc: '2.0', id: 1, method: 'subtract', params: [ 42, 23 ] },
//     type: 'request' }
// [ JsonRpcParsed {
//     payload:
//      RequestObject { jsonrpc: '2.0', id: '1', method: 'sum', params: [Array] },
//     type: 'request' },
//   JsonRpcParsed {
//     payload:
//      NotificationObject { jsonrpc: '2.0', method: 'foo.get', params: [Object] },
//     type: 'notification' },
//   JsonRpcParsed {
//     payload: SuccessObject { jsonrpc: '2.0', id: '2', result: 19 },
//     type: 'success' },
//   JsonRpcParsed {
//     payload:
//      ErrorObject { jsonrpc: '2.0', id: null, error: [JsonRpcError] },
//     type: 'error' } ]

