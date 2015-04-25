'use strict';
/*global describe, it, before, after, beforeEach, afterEach, Promise, noneFn*/

var assert = require('assert');
var jsonrpc = require('../jsonrpc');

describe('jsonrpc', function() {
  it('jsonrpc.request', function(done) {
    assert.throws(function() {
      jsonrpc.request(1.1, 'update');
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.request({}, 'update');
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.request(null, 'update');
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.request(1.1, 111);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.request(123, 'update', null);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.request(123, 'update', 'test');
    }, jsonrpc.JsonRpcError);

    assert.equal(JSON.stringify(jsonrpc.request(123, 'update')), '{"jsonrpc":"2.0","id":123,"method":"update"}');
    assert.deepEqual(jsonrpc.request(123, 'update'), {
      jsonrpc: '2.0',
      id: 123,
      method: 'update'
    });

    assert.deepEqual(jsonrpc.request('123', 'update', []), {
      jsonrpc: '2.0',
      id: '123',
      method: 'update',
      params: []
    });

    assert.deepEqual(jsonrpc.request('123', 'update', {list: []}), {
      jsonrpc: '2.0',
      id: '123',
      method: 'update',
      params: {list: []}
    });

    done();
  });

  it('jsonrpc.notification', function(done) {
    assert.throws(function() {
      jsonrpc.notification(1);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.notification('update', 'test');
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.notification('update', 0);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.notification(null, []);
    }, jsonrpc.JsonRpcError);

    assert.equal(JSON.stringify(jsonrpc.notification('update')), '{"jsonrpc":"2.0","method":"update"}');
    assert.deepEqual(jsonrpc.notification('update'), {
      jsonrpc: '2.0',
      method: 'update'
    });

    assert.deepEqual(jsonrpc.notification('update', []), {
      jsonrpc: '2.0',
      method: 'update',
      params: []
    });

    assert.deepEqual(jsonrpc.notification('update', {list: []}), {
      jsonrpc: '2.0',
      method: 'update',
      params: {list: []}
    });

    done();
  });

  it('jsonrpc.success', function(done) {
    assert.throws(function() {
      jsonrpc.success(1);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.success(123, void 0);
    }, jsonrpc.JsonRpcError);

    assert.equal(
      JSON.stringify(jsonrpc.success(123, null)),
      '{"jsonrpc":"2.0","id":123,"result":null}'
    );
    assert.deepEqual(jsonrpc.success('123', 'OK'), {
      jsonrpc: '2.0',
      id: '123',
      result: 'OK'
    });

    assert.deepEqual(jsonrpc.success(123, []), {
      jsonrpc: '2.0',
      id: 123,
      result: []
    });

    done();
  });

  it('jsonrpc.error', function(done) {
    assert.throws(function() {
      jsonrpc.error(1);
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.error(123, 'error');
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.error(123, new jsonrpc.JsonRpcError());
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.error(123, new jsonrpc.JsonRpcError(111, 111));
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.error(123, new jsonrpc.JsonRpcError('111', '111'));
    }, jsonrpc.JsonRpcError);

    assert.throws(function() {
      jsonrpc.error(123, new Error('test', 1));
    }, jsonrpc.JsonRpcError);

    assert.equal(
      JSON.stringify(jsonrpc.error(null, new jsonrpc.JsonRpcError('test', 1))),
      '{"jsonrpc":"2.0","id":null,"error":{"code":1,"message":"test"}}'
    );

    assert.deepEqual(jsonrpc.error(null, new jsonrpc.JsonRpcError('test', 1)), {
      jsonrpc: '2.0',
      id: null,
      error: {code: 1, message: 'test'}
    });

    assert.deepEqual(jsonrpc.error('123', new jsonrpc.JsonRpcError('test', 99, 'test error')), {
      jsonrpc: '2.0',
      id: '123',
      error: {code: 99, message: 'test', data: 'test error'}
    });

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.invalidRequest()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32600, message: 'Invalid request'}
    });

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.methodNotFound()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32601, message: 'Method not found'}
    });

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.invalidParams()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32602, message: 'Invalid params'}
    });

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.internalError()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32603, message: 'Internal error'}
    });

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.parseError()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32700, message: 'Parse error'}
    });

    done();
  });

  it('jsonrpc.parse', function(done) {
    var res = null;

    res = jsonrpc.parse(1);
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('1');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('{"id":');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32700);
    assert.equal(res.payload.message, 'Parse error');
    assert.equal(res.payload.data instanceof Error, true);

    res = jsonrpc.parse('{}');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('[]');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('{"id":123,"method":"update"}');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":123}');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32601, message: 'Method not found'});

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123}');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'});

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"123"}');
    assert.equal(res.type, 'notification');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      method: '123'
    });

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"update","params":null}');
    assert.equal(res.type, 'invalid');
    assert.deepEqual(res.payload, {code: -32602, message: 'Invalid params'});

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"update","params":[]}');
    assert.equal(res.type, 'notification');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      method: 'update',
      params: []
    });

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":null,"method":123}');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32603);
    assert.equal(res.payload.message, 'Internal error');
    assert.equal(typeof res.payload.data, 'string');

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":123}');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32601);
    assert.equal(res.payload.message, 'Method not found');

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":"update"}');
    assert.equal(res.type, 'request');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      method: 'update'
    });

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":"update","params":{}}');
    assert.equal(res.type, 'request');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      method: 'update',
      params: {}
    });

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"result":null}');
    assert.equal(res.type, 'success');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      result: null
    });

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":123}');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32603);
    assert.equal(res.payload.message, 'Internal error');

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":"123"}}');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32603);
    assert.equal(res.payload.message, 'Internal error');

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":"123","message":"test"}}');
    assert.equal(res.type, 'invalid');
    assert.equal(res.payload.code, -32603);
    assert.equal(res.payload.message, 'Internal error');

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":123,"message":"test"}}');
    assert.equal(res.type, 'error');
    assert.equal(res.payload instanceof jsonrpc.JsonRpc, true);
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      error: {code: 123, message: 'test'}
    });

    var requestObj = jsonrpc.request('123', 'update', {list: []});
    assert.deepEqual(jsonrpc.parse(JSON.stringify(requestObj)).payload, requestObj);

    var notificationObj = jsonrpc.notification('update', {list: []});
    assert.deepEqual(jsonrpc.parse(JSON.stringify(notificationObj)).payload, notificationObj);

    var successObj = jsonrpc.success('123', 'OK');
    assert.deepEqual(jsonrpc.parse(JSON.stringify(successObj)).payload, successObj);

    var errorObj = jsonrpc.error('123', jsonrpc.JsonRpcError.parseError());
    assert.deepEqual(jsonrpc.parse(JSON.stringify(errorObj)).payload, errorObj);

    var parsedBatch = jsonrpc.parse(JSON.stringify([requestObj, notificationObj, successObj, errorObj, {}]));

    assert.equal(parsedBatch[0].type, 'request');
    assert.deepEqual(parsedBatch[0].payload, requestObj);

    assert.equal(parsedBatch[1].type, 'notification');
    assert.deepEqual(parsedBatch[1].payload, notificationObj);

    assert.equal(parsedBatch[2].type, 'success');
    assert.deepEqual(parsedBatch[2].payload, successObj);

    assert.equal(parsedBatch[3].type, 'error');
    assert.deepEqual(parsedBatch[3].payload, errorObj);

    assert.equal(parsedBatch[4].type, 'invalid');
    assert.deepEqual(parsedBatch[4].payload, {code: -32600, message: 'Invalid request'});

    done();
  });
});
