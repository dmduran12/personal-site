import asciiFrag from '../shaders/ascii.frag?raw'

let gl: WebGL2RenderingContext | null = null
let glCanvas: OffscreenCanvas | null = null
let displayCtx: OffscreenCanvasRenderingContext2D | null = null
let program: WebGLProgram | null = null
let vao: WebGLVertexArrayObject | null = null
let frameTex: WebGLTexture | null = null
let glyphTex: WebGLTexture | null = null
let uFrameLoc: WebGLUniformLocation | null = null
let uGlyphsLoc: WebGLUniformLocation | null = null
let uThresholdLoc: WebGLUniformLocation | null = null
let uCellCountLoc: WebGLUniformLocation | null = null

const THRESHOLD = 0.33
const CELL_W = 6
const CELL_H = 8

self.onmessage = ({ data }) => {
  if (data.canvas) {
    const canvas = data.canvas as OffscreenCanvas
    displayCtx = canvas.getContext('2d')
    glCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    gl = glCanvas.getContext('webgl2')
    if (gl) init(gl)
    return
  }

  if (gl && data.frame) {
    render(gl, data.frame as ImageBitmap)
  }
}

function init(gl: WebGL2RenderingContext) {
  const vertSrc = `
    precision mediump float;
    attribute vec2 position;
    varying vec2 v_uv;
    void main() {
      v_uv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const vs = gl.createShader(gl.VERTEX_SHADER)!
  gl.shaderSource(vs, vertSrc)
  gl.compileShader(vs)
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('Vertex shader error:', gl.getShaderInfoLog(vs))
  }

  const fs = gl.createShader(gl.FRAGMENT_SHADER)!
  gl.shaderSource(fs, asciiFrag)
  gl.compileShader(fs)
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('Fragment shader error:', gl.getShaderInfoLog(fs))
  }

  program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
  }

  vao = gl.createVertexArray()!
  gl.bindVertexArray(vao)
  const vbo = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ]),
    gl.STATIC_DRAW
  )
  const loc = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  frameTex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, frameTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  glyphTex = createGlyphTexture(gl)

  uFrameLoc = gl.getUniformLocation(program, 'uFrame')
  uGlyphsLoc = gl.getUniformLocation(program, 'uGlyphs')
  uThresholdLoc = gl.getUniformLocation(program, 'uThreshold')
  uCellCountLoc = gl.getUniformLocation(program, 'uCellCount')
  const cellX = gl.canvas.width / CELL_W
  const cellY = gl.canvas.height / CELL_H
  gl.useProgram(program)
  gl.uniform2f(uCellCountLoc, cellX, cellY)
}

function createGlyphTexture(gl: WebGL2RenderingContext) {
  const chars = [
    '$',
    '#',
    'W',
    'M',
    'N',
    '8',
    'H',
    'A',
    'E',
    '6',
    '9',
    'C',
    'F',
    'Y',
    '+',
    '?'
  ]
  const size = 256
  const cell = size / 4
  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 10px/8px "SF Mono", "IBM Plex Mono", monospace'

  for (let i = 0; i < chars.length; i++) {
    const x = (i % 4) * cell + cell / 2
    const y = Math.floor(i / 4) * cell + cell / 2
    ctx.fillText(chars[i], x, y)
  }

  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)

  return tex
}

function render(gl: WebGL2RenderingContext, frame: ImageBitmap) {
  if (glCanvas) {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height)
  }
  gl.useProgram(program)
  gl.bindVertexArray(vao)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, frameTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame)
  gl.uniform1i(uFrameLoc, 0)

  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, glyphTex)
  gl.uniform1i(uGlyphsLoc, 1)

  gl.uniform1f(uThresholdLoc, THRESHOLD)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
  gl.flush()
  if (displayCtx && glCanvas) {
    displayCtx.clearRect(0, 0, glCanvas.width, glCanvas.height)
    displayCtx.drawImage(glCanvas, 0, 0)
  }
  frame.close()
}
