"use strict";var r=Object.prototype.hasOwnProperty,e="function"==typeof Number.isSafeInteger?Number.isSafeInteger:function(r){return"number"==typeof r&&isFinite(r)&&r===Math.floor(r)&&Math.abs(r)<=9007199254740991},t=function(){this.jsonrpc="2.0"};t.prototype.serialize=function(){return JSON.stringify(this)},t.VERSION="2.0";var n=function(r){function e(e,t,n){r.call(this),this.id=e,this.method=t,void 0!==n&&(this.params=n)}return r&&(e.__proto__=r),(e.prototype=Object.create(r&&r.prototype)).constructor=e,e}(t),o=function(r){function e(e,t){r.call(this),this.method=e,void 0!==t&&(this.params=t)}return r&&(e.__proto__=r),(e.prototype=Object.create(r&&r.prototype)).constructor=e,e}(t),i=function(r){function e(e,t){r.call(this),this.id=e,this.result=t}return r&&(e.__proto__=r),(e.prototype=Object.create(r&&r.prototype)).constructor=e,e}(t),s=function(r){function e(e,t){r.call(this),this.id=e,this.error=t,this.id=e,this.error=t}return r&&(e.__proto__=r),(e.prototype=Object.create(r&&r.prototype)).constructor=e,e}(t),a=function(r,e){this.payload=r,this.type=e,this.payload=r,this.type=e},u=function(r,t,n){this.message=r,this.code=e(t)?t:0,null!=n&&(this.data=n)};function c(r,e,t){var o=new n(r,e,t);return y(o,!0),o}function l(r,e){var t=new o(r,e);return y(t,!0),t}function p(r,e){var t=new i(r,e);return y(t,!0),t}function f(r,e){var t=new s(r,e);return y(t,!0),t}function d(r){if(!g(r))return new a(u.invalidRequest(r),"invalid");var e;try{e=JSON.parse(r)}catch(e){return new a(u.parseError(r),"invalid")}return h(e)}function h(r){if(!Array.isArray(r))return m(r);if(0===r.length)return new a(u.invalidRequest(r),"invalid");for(var e=[],t=0,n=r.length;t<n;t++)e[t]=m(r[t]);return e}u.invalidRequest=function(r){return new u("Invalid request",-32600,r)},u.methodNotFound=function(r){return new u("Method not found",-32601,r)},u.invalidParams=function(r){return new u("Invalid params",-32602,r)},u.internalError=function(r){return new u("Internal error",-32603,r)},u.parseError=function(r){return new u("Parse error",-32700,r)};var v=d;function m(e){var c=null,l=null,p="invalid";if(null==e||e.jsonrpc!==t.VERSION)c=u.invalidRequest(e),p="invalid";else if(r.call(e,"id")){if(r.call(e,"method"))c=y(l=new n(e.id,e.method,e.params)),p="request";else if(r.call(e,"result"))c=y(l=new i(e.id,e.result)),p="success";else if(r.call(e,"error")){var f=e;if(p="error",null==f.error)c=u.internalError(f);else{var d=new u(f.error.message,f.error.code,f.error.data);c=d.message!==f.error.message||d.code!==f.error.code?u.internalError(f):y(l=new s(f.id,d))}}}else c=y(l=new o(e.method,e.params)),p="notification";return null==c&&null!=l?new a(l,p):new a(null!=c?c:u.invalidRequest(e),"invalid")}function y(r,t){var a=null;if(r instanceof n?(null==(a=b(r.id))&&(a=w(r.method)),null==a&&(a=R(r.params))):r instanceof o?null==(a=w(r.method))&&(a=R(r.params)):r instanceof i?null==(a=b(r.id))&&(a=void 0===r.result?u.internalError("Result must exist for success Response objects"):null):r instanceof s&&null==(a=b(r.id,!0))&&(a=function(r){return r instanceof u?e(r.code)?g(r.message)?null:u.internalError("Message must exist or must be a string."):u.internalError("Invalid error code. It must be an integer."):u.internalError("Error must be an instance of JsonRpcError")}(r.error)),t&&null!=a)throw a;return a}function b(r,t){return t&&null===r?null:g(r)||e(r)?null:u.internalError('"id" must be provided, a string or an integer.')}function w(r){return g(r)?null:u.invalidRequest(r)}function R(r){if(void 0===r)return null;if(Array.isArray(r)||null!=(e=r)&&"object"==typeof e&&!Array.isArray(e))try{return JSON.stringify(r),null}catch(e){return u.parseError(r)}var e;return u.invalidParams(r)}function g(r){return""!==r&&"string"==typeof r}var x={JsonRpc:t,JsonRpcError:u,request:c,notification:l,success:p,error:f,parse:d,parseObject:m,parseJsonRpcObject:h,parseJsonRpcString:v};exports.JsonRpc=t,exports.RequestObject=n,exports.NotificationObject=o,exports.SuccessObject=i,exports.ErrorObject=s,exports.JsonRpcParsed=a,exports.JsonRpcError=u,exports.request=c,exports.notification=l,exports.success=p,exports.error=f,exports.parse=d,exports.parseJsonRpcObject=h,exports.parseJsonRpcString=v,exports.parseObject=m,exports.jsonrpc=x,exports.default=x;
//# sourceMappingURL=jsonrpc.js.map
