// **Github:** https://github.com/teambition/jsonrpc-lite
//
// http://www.jsonrpc.org/specification
// **License:** MIT

/* global module, define */
;(function(root, factory) {
  'use strict';

  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else root.jsonrpc = factory();
}(typeof window === 'object' ? window : this, function() {
  'use strict';

  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  var jsonrpc = {
    JsonRpc: JsonRpc,
    JsonRpcError: JsonRpcError
  };

  /**
   * Creates a JSON-RPC 2.0 request object
   *
   * @param  {String|Integer} id
   * @param  {String} method
   * @param  {Object|Array} [params]: optional
   * @return {Object} JsonRpc object
   * @api public
   */
  jsonrpc.request = function(id, method, params) {
    var err = validateMessage('request', {id: id, method: method, params: params});
    if (err) throw err;
    return requestObject(id, method, params);
  };

  /**
   * Creates a JSON-RPC 2.0 notification object
   *
   * @param  {String} method
   * @param  {Object|Array} [params]: optional
   * @return {Object} JsonRpc object
   * @api public
   */
  jsonrpc.notification = function(method, params) {
    var err = validateMessage('notification', {method: method, params: params});
    if (err) throw err;
    return notificationObject(method, params);
  };

  /**
   * Creates a JSON-RPC 2.0 success response object
   *
   * @param  {String|Integer} id
   * @param  {Mixed} result
   * @return {Object} JsonRpc object
   * @api public
   */
  jsonrpc.success = function(id, result) {
    var err = validateMessage('success', {id: id, result: result});
    if (err) throw err;
    return successObject(id, result);
  };

  /**
   * Creates a JSON-RPC 2.0 error response object
   *
   * @param  {String|Integer} id
   * @param  {Object} JsonRpcError error
   * @return {Object} JsonRpc object
   * @api public
   */
  jsonrpc.error = function(id, error) {
    var err = validateMessage('error', {id: id, error: error});
    if (err) throw err;
    return errorObject(id, error);
  };

  /**
   * Takes a JSON-RPC 2.0 payload (string) and tries to parse it into a JSON.
   * If successful, determine what object is it (response, notification,
   * success, error, or invalid), and return it's type and properly formatted object.
   *
   * @param  {String} msg
   * @return {Object|Array} an array, or an object of this format:
   *
   *  {
   *    type: <Enum, 'request'|'notification'|'success'|'error'|'invalid'>
   *    payload: <JsonRpc|JsonRpcError>
   *  }
   *
   * @api public
   */
  jsonrpc.parse = function (message) {
    try {
      message = JSON.parse(message);
    } catch (err) {
      throw JsonRpcError.parseError(err);
    }
    if (!isArray(message)) return parseObject(message);
    for (var i = 0, len = message.length; i < len; i++)
      message[i] = parseObject(message[i]);

    return message;
  };

  /**
   * JsonRpc Class
   *
   * @return {Object} JsonRpc object
   * @api public
   */
  function JsonRpc() {
    this.jsonrpc = '2.0';
  }

  JsonRpc.VERSION = '2.0';
  JsonRpc.prototype.serialize = JsonRpc.prototype.toString = function() {
    return JSON.stringify(this);
  };

  /**
   * JsonRpcError Class
   *
   * @param  {String} message
   * @param  {Integer} code: optional
   * @return {String} name: optional
   * @api public
   */
  function JsonRpcError(message, code, data) {
    this.code = code;
    this.message = message;
    if (data != null) this.data = data;
  }

  inherits(JsonRpcError, Error);
  JsonRpcError.prototype.name = 'JsonRpcError';

  JsonRpcError.invalidRequest = function(data) {
    return new JsonRpcError('Invalid request', -32600, data);
  };

  JsonRpcError.methodNotFound = function(data) {
    return new JsonRpcError('Method not found', -32601, data);
  };

  JsonRpcError.invalidParams = function(data) {
    return new JsonRpcError('Invalid params', -32602, data);
  };

  JsonRpcError.internalError = function(data) {
    return new JsonRpcError('Internal error', -32603, data);
  };

  JsonRpcError.parseError = function(data) {
    return new JsonRpcError('Parse error', -32700, data);
  };

  /**
   * @api private
   */
  function requestObject(id, method, params) {
    var message = new JsonRpc();
    message.id = id;
    message.method = method;
    if (params) message.params = params;
    return message;
  }

  /**
   * @api private
   */
  function notificationObject(method, params) {
    var message = new JsonRpc();
    message.method = method;
    if (params) message.params = params;
    return message;
  }

  /**
   * @api private
   */
  function successObject(id, result) {
    var message = new JsonRpc();
    message.id = id;
    message.result = result;
    return message;
  }

  /**
   * @api private
   */
  function errorObject(id, error) {
    var message = new JsonRpc();
    message.id = id;
    message.error = error;
    return message;
  }

  /**
   * @api private
   */
  function parseObject(obj) {
    var error = null;
    var res = {type: 'invalid'};

    if (obj.jsonrpc !== JsonRpc.VERSION) {
      error = JsonRpcError.internalError();

    } else if (!hasOwnProperty.call(obj, 'id')) {
      error = validateMessage('notification', obj);
      if (!error) {
        res.type = 'notification';
        res.payload = notificationObject(obj.method, obj.params);
      }
    } else if (hasOwnProperty.call(obj, 'method')) {
      error = validateMessage('request', obj);
      if (!error) {
        res.type = 'request';
        res.payload = requestObject(obj.id, obj.method, obj.params);
      }
    } else if (hasOwnProperty.call(obj, 'result')) {
      error = validateMessage('success', obj);
      if (!error) {
        res.type = 'success';
        res.payload = successObject(obj.id, obj.result);
      }
    } else if (hasOwnProperty.call(obj, 'error')) {
      if (!obj.error) {
        error = JsonRpcError.internalError();
      } else {
        obj.error = new JsonRpcError(obj.error.message, obj.error.code, obj.error.data);
        error = validateMessage('error', obj);
      }

      if (!error) {
        res.type = 'error';
        res.payload = errorObject(obj.id, obj.error);
      }
    } else error = JsonRpcError.internalError();

    if (error) res.payload = error;
    return res;
  }

  // if error, return error, else return null
  function validateMessage(type, data) {
    switch (type) {
      case 'request':
        return checkId(data.id) || checkMethod(data.method) || checkParams(data.params);

      case 'notification':
        return checkMethod(data.method) || checkParams(data.params);

      case 'success':
        return checkId(data.id) || checkResult(data.result);

      case 'error':
        return checkId(data.id) || checkError(data.error);
    }
    return JsonRpcError.internalError();
  }

  function checkId(id) {
    return (isNull(id) || isString(id) || isInteger(id)) ? null :
      JsonRpcError.internalError('"id" must be provided. It must be either a string or an integer.');
  }

  function checkMethod(method) {
    return isString(method) ? null : JsonRpcError.methodNotFound();
  }

  function checkResult(result) {
    return result === void 0 ? JsonRpcError.internalError('Result must exist for success Response objects') : null;
  }

  function checkParams(params) {
    if (isNull(params)) return null;
    if (isArray(params) || isObject(params)) {
      // ensure params can be stringify.
      try {
        JSON.stringify(params);
        return null;
      } catch (e) {
        return JsonRpcError.parseError(e.message);
      }
    }
    return JsonRpcError.invalidParams();
  }

  function checkError(error) {
    if (!(error instanceof JsonRpcError))
      return JsonRpcError.internalError('Error must be an instance of JsonRpcError.');

    if (!isInteger(error.code))
      return JsonRpcError.internalError('Invalid error code. It must be an integer.');

    if (!isString(error.message))
      return JsonRpcError.internalError('Message must exist or must be a string.');

    return null;
  }

  function isNull(obj) {
    return obj === null;
  }

  function isString(obj) {
    return obj && typeof obj === 'string';
  }

  function isInteger(obj) {
    return typeof obj === 'number' && (obj % 1 === 0);
  }

  function isObject(obj) {
    return obj && typeof obj === 'object' && !isArray(obj);
  }

  function inherits(Child, Parent) {
    function Ctor() {
      this.constructor = Child;
    }

    Ctor.prototype = Parent.prototype;
    Child.prototype = new Ctor();
    return Child;
  }

  return jsonrpc;
}));
