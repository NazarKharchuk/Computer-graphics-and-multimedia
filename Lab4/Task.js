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
        attribute vec2 aTexCoord;
        attribute vec3 aNormal;
        uniform mat4 modelMatrix;
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        varying vec2 vTexCoord;
        varying vec3 vNormal;
        void main() {
          vTexCoord = aTexCoord;
          vNormal = (modelMatrix * vec4(aNormal, 0.0)).xyz;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);
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
        varying vec2 vTexCoord;
        varying vec3 vNormal;
        uniform sampler2D sampler;
        void main() {
          vec3 am = vec3(2.0, 2.0, 0.2);
          vec3 sy = vec3(2.0, 1.6, 1.4);
          vec3 sn = vec3(1.0, -4.0, 1.0);

          vec4 texel = texture2D(sampler, vTexCoord);

          vec3 li = am + sy * max(dot(vNormal, sn), 0.0);

          gl_FragColor = vec4(texel.rgb * li, texel.a);
          //gl_FragColor = texture2D(sampler, vTexCoord);
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

  // створення буфера вершин
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // встановлення значень вершин
  var vertices = [
    // Top
    -1.0,
    1.0,
    -1.0,
    0,
    0, //
    -1.0,
    1.0,
    1.0,
    0,
    1, //
    1.0,
    1.0,
    1.0,
    1,
    1, //
    1.0,
    1.0,
    -1.0,
    1,
    0, //

    // Left
    -1.0,
    1.0,
    1.0,
    0,
    0, //
    -1.0,
    -1.0,
    1.0,
    1,
    0, //
    -1.0,
    -1.0,
    -1.0,
    1,
    1, //
    -1.0,
    1.0,
    -1.0,
    0,
    1, //

    // Right
    1.0,
    1.0,
    1.0,
    1,
    1, //
    1.0,
    -1.0,
    1.0,
    0,
    1, //
    1.0,
    -1.0,
    -1.0,
    0,
    0, //
    1.0,
    1.0,
    -1.0,
    1,
    0, //

    // Front
    1.0,
    1.0,
    1.0,
    1,
    1, //
    1.0,
    -1.0,
    1.0,
    1,
    0, //
    -1.0,
    -1.0,
    1.0,
    0,
    0, //
    -1.0,
    1.0,
    1.0,
    0,
    1, //

    // Back
    1.0,
    1.0,
    -1.0,
    0,
    0, //
    1.0,
    -1.0,
    -1.0,
    0,
    1, //
    -1.0,
    -1.0,
    -1.0,
    1,
    1, //
    -1.0,
    1.0,
    -1.0,
    1,
    0, //

    // Bottom
    -1.0,
    -1.0,
    -1.0,
    1,
    1, //
    -1.0,
    -1.0,
    1.0,
    1,
    0, //
    1.0,
    -1.0,
    1.0,
    0,
    0, //
    1.0,
    -1.0,
    -1.0,
    0,
    1, //
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // створення буфера індексів
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // індекси вершин для створення граней квадрата
  var indices = [
    // Top
    0, 1, 2, 0, 2, 3,

    // Left
    5, 4, 6, 6, 4, 7,

    // Right
    8, 9, 10, 8, 10, 11,

    // Front
    13, 12, 14, 15, 14, 12,

    // Back
    16, 17, 18, 16, 18, 19,

    // Bottom
    21, 20, 22, 22, 20, 23,
  ];

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // створення буфера normals
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  // встановлення значень вершин трикутника та їх кольорів
  var normals = [
    // Top
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

    // Left
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,

    // Right
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

    // Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

    // Bottom
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // встановлення покажчиків на атрибути
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var positionPointer = gl.getAttribLocation(program, "aVertexPosition");
  gl.vertexAttribPointer(
    positionPointer,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionPointer);

  var TexCoordPointer = gl.getAttribLocation(program, "aTexCoord");
  gl.vertexAttribPointer(
    TexCoordPointer,
    2,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(TexCoordPointer);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  var normalPointer = gl.getAttribLocation(program, "aNormal");
  gl.vertexAttribPointer(
    normalPointer,
    3,
    gl.FLOAT,
    gl.FALSE,
    0,
    0
  );
  gl.enableVertexAttribArray(normalPointer);

  // створення текстури
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );

  // використання програми шейдерів
  gl.useProgram(program);

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
};
