var util = require('./util');
var glslify = require('glslify')
var createShader = require('gl-shader');
var createBuffer = require('gl-buffer');

var vertexShader = glslify('../shaders/vertex/rect.glsl');
var fragmentShader = glslify('../shaders/fragment/color.glsl');


function draw(gl, scene, bounds) {
  if (!scene.items || !scene.items.length) return;

  var canvas = this.canvas();

  var shader = createShader(gl, vertexShader, fragmentShader);
  var buffer = createBuffer(gl, [
      0,0,
      0,1,
      1,0,
      1,1]);

  buffer.bind();
  shader.bind();
  shader.attributes.coord.pointer();

  shader.uniforms.screenBox = [0, 0, canvas.width, canvas.height];

  var items = scene.items,
      o, opac, x, y, w, h;

  for (var i=0, len=items.length; i<len; ++i) {
    o = items[i];
    if (bounds && !bounds.intersects(o.bounds))
      continue; // bounds check

    opac = o.opacity == null ? 1 : o.opacity;
    if (opac === 0) continue;

    x = o.x || 0;
    y = o.y || 0;
    w = o.width || 0;
    h = o.height || 0;

    shader.uniforms.lo = [x, y];
    shader.uniforms.hi = [x + w, y + h];
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

module.exports = {
  draw: draw,
  pick: util.pick()
};
