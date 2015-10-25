
module.exports = {

  canvasInstance: function(w, h) {
    w = w || 1;
    h = h || 1;
    var canvas;

    if (typeof document !== 'undefined' && document.createElement) {
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
    } else {
      var Canvas = require('canvas');
      if (!Canvas.prototype) return null;
      canvas = new Canvas(w, h);
    }
    return canvas;
  },

  init: function(canvas) {
    if(!canvas) {
      return null;
    }

    var gl = null;

    try {
      // Try to grab the standard context. If it fails, fallback to experimental.
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    // If we don't have a GL context, give up now
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser may not support it.");
      gl = null;
    }

    return gl;
  },

  resize: function(canvas, w, h, p) {
    canvas.width = w + p.left + p.right;
    canvas.height = h + p.top + p.bottom;
  },

  translationMatrix: function(tx, ty) {
    return [
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      tx, ty, 1.0
    ];
  }
};
