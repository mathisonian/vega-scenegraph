var DOM = require('../../util/dom'),
    Bounds = require('../../util/Bounds'),
    ImageLoader = require('../../util/ImageLoader'),
    Canvas = require('../../util/canvas'),
    Renderer = require('../Renderer'),
    marks = require('./marks'),
    WebGLUtils = require('../../util/webgl'),
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
  this._canvas = Canvas.instance(width, height);
  if (el) {
    DOM.clear(el, 0).appendChild(this._canvas);
    this._canvas.setAttribute('class', 'marks');
  }
  return base.initialize.call(this, el, width, height, padding);
};

prototype.resize = function(width, height, padding) {
  base.resize.call(this, width, height, padding);
  // Canvas.resize(this._canvas, this._width, this._height,
  //   this._padding, WebGLRenderer.RETINA);
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
  var gl = WebGLUtils.initWebGL(canvas);

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

  console.log('Rendering scene with WebGLRenderer.');
  console.log(scene);

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
  mark.draw.call(this, ctx, scene, bounds);
};

prototype.clear = function(x, y, w, h) {

  // TODO - does this need to be used to
  // clear certain regions of the screen too?
  var gl = this.gl();
  var c = Color(this._bgcolor);

  gl.clearColor(c.red() / 255, c.green() / 255, c.blue() / 255, c.alpha());
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
