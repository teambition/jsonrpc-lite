# JSON-RPC lite
> Parse and Serialize JSON-RPC2 messages in node.js, io.js or browser. Inspired by https://github.com/soggie/jsonrpc-serializer

A implementation of [JSON-RPC 2.0 specifications](http://jsonrpc.org/specification)

## Install

```sh
npm install jsonrpc-lite
```

## API

```js
var jsonrpc = require('jsonrpc-lite');
```
### Method jsonrpc.request(id, method[, params])
### Method jsonrpc.notification(method[, params])
### Method jsonrpc.success(id, result)
### Method jsonrpc.error(id, error)
### Method jsonrpc.parse(message)

### Class jsonrpc.JsonRpc()
### Class jsonrpc.err.JsonRpcError(message, code)
### Class jsonrpc.err.ParseError([message])
### Class jsonrpc.err.InternalError([message])
### Class jsonrpc.err.InvalidParamsError([message])
### Class jsonrpc.err.InvalidRequestError([message])
### Class jsonrpc.err.MethodNotFoundError([message])
