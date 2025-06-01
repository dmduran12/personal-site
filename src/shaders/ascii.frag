precision mediump float;

uniform sampler2D uFrame;
uniform sampler2D uGlyphs;
uniform float uThreshold;
varying vec2 v_uv;

void main() {
  vec3 color = texture2D(uFrame, vec2(v_uv.x, 1.0 - v_uv.y)).rgb;
  float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
  if (lum > uThreshold) {
    gl_FragColor = vec4(0.0);
    return;
  }

  int index = int(floor(lum * 15.0 + 0.5));
  vec2 cell = vec2(mod(float(index), 4.0), floor(float(index) / 4.0)) / 4.0;
  vec2 glyphUV = fract(v_uv * 64.0) / 4.0 + cell;
  vec4 glyph = texture2D(uGlyphs, glyphUV);
  gl_FragColor = vec4(vec3(0.2, 0.2, 0.21), glyph.a);
}
