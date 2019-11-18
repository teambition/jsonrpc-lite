// Browser AMD Polyfill
(function (cxt) {
  const window = cxt.window
  if (typeof window !== 'undefined') {
    if (window.define) {
      return
    }
    window.define = function(name, required, moduleFn) {
      if (typeof name !== 'string') {
        return window.define('anonymous' + Math.random(), name, required)
      }
      var modules = window.define.modules
      var require = function() { throw new Error("AMD require not supported!")}
      var exports = modules[name] = {}
      var resolved = [require, exports]
      for (var i = 2; i < required.length; i++) {
        var m = modules[required[i]]
        if (!m) throw new Error("AMD module `" + required[i] + "` not found!")
        resolved.push(m)
      }
      moduleFn.apply(null, resolved)
    }
    window.define.modules = {}
    window.define.amd = true
  }
})(this)
