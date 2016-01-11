precision mediump float;

attribute vec2 coord;

uniform vec2 resolution;
uniform mat3 matrix;

attribute vec2 texturePosition;
varying vec2 texCoord;


void main() {
  // Multiply the position by the matrix.
  vec2 position = (matrix * vec3(coord, 1)).xy;
  // gl_Position = vec4(position, 0, 1);

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  texCoord = texturePosition;
}
