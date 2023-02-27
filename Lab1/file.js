window.onload = function () {
  var canvas = document.getElementById("my-first-canvas");
  var gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL not supported!");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
