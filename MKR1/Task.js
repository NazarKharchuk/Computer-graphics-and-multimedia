window.onload = function () {
  // отримання об'єкта canvas
  var canvas = document.getElementById("my-canvas");

  // отримання контексту WebGL
  var gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL не підтримується вашим браузером!");
    return;
  }

  // налаштування viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  // встановлення кольору екрану
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // очищення екрану
  gl.clear(gl.COLOR_BUFFER_BIT);

  // створення вершинного шейдера
  var vertexShaderSource = `
        attribute vec3 aVertexPosition;
        attribute vec3 aVertexColor;
        uniform mat4 modelMatrix;
        varying vec3 vColor;
        void main() {
            gl_Position = modelMatrix * vec4(aVertexPosition, 1.0);
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

  // встановлення значень вершин та їх кольорів
  var vertices = [
    // вершина 1
    -0.3,
    0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 2
    -0.1,
    0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 3
    0.1,
    0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 4
    0.3,
    0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 5
    -0.1,
    0.1,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 6
    -0.1,
    -0.1,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 7
    -0.3,
    -0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 8
    -0.1,
    -0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 9
    0.1,
    -0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

    // вершина 10
    0.3,
    -0.3,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори

        // вершина 11
    0.1,
    -0.1,
    0.0, // координати
    1.0,
    0.0,
    0.0, // кольори
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // створення буфера індексів
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // індекси вершин для створення граней літер
  var indicesN = [0, 1, 6, 1, 6, 7, 1, 10, 4, 4, 10, 8, 2, 3, 8, 3, 8, 9];
  var indicesK = [0, 1, 6, 1, 6, 7, 4, 2, 3, 4, 3, 5, 4, 9, 8, 4, 8, 5];
  var indices = indicesK;

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // кількість елементів в кожному рядку вершин
  var vertexSize = 3 + 3; // 3 координати та 3 кольори

  // встановлення покажчиків на атрибути
  var positionPointer = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(positionPointer);
  gl.vertexAttribPointer(
    positionPointer,
    3,
    gl.FLOAT,
    false,
    vertexSize * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  var colorPointer = gl.getAttribLocation(program, "aVertexColor");
  gl.enableVertexAttribArray(colorPointer);
  gl.vertexAttribPointer(
    colorPointer,
    3,
    gl.FLOAT,
    false,
    vertexSize * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  // створення матриці моделі та передача в шейдер
  var modelMatrix = mat4.create();

  function drawScene() {
    // створення матриці обертання навколо центру
    var rotationMatrix = mat4.create();
    mat4.rotateZ(rotationMatrix, rotationMatrix, 0.01);

    // обертання літери
    mat4.multiply(modelMatrix, modelMatrix, rotationMatrix);

    // передача матриці моделі в шейдер
    var modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    // очистка екрану та відображення літери
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // запуск функції для рендерингу анімації
    requestAnimationFrame(drawScene);
  }

  // запуск функції для рендерингу анімації
  requestAnimationFrame(drawScene);

  // обробник написку кнопки "K"
  document.getElementById("K-button").addEventListener("click", () => {
    var indices = indicesK;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
    document.getElementById("K-button").disabled = true;
    document.getElementById("N-button").disabled = false;
  });

  // обробник написку кнопки "N"
  document.getElementById("N-button").addEventListener("click", () => {
    var indices = indicesN;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
    document.getElementById("N-button").disabled = true;
    document.getElementById("K-button").disabled = false;
  });
};
