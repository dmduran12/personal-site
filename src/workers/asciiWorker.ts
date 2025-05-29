self.onmessage = ({ data }) => {
  const { video, canvas } = data
  const gl = canvas.getContext('webgl2')
  if (!gl) return
  // TODO: upload frame -> texture, run glyph-map shader, render quad
}
