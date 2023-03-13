window.onload = function () {
  // отримання об'єкта canvas
  let canvas = document.getElementById("my-canvas");

  // отримання контексту WebGL
  let gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL не підтримується вашим браузером!");
    return;
  }

  // налаштування viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  // встановлення кольору екрану
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // очищення екрану
  gl.clear(gl.COLOR_BUFFER_BIT);

  // створення вершинного шейдера
  let vertexShaderSource = `
          attribute vec3 aVertexPosition;
          attribute vec3 aVertexColor;
          varying vec3 vColor;
          void main() {
              gl_Position = vec4(aVertexPosition, 1.0);
              gl_PointSize = 10.0;
              vColor = aVertexColor;
          }
      `;

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // перевірка успішності компіляції вершинного шейдера
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "Помилка компіляції вершинного шейдера:",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }

  // створення фрагментного шейдера
  let fragmentShaderSource = `
          precision mediump float;
          varying vec3 vColor;
          void main() {
              gl_FragColor = vec4(vColor, 1.0);
          }
      `;

  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // перевірка успішності компіляції фрагментного шейдера
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "Помилка компіляції фрагментного шейдера:",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }

  // створення програми шейдерів та прив'язка шейдерів до програми
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // перевірка успішності створення програми шейдерів
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Помилка створення програми шейдерів:",
      gl.getProgramInfoLog(program)
    );
    return;
  }

  // використання програми шейдерів
  gl.useProgram(program);

  // створення буфера вершин
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // встановлення покажчиків на атрибути
  let positionPointer = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(positionPointer);
  gl.vertexAttribPointer(
    positionPointer,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  let colorPointer = gl.getAttribLocation(program, "aVertexColor");
  gl.enableVertexAttribArray(colorPointer);
  gl.vertexAttribPointer(
    colorPointer,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  // отримуємо координати прямокутника канвасу
  let rect = canvas.getBoundingClientRect();

  // змінна, що буде зберігати координати та кольори точок
  let points = [];

  // змінна, що буде зберігати колір наступної точки
  let pointColor = [0.0, 0.0, 0.0];

  // функція, що створює точку на місці курсора
  function createPoint(event) {
    // виправляємо позицію курсора в межах прямокутника канвасу
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    // додаємо точку до буферу
    points.push(
      (x / canvas.width) * 2 - 1,
      1 - (y / canvas.height) * 2,
      0.0,
      pointColor[0],
      pointColor[1],
      pointColor[2]
    );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    // очищення екрану
    gl.clear(gl.COLOR_BUFFER_BIT);

    // малюємо точки
    gl.drawArrays(gl.POINTS, 0, points.length / 6);
  }

  // додаємо обробник подій на натискання миші
  canvas.addEventListener("mousedown", createPoint);

  function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  hexToRgb("#ff0000"); // {r: 255, g: 0, b: 0}
  hexToRgb("#00ff00"); // {r: 0, g:

  // зміна кольору очищення канвасу
  const canvasColorButton = document.getElementById("canvas-color-button");
  canvasColorButton.addEventListener("click", function () {
    // отримати колір
    let res = hexToRgb(document.getElementById("canvas-color").value)

    // встановлення кольору екрану
    gl.clearColor(res.r / 255, res.g / 255 , res.b / 255, 1.0);

    // очищення екрану
    gl.clear(gl.COLOR_BUFFER_BIT);

    // очистити масив точок
    points = [];
  });

  // зміна кольору точок
  const pointColorButton = document.getElementById("point-color-button");
  pointColorButton.addEventListener("click", function () {
    // отримати колір
    let res = hexToRgb(document.getElementById("point-color").value)

    // встановлення кольору точок
    pointColor = [res.r / 255, res.g / 255 , res.b / 255];
  });
};
