window.onload = function () {
  // отримання об'єкта canvas
  let canvas = document.getElementById("my-canvas");

  // отримання контексту WebGL
  let gl = canvas.getContext("webgl");

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

  // налаштування, що робить задні частини куба непомітними
  gl.enable(gl.CULL_FACE);

  // створення вершинного шейдера
  var vertexShaderSource = `
        attribute vec3 aVertexPosition;
        attribute vec3 aVertexColor;
        uniform mat4 modelMatrix;
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        varying vec3 vColor;
        void main() {
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
        }
    `;

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
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
  var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
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
  var program = gl.createProgram();
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
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // встановлення значень вершин трикутника та їх кольорів
  var vertices = [
    //top
    -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0,
    1.0, 0.5, 0.5, 0.5, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
    //left
    -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, -1.0,
    -1.0, -1.0, 0.75, 0.25, 0.5, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,
    //right
    1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
    -1.0, -1.0, 0.25, 0.25, 0.75, 1.0, 1.0, -1.0, 0.25, 0.25, 0.75,
    //front
    1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0, 1.0, 1.0, 0.0, 0.15, -1.0, -1.0,
    1.0, 1.0, 0.0, 0.15, -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,
    //back
    1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0, -1.0, -1.0, 0.0, 1.0, 0.15, -1.0, -1.0,
    -1.0, 0.0, 1.0, 0.15, -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,
    //bottom
    -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, -1.0,
    1.0, 0.5, 0.5, 1.0, 1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // створення буфера індексів
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // індекси вершин для створення граней квадрата
  var indices = [
    //top
    0, 1, 2, 0, 2, 3,
    //left
    5, 4, 6, 6, 4, 7,
    // right
    8, 9, 10, 8, 10, 11,
    //front
    13, 12, 14, 15, 14, 12,
    //back
    16, 17, 18, 16, 18, 19,
    //bottom
    21, 20, 22, 22, 20, 23,
  ];

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // встановлення покажчиків на атрибути
  var positionPointer = gl.getAttribLocation(program, "aVertexPosition");
  gl.vertexAttribPointer(
    positionPointer,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionPointer);

  var colorPointer = gl.getAttribLocation(program, "aVertexColor");
  gl.vertexAttribPointer(
    colorPointer,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(colorPointer);

  // отримання локаторів змінних
  var modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");
  var projectionMatrixLocation = gl.getUniformLocation(
    program,
    "projectionMatrix"
  );
  var viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix");

  // створення та передача потрібних матриць в шейдери
  var modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  var projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, -3, 3, -3, 3, 2, 10);

  var viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);

  gl.uniformMatrix4fv(modelMatrixLocation, gl.FALSE, modelMatrix);
  gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);

  function drawScene() {
    // обертання
    mat4.rotateX(modelMatrix, modelMatrix, 0.01);
    mat4.rotateY(modelMatrix, modelMatrix, 0.02);
    mat4.rotateZ(modelMatrix, modelMatrix, 0.01);

    // передача матриці в шейдер
    gl.uniformMatrix4fv(modelMatrixLocation, gl.FALSE, modelMatrix);

    // очистка екрану та відображення квадрата
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // запуск функції для рендерингу анімації
    requestAnimationFrame(drawScene);
  }

  // запуск функції для рендерингу анімації
  requestAnimationFrame(drawScene);

  // обробник написку  Orthogonal
  document.getElementById("ortho").addEventListener("change", () => {
    mat4.ortho(projectionMatrix, -3, 3, -3, 3, 2, 10);
    gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);
  });

  // обробник написку  Perspective
  document.getElementById("persp").addEventListener("change", () => {
    mat4.perspective(projectionMatrix, Math.PI / 4, 1, 2, 10);
    gl.uniformMatrix4fv(projectionMatrixLocation, gl.FALSE, projectionMatrix);
  });
};
