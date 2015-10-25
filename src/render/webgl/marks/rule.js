var util = require('./util');
var glslify = require('glslify')
var createShader = require('gl-shader');
var createBuffer = require('gl-buffer');
var vertexShader = glslify('../shaders/vertex/position.glsl');
var fragmentShader = glslify('../shaders/fragment/color.glsl');
var color = require('color');

function draw(gl, scene, bounds) {
  if (!scene.items || !scene.items.length) return;

  var canvas = this.canvas();
  var shader = createShader(gl, vertexShader, fragmentShader);
  shader.bind();
  shader.uniforms.resolution = [canvas.clientWidth, canvas.clientHeight];
  shader.uniforms.matrix = this.transformationMatrix();

  var items = scene.items,
      o, opac, x, y, w, h;

  var buffer = createBuffer(gl, []);
  buffer.bind();
  shader.attributes.coord.pointer();

  for (var i=0, len=items.length; i<len; ++i) {
    o = items[i];
    if (bounds && !bounds.intersects(o.bounds))
      continue; // bounds check

    opac = o.opacity == null ? 1 : o.opacity;
    if (opac === 0) continue;

    x1 = o.x || 0;
    y1 = o.y || 0;
    x2 = o.x2 != null ? o.x2 : x1;
    y2 = o.y2 != null ? o.y2 : y1;

    var c = color(o.fill);
    shader.uniforms.color = [c.red() / 255, c.green() / 255, c.blue() / 255, opac];

    // create two triangles to form a rectangle
    var lineCoordinates = [];
    lineCoordinates.push(x1, y1);
    lineCoordinates.push(x2, y2);
    buffer.update(lineCoordinates);
    gl.drawArrays(gl.LINES, 0, 2);
  }

  buffer.dispose();
  shader.dispose();
}

module.exports = {
  draw: draw,
  pick: util.pick()
};
