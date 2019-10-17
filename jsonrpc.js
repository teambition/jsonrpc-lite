var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    // **Github:** https://github.com/teambition/jsonrpc-lite
    //
    // http://www.jsonrpc.org/specification
    // **License:** MIT
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var isInteger = typeof Number.isSafeInteger === 'function'
        ? Number.isSafeInteger // ECMAScript 2015
        : function (num) {
            return typeof num === 'number' && isFinite(num) && num === Math.floor(num) && Math.abs(num) <= 9007199254740991;
        };
    var JsonRpc = /** @class */ (function () {
        function JsonRpc() {
            this.jsonrpc = '2.0';
        }
        JsonRpc.prototype.serialize = function () {
            return JSON.stringify(this);
        };
        JsonRpc.VERSION = '2.0';
        return JsonRpc;
    }());
    exports.JsonRpc = JsonRpc;
    var RequestObject = /** @class */ (function (_super) {
        __extends(RequestObject, _super);
        function RequestObject(id, method, params) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.method = method;
            if (params !== undefined) {
                _this.params = params;
            }
            return _this;
        }
        return RequestObject;
    }(JsonRpc));
    exports.RequestObject = RequestObject;
    var NotificationObject = /** @class */ (function (_super) {
        __extends(NotificationObject, _super);
        function NotificationObject(method, params) {
            var _this = _super.call(this) || this;
            _this.method = method;
            if (params !== undefined) {
                _this.params = params;
            }
            return _this;
        }
        return NotificationObject;
    }(JsonRpc));
    exports.NotificationObject = NotificationObject;
    var SuccessObject = /** @class */ (function (_super) {
        __extends(SuccessObject, _super);
        function SuccessObject(id, result) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.result = result;
            return _this;
        }
        return SuccessObject;
    }(JsonRpc));
    exports.SuccessObject = SuccessObject;
    var ErrorObject = /** @class */ (function (_super) {
        __extends(ErrorObject, _super);
        // tslint:disable-next-line:no-shadowed-variable
        function ErrorObject(id, error) {
            var _this = _super.call(this) || this;
            _this.id = id;
            _this.error = error;
            _this.id = id;
            _this.error = error;
            return _this;
        }
        return ErrorObject;
    }(JsonRpc));
    exports.ErrorObject = ErrorObject;
    var JsonRpcParsed = /** @class */ (function () {
        function JsonRpcParsed(payload, type) {
            this.payload = payload;
            this.type = type;
            this.payload = payload;
            this.type = type;
        }
        return JsonRpcParsed;
    }());
    exports.JsonRpcParsed = JsonRpcParsed;
    /**
     * JsonRpcError Class
     *
     * @param  {String} message
     * @param  {Integer} code
     * @return {String} name: optional
     * @api public
     */
    var JsonRpcError = /** @class */ (function () {
        function JsonRpcError(message, code, data) {
            this.message = message;
            this.code = isInteger(code) ? code : 0;
            if (data != null) {
                this.data = data;
            }
        }
        JsonRpcError.invalidRequest = function (data) {
            return new JsonRpcError('Invalid request', -32600, data);
        };
        JsonRpcError.methodNotFound = function (data) {
            return new JsonRpcError('Method not found', -32601, data);
        };
        JsonRpcError.invalidParams = function (data) {
            return new JsonRpcError('Invalid params', -32602, data);
        };
        JsonRpcError.internalError = function (data) {
            return new JsonRpcError('Internal error', -32603, data);
        };
        JsonRpcError.parseError = function (data) {
            return new JsonRpcError('Parse error', -32700, data);
        };
        return JsonRpcError;
    }());
    exports.JsonRpcError = JsonRpcError;
    /**
     * Creates a JSON-RPC 2.0 request object
     *
     * @param  {String|Integer} id
     * @param  {String} method
     * @param  {Object|Array} [params]: optional
     * @return {Object} JsonRpc object
     * @api public
     */
    function request(id, method, params) {
        var object = new RequestObject(id, method, params);
        validateMessage(object, true);
        return object;
    }
    exports.request = request;
    /**
     * Creates a JSON-RPC 2.0 notification object
     *
     * @param  {String} method
     * @param  {Object|Array} [params]: optional
     * @return {Object} JsonRpc object
     * @api public
     */
    function notification(method, params) {
        var object = new NotificationObject(method, params);
        validateMessage(object, true);
        return object;
    }
    exports.notification = notification;
    /**
     * Creates a JSON-RPC 2.0 success response object
     *
     * @param  {String|Integer} id
     * @param  {Mixed} result
     * @return {Object} JsonRpc object
     * @api public
     */
    function success(id, result) {
        var object = new SuccessObject(id, result);
        validateMessage(object, true);
        return object;
    }
    exports.success = success;
    /**
     * Creates a JSON-RPC 2.0 error response object
     *
     * @param  {String|Integer} id
     * @param  {Object} JsonRpcError error
     * @return {Object} JsonRpc object
     * @api public
     */
    function error(id, err) {
        var object = new ErrorObject(id, err);
        validateMessage(object, true);
        return object;
    }
    exports.error = error;
    function parse(message) {
        if (!isString(message)) {
            return new JsonRpcParsed(JsonRpcError.invalidRequest(message), "invalid" /* invalid */);
        }
        var jsonrpcObj;
        try {
            jsonrpcObj = JSON.parse(message);
        }
        catch (err) {
            return new JsonRpcParsed(JsonRpcError.parseError(message), "invalid" /* invalid */);
        }
        return parseJsonRpcObject(jsonrpcObj);
    }
    exports.parse = parse;
    /**
     * Takes a JSON-RPC 2.0 payload (Object) or batch (Object[]) and tries to parse it.
     * If successful, determine what objects are inside (response, notification,
     * success, error, or invalid), and return their types and properly formatted objects.
     *
     * @param  {Object|Array} jsonrpcObj
     * @return {Object|Array} a single object or an array of `JsonRpcParsed` objects with `type` and `payload`:
     *
     *  {
     *    type: <Enum, 'request'|'notification'|'success'|'error'|'invalid'>
     *    payload: <JsonRpc|JsonRpcError>
     *  }
     *
     * @api public
     */
    function parseJsonRpcObject(jsonrpcObj) {
        if (!Array.isArray(jsonrpcObj)) {
            return parseObject(jsonrpcObj);
        }
        if (jsonrpcObj.length === 0) {
            return new JsonRpcParsed(JsonRpcError.invalidRequest(jsonrpcObj), "invalid" /* invalid */);
        }
        var parsedObjectArray = [];
        for (var i = 0, len = jsonrpcObj.length; i < len; i++) {
            parsedObjectArray[i] = parseObject(jsonrpcObj[i]);
        }
        return parsedObjectArray;
    }
    exports.parseJsonRpcObject = parseJsonRpcObject;
    /**
     * Alias for `parse` method.
     * Takes a JSON-RPC 2.0 payload (String) and tries to parse it into a JSON.
     * @api public
     */
    exports.parseJsonRpcString = parse;
    /**
     * Takes a JSON-RPC 2.0 payload (Object) and tries to parse it into a JSON.
     * If successful, determine what object is it (response, notification,
     * success, error, or invalid), and return it's type and properly formatted object.
     *
     * @param  {Object} obj
     * @return {Object} an `JsonRpcParsed` object with `type` and `payload`:
     *
     *  {
     *    type: <Enum, 'request'|'notification'|'success'|'error'|'invalid'>
     *    payload: <JsonRpc|JsonRpcError>
     *  }
     *
     * @api public
     */
    function parseObject(obj) {
        var err = null;
        var payload = null;
        var payloadType = "invalid" /* invalid */;
        if (obj == null || obj.jsonrpc !== JsonRpc.VERSION) {
            err = JsonRpcError.invalidRequest(obj);
            payloadType = "invalid" /* invalid */;
        }
        else if (!hasOwnProperty.call(obj, 'id')) {
            var tmp = obj;
            payload = new NotificationObject(tmp.method, tmp.params);
            err = validateMessage(payload);
            payloadType = "notification" /* notification */;
        }
        else if (hasOwnProperty.call(obj, 'method')) {
            var tmp = obj;
            payload = new RequestObject(tmp.id, tmp.method, tmp.params);
            err = validateMessage(payload);
            payloadType = "request" /* request */;
        }
        else if (hasOwnProperty.call(obj, 'result')) {
            var tmp = obj;
            payload = new SuccessObject(tmp.id, tmp.result);
            err = validateMessage(payload);
            payloadType = "success" /* success */;
        }
        else if (hasOwnProperty.call(obj, 'error')) {
            var tmp = obj;
            payloadType = "error" /* error */;
            if (tmp.error == null) {
                err = JsonRpcError.internalError(tmp);
            }
            else {
                var errorObj = new JsonRpcError(tmp.error.message, tmp.error.code, tmp.error.data);
                if (errorObj.message !== tmp.error.message || errorObj.code !== tmp.error.code) {
                    err = JsonRpcError.internalError(tmp);
                }
                else {
                    payload = new ErrorObject(tmp.id, errorObj);
                    err = validateMessage(payload);
                }
            }
        }
        if (err == null && payload != null) {
            return new JsonRpcParsed(payload, payloadType);
        }
        return new JsonRpcParsed(err != null ? err : JsonRpcError.invalidRequest(obj), "invalid" /* invalid */);
    }
    exports.parseObject = parseObject;
    // if error, return error, else return null
    function validateMessage(obj, throwIt) {
        var err = null;
        if (obj instanceof RequestObject) {
            err = checkId(obj.id);
            if (err == null) {
                err = checkMethod(obj.method);
            }
            if (err == null) {
                err = checkParams(obj.params);
            }
        }
        else if (obj instanceof NotificationObject) {
            err = checkMethod(obj.method);
            if (err == null) {
                err = checkParams(obj.params);
            }
        }
        else if (obj instanceof SuccessObject) {
            err = checkId(obj.id);
            if (err == null) {
                err = checkResult(obj.result);
            }
        }
        else if (obj instanceof ErrorObject) {
            err = checkId(obj.id, true);
            if (err == null) {
                err = checkError(obj.error);
            }
        }
        if (throwIt && err != null) {
            throw err;
        }
        return err;
    }
    function checkId(id, maybeNull) {
        if (maybeNull && id === null) {
            return null;
        }
        return isString(id) || isInteger(id)
            ? null
            : JsonRpcError.internalError('"id" must be provided, a string or an integer.');
    }
    function checkMethod(method) {
        return isString(method) ? null : JsonRpcError.invalidRequest(method);
    }
    function checkResult(result) {
        return result === undefined
            ? JsonRpcError.internalError('Result must exist for success Response objects')
            : null;
    }
    function checkParams(params) {
        if (params === undefined) {
            return null;
        }
        if (Array.isArray(params) || isObject(params)) {
            // ensure params can be stringify
            try {
                JSON.stringify(params);
                return null;
            }
            catch (err) {
                return JsonRpcError.parseError(params);
            }
        }
        return JsonRpcError.invalidParams(params);
    }
    function checkError(err) {
        if (!(err instanceof JsonRpcError)) {
            return JsonRpcError.internalError('Error must be an instance of JsonRpcError');
        }
        if (!isInteger(err.code)) {
            return JsonRpcError.internalError('Invalid error code. It must be an integer.');
        }
        if (!isString(err.message)) {
            return JsonRpcError.internalError('Message must exist or must be a string.');
        }
        return null;
    }
    function isString(obj) {
        return obj !== '' && typeof obj === 'string';
    }
    function isObject(obj) {
        return obj != null && typeof obj === 'object' && !Array.isArray(obj);
    }
    var jsonrpc = {
        JsonRpc: JsonRpc,
        JsonRpcError: JsonRpcError,
        request: request,
        notification: notification,
        success: success,
        error: error,
        parse: parse,
        parseObject: parseObject,
        parseJsonRpcObject: parseJsonRpcObject,
        parseJsonRpcString: exports.parseJsonRpcString,
    };
    exports.jsonrpc = jsonrpc;
    exports.default = jsonrpc;
});
//# sourceMappingURL=jsonrpc.js.map