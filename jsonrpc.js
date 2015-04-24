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

  var slice = Array.prototype.slice;
  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  function isString(obj) {
    return obj && typeof obj === 'string';
  }

  function isInteger(obj) {
    return typeof obj === 'number' && (obj % 1 === 0);
  }

  function isObject(obj) {
    return obj && typeof obj === 'object' && !isArray(obj);
  }

  function isNull(obj) {
    return obj == null;
  }

  function inherits(Child, Parent) {
    function Ctor() {
      this.constructor = Child;
    }

    Ctor.prototype = Parent.prototype;
    Child.prototype = new Ctor();
    Child.__super__ = Parent.prototype;
    return Child;
  }

  var jsonrpc = {JsonRpc: JsonRpc};

  function JsonRpc() {
    this.jsonrpc = '2.0';
  }
  JsonRpc.VERSION = '2.0';
  JsonRpc.prototype.serialize = JsonRpc.prototype.toString = function() {
    return JSON.stringify(this);
  };

  /**
   * Creates a JSON-RPC 2.0 serialized
   *
   * @param  {String} id
   * @param  {String} method
   * @param  {Object|Array} params
   * @return {Object} JsonRpc object
   */
   jsonrpc.request = function(id, method, params) {
    validateMessage('request', {id: id, method: method, params: params});

    var message = new JsonRpc();
    message.id = id;
    message.method = method;
    if (params) message.params = params;
    return message;
  };

  /**
   * Creates a JSON-RPC 2.0 serialized notification:
   *
   * @param  {String} method
   * @param  {Object|Array} params
   * @return {Object} JsonRpc object
   */
  jsonrpc.notification = function(method, params) {
    validateMessage('notification', {method: method, params: params});

    var message = new JsonRpc();
    message.method = method;
    if (params) message.params = params;
    return message;
  };

  /**
   * Creates a JSON-RPC 2.0 serialized success response
   *
   * @param  {String} id
   * @param  {Mixed} result
   * @return {Object} JsonRpc object
   */
  jsonrpc.success = function(id, result) {
    validateMessage('success', {id: id, result: result});

    var message = new JsonRpc();
    message.id = id;
    message.result = result;
    return message;
  };

  /**
   * Creates a JSON-RPC 2.0 serialized error response
   *
   * @param  {String} id
   * @param  {Mixed} error
   * @return {Object} JsonRpc object
   */
  jsonrpc.error = function(id, error) {
    validateMessage('error', {id: id, error: error});

    var message = new JsonRpc();
    message.id = id;
    message.error = error.toJSON;
    return message;
  };

  /**
   * Takes a JSON-RPC 2.0 payload (string) and tries to parse it into a JSON.
   * If successful, determine what object is it (response, notification,
   * success, or invalid), and return its type and properly formatted object.
   *
   * @param  {String} msg
   * @return {Object} an object of this format:
   *
   *  {
   *    type: <Enum, request|notification|success|error>
   *    payload: <Object>
   *  }
   */
  jsonrpc.parse = function(message) {
    try {
      message = JSON.parse(message);
    } catch (err) {
      throw ParseError(err);
    }
    if (!isArray(message)) return parseMessage(message);
    for (var i = 0, len = message.length; i < len; i++)
      message[i] = parseMessage(message[i]);

    return message;
  };


  function parseMessage(message) {
    var error;
    var res = {type: 'invalid', payload: message};

    if (message.jsonrpc !== JsonRpc.VERSION) {
      error = new InternalError();

    } else if (!hasOwnProperty.call(message, 'id')) {
      error = validateMessage('notification', message);
      if (!error) res.type = 'notification';

    } else if (hasOwnProperty.call(message, 'method')) {
      error = validateMessage('request', message);
      if (!error) res.type = 'request';

    } else if (hasOwnProperty.call(message, 'result')) {
      error = validateMessage('success', message);
      if (!error) res.type = 'success';

    } else if (hasOwnProperty.call(message, 'error')) {
      error = validateMessage('error', message);
      if (!error) res.type = 'error';

    } else error = new InternalError();

    if (!error) res.payload = error;
    return res;
  }

  inherits(JsonRpcError, Error);
  inherits(ParseError, JsonRpcError);
  inherits(InternalError, JsonRpcError);
  inherits(InvalidParamsError, JsonRpcError);
  inherits(InvalidRequestError, JsonRpcError);
  inherits(MethodNotFoundError, JsonRpcError);

  jsonrpc.err = {
    ParseError: ParseError,
    JsonRpcError: JsonRpcError,
    InternalError: InternalError,
    InvalidParamsError: InvalidParamsError,
    InvalidRequestError: InvalidRequestError,
    MethodNotFoundError: MethodNotFoundError
  };

  function JsonRpcError(message, code) {
    this.name = 'JsonRpcError';
    this.code = code;
    this.message = message;
  }

  JsonRpcError.prototype.toJSON = function() {
    return {code: this.code, message: this.message};
  };

  function ParseError(message) {
    this.name = 'ParseError';
    this.code = -32700;
    this.message = message || 'Invalid JSON was received by the server.';
  }

  function InternalError(message) {
    this.name = 'InternalError';
    this.code = -32603;
    this.message = message || 'Internal JSON-RPC error';
  }

  function InvalidParamsError(message) {
    this.name = 'InvalidParamsError';
    this.code = -32602;
    this.message = message || 'Invalid method parameter(s)';
  }

  function InvalidRequestError(message) {
    this.name = 'InvalidRequestError';
    this.code = -32600;
    this.message = message || 'The JSON sent is not a valid Request object.';
  }

  function MethodNotFoundError(message) {
    this.name = 'MethodNotFoundError';
    this.code = -32601;
    this.message = message || 'The method does not exist / is not available.';
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
    return new InternalError();
  }

  function checkId(id) {
    var check = id === null || isString(id) || isInteger(id);
    return check === true ? null : new InternalError('"id" must be provided. It must be either a string or an integer.');
  }

  function checkMethod(method) {
    return isString(method) ? null : new MethodNotFoundError();
  }

  function checkParams(params) {
    if (isNull(params)) return null;
    if (isArray(params) || isObject(params)) {
      // ensure params can be stringify.
      try {
        JSON.stringify(params);
        return null;
      } catch (e) {
        return new ParseError(e.message);
      }
    }
    return new InvalidParamsError();
  }

  function checkResult(result) {
    return isNull(result) ? new InternalError('Result must exist for success Response objects') : null;
  }

  function checkError(error) {
    if (!(error instanceof JsonRpcError))
      return new JsonRpcError('Error must be an instance of JsonRpcError, or any derivatives of it');

    if (!isInteger(error.code))
      return new JsonRpcError('Invalid error code. It must be an integer.');

    if (!isString(error.message))
      return new JsonRpcError('Message must exist or must be a string.');

    return null;
  }

  return jsonrpc;

}));
