uniform sampler2D u_frame;
uniform sampler2D u_glyphs;
varying vec2 v_uv;

void main() {
  vec3 color = texture2D(u_frame, v_uv).rgb;
  float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
  int index = int(floor(lum * 15.0 + 0.5));
  vec2 cell = vec2(mod(float(index), 4.0), floor(float(index) / 4.0)) / 4.0;
  vec2 glyphUV = fract(v_uv * 128.0) / 4.0 + cell;
  gl_FragColor = texture2D(u_glyphs, glyphUV) * vec4(color, 1.0);
}
