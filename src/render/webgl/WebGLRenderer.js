var DOM = require('../../util/dom'),
    Bounds = require('../../util/Bounds'),
    ImageLoader = require('../../util/ImageLoader'),
    Renderer = require('../Renderer'),
    marks = require('./marks'),
    WebGL = require('../../util/webgl'),
    Color = require("color");

function WebGLRenderer(loadConfig) {
  Renderer.call(this);
  this._loader = new ImageLoader(loadConfig);
}

WebGLRenderer.RETINA = true;

var base = Renderer.prototype;
var prototype = (WebGLRenderer.prototype = Object.create(base));
prototype.constructor = WebGLRenderer;

prototype.initialize = function(el, width, height, padding) {
  this._canvas = WebGL.canvasInstance(width, height);
  if (el) {
    DOM.clear(el, 0).appendChild(this._canvas);
    this._canvas.setAttribute('class', 'marks');
  }

  this._transformStack = [];
  return base.initialize.call(this, el, width, height, padding);
};

prototype.projection = function() {
  // todo - this is working quite right.
  return [
    2 / this._width, 0, 0,
    0, -2 / this._height, 0,
    -1, 1, 1
  ];
};

prototype._matrixMultiply = function(a, b) {
  // assume they are all 3x3
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
};

prototype.transformationMatrix = function() {
  var result = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];

  // todo - consolidate the projection matrix here instead of in
  // the shader
  //
  for (var i=this._transformStack.length-1; i>=0; i--) {
    var transform = this._transformStack[i];
    result = this._matrixMultiply(transform, result);
  }
  return result;
};

prototype.resize = function(width, height, padding) {
  base.resize.call(this, width, height, padding);
  WebGL.resize(this._canvas, this._width, this._height, this._padding);
  this._transformStack.push(WebGL.translationMatrix(this._padding.left, this._padding.top));
  return this;
};

prototype.canvas = function() {
  return this._canvas;
};

prototype.gl = function() {
  if(this._gl) {
    return this._gl;
  }

  var canvas = this.canvas();
  var gl = WebGL.init(canvas);

  // TODO - Research the implications of this.
  //        Its currently only used for image transparency...
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  // // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  this._gl = gl;
  return gl;
};

prototype.pendingImages = function() {
  return this._loader.pending();
};

function clipToBounds(g, items) {
  // if (!items) return null;
  //
  // var b = new Bounds(), i, n, item, mark, group;
  // for (i=0, n=items.length; i<n; ++i) {
  //   item = items[i];
  //   mark = item.mark;
  //   group = mark.group;
  //   item = marks[mark.marktype].nested ? mark : item;
  //   b.union(translate(item.bounds, group));
  //   if (item['bounds:prev']) {
  //     b.union(translate(item['bounds:prev'], group));
  //   }
  // }
  // b.round();
  //
  // g.beginPath();
  // g.rect(b.x1, b.y1, b.width(), b.height());
  // g.clip();
  //
  // return b;
}

function translate(bounds, group) {
  // if (group == null) return bounds;
  // var b = bounds.clone();
  // for (; group != null; group = group.mark.group) {
  //   b.translate(group.x || 0, group.y || 0);
  // }
  // return b;
}

prototype.render = function(scene, items) {

  var g = this.gl(),
      p = this._padding,
      w = this._width + p.left + p.right,
      h = this._height + p.top + p.bottom,
      b;

  // setup
  this._scene = scene; // cache scene for async redraw
  // g.save();
  // b = clipToBounds(g, items);
  this.clear(-p.left, -p.top, w, h);

  // render
  this.draw(g, scene, b);

  // takedown
  // g.restore();
  this._scene = null; // clear scene cache

  return this;
};

prototype.draw = function(ctx, scene, bounds) {
  var mark = marks[scene.marktype];
  console.log(mark);
  if(mark) {
    mark.draw.call(this, ctx, scene, bounds);
  } else {
    console.error('Can\'t draw marktype: ' + scene.marktype);
  }
};

prototype.clear = function(x, y, w, h) {

  // TODO - does this need to be used to
  // clear certain regions of the screen too?
  var gl = this.gl();

  if(this._bgcolor) {
    var c = Color(this._bgcolor);
    gl.clearColor(c.red() / 255, c.green() / 255, c.blue() / 255, c.alpha());
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
};

prototype.loadImage = function(uri) {
  var renderer = this,
      scene = this._scene;
  return this._loader.loadImage(uri, function() {
    renderer.renderAsync(scene);
  });
};

prototype.renderAsync = function(scene) {
  // TODO make safe for multiple scene rendering?
  var renderer = this;
  if (renderer._async_id) {
    clearTimeout(renderer._async_id);
  }
  renderer._async_id = setTimeout(function() {
    renderer.render(scene);
    delete renderer._async_id;
  }, 10);
};

module.exports = WebGLRenderer;
