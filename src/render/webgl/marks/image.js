var util = require('./util');
var glslify = require('glslify')
var createShader = require('gl-shader');
var createBuffer = require('gl-buffer');

var createTexture = require('gl-texture2d');
var vertexShader = glslify('../shaders/vertex/texturePosition.glsl');
var fragmentShader = glslify('../shaders/fragment/texture.glsl');


function draw(gl, scene, bounds) {
  if (!scene.items || !scene.items.length) return;

  var canvas = this.canvas();
  var shader = createShader(gl, vertexShader, fragmentShader);
  shader.bind();
  shader.uniforms.resolution = [canvas.clientWidth, canvas.clientHeight];
  shader.uniforms.matrix = this.transformationMatrix();


  var positionBuffer = createBuffer(gl, util.getBufferRectangle(0, 0, 0, 0));
  positionBuffer.bind();
  shader.attributes.coord.pointer();

  var texturePositionBuffer = createBuffer(gl, util.getBufferRectangle(0, 0, 1, 1));
  texturePositionBuffer.bind();
  shader.attributes.texturePosition.pointer();


  var renderer = this,
      items = scene.items, o;

  for (var i=0, len=items.length; i<len; ++i) {
    o = items[i];
    if (bounds && !bounds.intersects(o.bounds))
      continue; // bounds check

    if (!(o.image && o.image.url === o.url)) {
      o.image = renderer.loadImage(o.url);
      o.image.url = o.url;
    }

    var x = o.x || 0,
        y = o.y || 0,
        w = o.width || (o.image && o.image.width) || 0,
        h = o.height || (o.image && o.image.height) || 0,
        opac;
    x = x - (o.align==='center' ? w/2 : o.align==='right' ? w : 0);
    y = y - (o.baseline==='middle' ? h/2 : o.baseline==='bottom' ? h : 0);

    if (o.image.loaded) {

      var texture = createTexture(gl, o.image);
      texture.bind();
      shader.uniforms.texture = this.texture;

      positionBuffer.update(util.getBufferRectangle(x, y, w, h));

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      texture.dispose();
    }
  }


  positionBuffer.dispose();
  texturePositionBuffer.dispose();
  shader.dispose();
}

module.exports = {
  draw: draw,
  pick: util.pick()
};
