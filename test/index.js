'use strict'

var assert = require('assert')
var tman = require('tman')
var jsonrpc = require('../jsonrpc')

tman.suite('jsonrpc', function () {
  tman.it('jsonrpc.request', function () {
    assert.throws(function () {
      jsonrpc.request(1.1, 'update')
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.request({}, 'update')
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.request(null, 'update')
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.request(1.1, 111)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.request(123, 'update', null)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.request(123, 'update', 'test')
    }, jsonrpc.JsonRpcError)

    assert.strictEqual(JSON.stringify(jsonrpc.request(123, 'update')), '{"jsonrpc":"2.0","id":123,"method":"update"}')
    assert.strictEqual(jsonrpc.request(123, 'update') instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(jsonrpc.request(123, 'update').name, 'request')
    assert.deepEqual(jsonrpc.request(123, 'update'), {
      jsonrpc: '2.0',
      id: 123,
      method: 'update'
    })

    assert.deepEqual(jsonrpc.request('123', 'update', []), {
      jsonrpc: '2.0',
      id: '123',
      method: 'update',
      params: []
    })

    assert.deepEqual(jsonrpc.request('123', 'update', {list: []}), {
      jsonrpc: '2.0',
      id: '123',
      method: 'update',
      params: {list: []}
    })
  })

  tman.it('jsonrpc.notification', function () {
    assert.throws(function () {
      jsonrpc.notification(1)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.notification('update', 'test')
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.notification('update', 0)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.notification(null, [])
    }, jsonrpc.JsonRpcError)

    assert.strictEqual(JSON.stringify(jsonrpc.notification('update')), '{"jsonrpc":"2.0","method":"update"}')
    assert.strictEqual(jsonrpc.notification('update') instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(jsonrpc.notification('update').name, 'notification')
    assert.deepEqual(jsonrpc.notification('update'), {
      jsonrpc: '2.0',
      method: 'update'
    })

    assert.deepEqual(jsonrpc.notification('update', []), {
      jsonrpc: '2.0',
      method: 'update',
      params: []
    })

    assert.deepEqual(jsonrpc.notification('update', {list: []}), {
      jsonrpc: '2.0',
      method: 'update',
      params: {list: []}
    })
  })

  tman.it('jsonrpc.success', function () {
    assert.throws(function () {
      jsonrpc.success(1)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.success(123, void 0)
    }, jsonrpc.JsonRpcError)

    assert.strictEqual(JSON.stringify(jsonrpc.success(123, null)), '{"jsonrpc":"2.0","id":123,"result":null}')
    assert.strictEqual(jsonrpc.success('123', 'OK') instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(jsonrpc.success('123', 'OK').name, 'success')
    assert.deepEqual(jsonrpc.success('123', 'OK'), {
      jsonrpc: '2.0',
      id: '123',
      result: 'OK'
    })

    assert.deepEqual(jsonrpc.success(123, []), {
      jsonrpc: '2.0',
      id: 123,
      result: []
    })
  })

  tman.it('jsonrpc.error', function () {
    assert.throws(function () {
      jsonrpc.error(1)
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.error(123, 'error')
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.error(123, new jsonrpc.JsonRpcError())
    }, jsonrpc.JsonRpcError)

    assert.throws(function () {
      jsonrpc.error(123, new Error('test', 1))
    }, jsonrpc.JsonRpcError)

    assert.strictEqual(JSON.stringify(jsonrpc.error(null, new jsonrpc.JsonRpcError('test', 1))), '{"jsonrpc":"2.0","id":null,"error":{"message":"test","code":1}}')
    assert.strictEqual(jsonrpc.error('123', new jsonrpc.JsonRpcError('test', 1)) instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(jsonrpc.error('123', new jsonrpc.JsonRpcError('test', 1)).name, 'error')

    assert.deepEqual(jsonrpc.error(null, new jsonrpc.JsonRpcError('test', 1)), {
      jsonrpc: '2.0',
      id: null,
      error: {code: 1, message: 'test'}
    })

    assert.deepEqual(jsonrpc.error('123', new jsonrpc.JsonRpcError('test', 99, 'test error')), {
      jsonrpc: '2.0',
      id: '123',
      error: {code: 99, message: 'test', data: 'test error'}
    })

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.invalidRequest()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32600, message: 'Invalid request'}
    })

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.methodNotFound()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32601, message: 'Method not found'}
    })

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.invalidParams()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32602, message: 'Invalid params'}
    })

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.internalError()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32603, message: 'Internal error'}
    })

    assert.deepEqual(jsonrpc.error(123, jsonrpc.JsonRpcError.parseError()), {
      jsonrpc: '2.0',
      id: 123,
      error: {code: -32700, message: 'Parse error'}
    })
  })

  tman.it('jsonrpc.parse', function () {
    var res = null

    res = jsonrpc.parse(1)
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('1')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('{"id":')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32700)
    assert.strictEqual(res.payload.message, 'Parse error')
    assert.strictEqual(res.payload.data instanceof Error, true)

    res = jsonrpc.parse('{}')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('[]')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('{"id":123,"method":"update"}')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":123}')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32601, message: 'Method not found'})

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123}')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32600, message: 'Invalid request'})

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"123"}')
    assert.strictEqual(res.type, 'notification')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(res.payload.name, 'notification')
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      method: '123'
    })

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"update","params":null}')
    assert.strictEqual(res.type, 'invalid')
    assert.deepEqual(res.payload, {code: -32602, message: 'Invalid params'})

    res = jsonrpc.parse('{"jsonrpc":"2.0","method":"update","params":[]}')
    assert.strictEqual(res.type, 'notification')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      method: 'update',
      params: []
    })

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":null,"method":123}')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32603)
    assert.strictEqual(res.payload.message, 'Internal error')
    assert.strictEqual(typeof res.payload.data, 'string')

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":123}')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32601)
    assert.strictEqual(res.payload.message, 'Method not found')

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":"update"}')
    assert.strictEqual(res.type, 'request')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(res.payload.name, 'request')
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      method: 'update'
    })

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"method":"update","params":{}}')
    assert.strictEqual(res.type, 'request')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(res.payload.name, 'request')
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      method: 'update',
      params: {}
    })

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"result":null}')
    assert.strictEqual(res.type, 'success')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(res.payload.name, 'success')
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      result: null
    })

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":123}')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32603)
    assert.strictEqual(res.payload.message, 'Internal error')

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":"123"}}')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32603)
    assert.strictEqual(res.payload.message, 'Internal error')

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":"123","message":"test"}}')
    assert.strictEqual(res.type, 'invalid')
    assert.strictEqual(res.payload.code, -32603)
    assert.strictEqual(res.payload.message, 'Internal error')

    res = jsonrpc.parse('{"jsonrpc":"2.0","id":123,"error":{"code":123,"message":"test"}}')
    assert.strictEqual(res.type, 'error')
    assert.strictEqual(res.payload instanceof jsonrpc.JsonRpc, true)
    assert.strictEqual(res.payload.name, 'error')
    assert.deepEqual(res.payload, {
      jsonrpc: '2.0',
      id: 123,
      error: {code: 123, message: 'test'}
    })

    var requestObj = jsonrpc.request('123', 'update', {list: []})
    assert.deepEqual(jsonrpc.parse(JSON.stringify(requestObj)).payload, requestObj)

    var notificationObj = jsonrpc.notification('update', {list: []})
    assert.deepEqual(jsonrpc.parse(JSON.stringify(notificationObj)).payload, notificationObj)

    var successObj = jsonrpc.success('123', 'OK')
    assert.deepEqual(jsonrpc.parse(JSON.stringify(successObj)).payload, successObj)

    var errorObj = jsonrpc.error('123', jsonrpc.JsonRpcError.parseError())
    assert.deepEqual(jsonrpc.parse(JSON.stringify(errorObj)).payload, errorObj)

    var parsedBatch = jsonrpc.parse(JSON.stringify([requestObj, notificationObj, successObj, errorObj, {}]))

    assert.strictEqual(parsedBatch[0].type, 'request')
    assert.deepEqual(parsedBatch[0].payload, requestObj)

    assert.strictEqual(parsedBatch[1].type, 'notification')
    assert.deepEqual(parsedBatch[1].payload, notificationObj)

    assert.strictEqual(parsedBatch[2].type, 'success')
    assert.deepEqual(parsedBatch[2].payload, successObj)

    assert.strictEqual(parsedBatch[3].type, 'error')
    assert.deepEqual(parsedBatch[3].payload, errorObj)

    assert.strictEqual(parsedBatch[4].type, 'invalid')
    assert.deepEqual(parsedBatch[4].payload, {code: -32600, message: 'Invalid request'})
  })
})
