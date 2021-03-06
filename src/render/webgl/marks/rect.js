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

    x = o.x || 0;
    y = o.y || 0;
    w = o.width || 0;
    h = o.height || 0;

    var c = color(o.fill);
    shader.uniforms.color = [c.red() / 255, c.green() / 255, c.blue() / 255, opac];

    // create two triangles to form a rectangle
    var triangleCoordinates = [];
    triangleCoordinates.push(x, y);
    triangleCoordinates.push(x+w, y);
    triangleCoordinates.push(x, y+h);
    triangleCoordinates.push(x, y+h);
    triangleCoordinates.push(x+w, y);
    triangleCoordinates.push(x+w, y+h);

    buffer.update(triangleCoordinates);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  buffer.dispose();
  shader.dispose();
}

module.exports = {
  draw: draw,
  pick: util.pick()
};
