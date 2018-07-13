// **Github:** https://github.com/teambition/jsonrpc-lite
//
// http://www.jsonrpc.org/specification
// **License:** MIT
"use strict";

type ID = number | string;
type RpcParams = object | Array<any>;

const undef: void = void 0;
// const toString: () => string = Object.prototype.toString;
const hasOwnProperty: (v: string | number | symbol) => boolean =
  Object.prototype.hasOwnProperty;
const isArray: (obj: any) => boolean =
  Array.isArray ||
  function(obj) {
    return toString.call(obj) === "[object Array]";
  };

const isInteger: (num: number) => boolean = function(num) {
  return num === Math.floor(num) && Math.abs(num) <= 9007199254740991;
};

/**
 * JsonRpc Class
 *
 * @return {Object} JsonRpc object
 * @api public
 */
interface IJsonRpc {
  readonly jsonrpc: string;
}
class JsonRpc implements IJsonRpc {
  readonly jsonrpc: string;
  static VERSION: string = "2.0";

  constructor() {
    this.jsonrpc = "2.0";
  }
  // serialize() {
  //   return JSON.stringify(this);
  // }
  // toString = this.serialize;
}

class RequestObject extends JsonRpc {
  public name: string;

  constructor(public id: ID, public method: string, public params?: RpcParams) {
    super();

    this.id = id;
    this.method = method;
    this.params = params!;
  }
}
RequestObject.prototype.name = "request";

class NotificationObject extends JsonRpc {
  public name: string;

  // FIXME
  constructor(public method: string, public params?: RpcParams) {
    super();

    this.method = method;
    this.params = params!;
    // if (params !== undefined) this.params = params;
  }
}
NotificationObject.prototype.name = "notification";

class SuccessObject extends JsonRpc {
  public name: string;

  // FIXME
  constructor(public id: ID, public result: any) {
    super();

    this.id = id;
    this.result = result;
  }
}
SuccessObject.prototype.name = "success";

class ErrorObject extends JsonRpc {
  public name: string;
  // FIXME
  constructor(public id: ID, public error: JsonRpcError) {
    super();
    this.id = id;
    this.error = error;
  }
}
ErrorObject.prototype.name = "error";

/**
 * JsonRpcParsed Class
 *
 * @param  {JsonRpc|JsonRpcError} payload
 * @param  {type: <Enum, 'request'|'notification'|'success'|'error'|'invalid'>} type
 * @api public
 */
enum RpcStatusType {
  request = "request",
  notification = "notification",
  success = "success",
  error = "error",
  invalid = "invalid"
}
class JsonRpcParsed {
  constructor(
    public payload: JsonRpc | JsonRpcError,
    public type: RpcStatusType
  ) {
    this.payload = payload;
    // FIXME
    this.type = type;
  }
}

/**
 * JsonRpcError Class
 *
 * @param  {String} message
 * @param  {Integer} code
 * @return {String} name: optional
 * @api public
 */
class JsonRpcError extends Error {
  public name: string;

  // TO FIX Data type
  constructor(public message: string, public code: number, public data?: any) {
    super();
    
    this.message = message;
    this.code = isInteger(code) ? code : 0;
    this.data = data;
  }

  static invalidRequest = function(data: any): JsonRpcError {
    return new JsonRpcError("Invalid request", -32600, data);
  };

  static methodNotFound = function(data: any): JsonRpcError {
    return new JsonRpcError("Method not found", -32601, data);
  };

  static invalidParams = function(data: any): JsonRpcError {
    return new JsonRpcError("Invalid params", -32602, data);
  };

  static internalError = function(data: any): JsonRpcError {
    return new JsonRpcError("Internal error", -32603, data);
  };

  static parseError = function(data: any): JsonRpcError {
    return new JsonRpcError("Parse error", -32700, data);
  };
}
JsonRpcError.prototype.name = "JsonRpcError";

const jsonrpc: {
  [propName: string]: any;
} = {
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
jsonrpc.request = function(
  id: ID,
  method: string,
  params?: RpcParams
): RequestObject {
  const object = new RequestObject(id, method, params);
  validateMessage(object, true);
  return object;
};

/**
 * Creates a JSON-RPC 2.0 notification object
 *
 * @param  {String} method
 * @param  {Object|Array} [params]: optional
 * @return {Object} JsonRpc object
 * @api public
 */
jsonrpc.notification = function(
  method: string,
  params?: RpcParams
): NotificationObject {
  const object = new NotificationObject(method, params);
  validateMessage(object, true);
  return object;
};

/**
 * Creates a JSON-RPC 2.0 success response object
 *
 * @param  {String|Integer} id
 * @param  {Mixed} result
 * @return {Object} JsonRpc object
 * @api public
 */
jsonrpc.success = function(id: ID, result: any): SuccessObject {
  const object = new SuccessObject(id, result);
  validateMessage(object, true);
  return object;
};

/**
 * Creates a JSON-RPC 2.0 error response object
 *
 * @param  {String|Integer} id
 * @param  {Object} JsonRpcError error
 * @return {Object} JsonRpc object
 * @api public
 */
jsonrpc.error = function(id: ID, error: JsonRpcError): JsonRpc {
  let object = new ErrorObject(id, error);
  validateMessage(object, true);
  return object;
};

/**
 * Takes a JSON-RPC 2.0 payload (String) and tries to parse it into a JSON.
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
interface IParsedObject {
  type: RpcStatusType;
  payload: JsonRpc | JsonRpcError;
}
jsonrpc.parse = function(
  message: string | string[] | null
): IParsedObject | IParsedObject[] {
  if (!message || typeof message !== "string") {
    return new JsonRpcParsed(
      JsonRpcError.invalidRequest(message),
      "invalid" as RpcStatusType
    );
  }

  try {
    message = JSON.parse(message);
  } catch (err) {
    return new JsonRpcParsed(
      JsonRpcError.parseError(message),
      "invalid" as RpcStatusType
    );
  }

  if (!isArray(message)) return this.parseObject(message);
  if (!message!.length) {
    return new JsonRpcParsed(
      JsonRpcError.invalidRequest(message),
      "invalid" as RpcStatusType
    );
  }
  for (let i = 0, len = message!.length; i < len; i++) {
    (message![i] as string) = this.parseObject(message![i]);
  }

  // FIXME
  return message as any;
};

/**
 * Takes a JSON-RPC 2.0 payload (Object) and tries to parse it into a JSON.
 * If successful, determine what object is it (response, notification,
 * success, error, or invalid), and return it's type and properly formatted object.
 *
 * @param  {Object} msg
 * @return {Object|Array} an array, or an object of this format:
 *
 *  {
 *    type: <Enum, 'request'|'notification'|'success'|'error'|'invalid'>
 *    payload: <JsonRpc|JsonRpcError>
 *  }
 *
 * @api public
 */
jsonrpc.parseObject = function(obj: JsonRpc) {
  let error: JsonRpcError | null = null;
  let payload: JsonRpc | JsonRpcError | null = null;

  if (obj.jsonrpc !== JsonRpc.VERSION) error = JsonRpcError.invalidRequest(obj);
  if (!hasOwnProperty.call(obj, 'id')) {
    let tmp = obj as NotificationObject;
    payload = new NotificationObject(tmp.method, tmp.params);
    error = validateMessage(payload);
  } else if (hasOwnProperty.call(obj, 'method')) {
    let tmp = obj as RequestObject;
    payload = new RequestObject(tmp.id, tmp.method, tmp.params);
    error = validateMessage(payload);
  } else if (hasOwnProperty.call(obj, 'result')) {
    let tmp = obj as SuccessObject;
    payload = new SuccessObject(tmp.id, tmp.result);
    error = validateMessage(payload);
  } else if (hasOwnProperty.call(obj, 'error')) {
    let tmp = obj as ErrorObject;
    if (!tmp.error) {
      error = JsonRpcError.internalError(tmp);
    } else {
      let err = new JsonRpcError(
        tmp.error.message,
        tmp.error.code,
        tmp.error.data
      );
      if (err.message !== tmp.error.message || err.code !== tmp.error.code) {
        error = JsonRpcError.internalError(tmp);
      } else {
        payload = new ErrorObject(tmp.id, err);
        error = validateMessage(payload);
      }
    }
  }
  // TODO FIXME
  if (!error && payload)
    return new JsonRpcParsed(payload, (payload as any).name);
  return new JsonRpcParsed(
    error || JsonRpcError.invalidRequest(obj),
    "invalid" as RpcStatusType
  );
};

// if error, return error, else return null
function validateMessage(obj: JsonRpc, throwIt?: boolean): JsonRpcError | null {
  let error: JsonRpcError | null = null;
  if (obj instanceof RequestObject) {
    error =
      checkId(obj.id) || checkMethod(obj.method) || checkParams(obj.params);
  } else if (obj instanceof NotificationObject) {
    error = checkMethod(obj.method) || checkParams(obj.params);
  } else if (obj instanceof SuccessObject) {
    error = checkId(obj.id) || checkResult(obj.result);
  } else if (obj instanceof ErrorObject) {
    error = checkId(obj.id, true) || checkError(obj.error as JsonRpcError);
  }
  if (error && throwIt) throw error;
  return error;
}

type JsonRpcErrorOrNot = JsonRpcError | null;

function checkId(id: ID, maybeNull?: boolean): JsonRpcErrorOrNot {
  if (maybeNull && id === null) return null;
  return isString(id) || isInteger(id as number)
    ? null
    : JsonRpcError.internalError(
        '"id" must be provided, a string or an integer.'
      );
}

function checkMethod(method: string): JsonRpcErrorOrNot {
  return isString(method) ? null : JsonRpcError.methodNotFound(method);
}

function checkResult(result: any): JsonRpcErrorOrNot {
  return result === undef
    ? JsonRpcError.internalError(
        "Result must exist for success Response objects"
      )
    : null;
}

function checkParams(params?: RpcParams): JsonRpcErrorOrNot {
  if (params === undefined) return null;
  if (isArray(params) || isObject(params)) {
    // ensure params can be stringify
    try {
      JSON.stringify(params);
      return null;
    } catch (err) {
      return JsonRpcError.parseError(params);
    }
  }
  return JsonRpcError.invalidParams(params);
}

function checkError(error: any): JsonRpcErrorOrNot {
  if (!(error instanceof JsonRpcError)) {
    return JsonRpcError.internalError(
      "Error must be an instance of JsonRpcError"
    );
  }

  if (!isInteger(error.code)) {
    return JsonRpcError.internalError(
      "Invalid error code. It must be an integer."
    );
  }

  if (!isString(error.message)) {
    return JsonRpcError.internalError(
      "Message must exist or must be a string."
    );
  }

  return null;
}

function isString(obj: any): boolean {
  return obj && typeof obj === "string";
}

function isObject(obj: any): boolean {
  return obj && typeof obj === "object" && !isArray(obj);
}

const str = '{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}'
const obj = jsonrpc.parse(str);

export default jsonrpc;
export { JsonRpc, JsonRpcError, jsonrpc };
