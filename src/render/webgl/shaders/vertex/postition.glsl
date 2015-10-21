attribute vec2 position;

uniform vec2 resolution;

void main() {
   // convert pixels to -1.0 to 1.0
   vec2 clipSpace = 2.0 * position / resolution - 1.0;
   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
