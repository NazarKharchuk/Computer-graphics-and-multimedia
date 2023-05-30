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

  // створення програми шейдерів та прив'язка шейдерів до програми
  var programBox = initGL_1(gl);

  // використання програми шейдерів
  gl.useProgram(programBox);

  // створення буфера вершин
  var vertexBufferBox = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBox);

  // встановлення значень вершин трикутника та їх кольорів
  var verticesBox = [
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

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBox), gl.STATIC_DRAW);

  // створення буфера індексів
  var indexBufferBox = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferBox);

  // індекси вершин для створення граней квадрата
  var indicesBox = [
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
    new Uint16Array(indicesBox),
    gl.STATIC_DRAW
  );

  // встановлення покажчиків на атрибути
  var positionPointerBox = gl.getAttribLocation(
    programBox,
    "aVertexPositionBox"
  );
  gl.vertexAttribPointer(
    positionPointerBox,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionPointerBox);

  var colorPointerBox = gl.getAttribLocation(programBox, "aVertexColorBox");
  gl.vertexAttribPointer(
    colorPointerBox,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(colorPointerBox);

  // отримання локаторів змінних
  var modelMatrixLocationBox = gl.getUniformLocation(
    programBox,
    "modelMatrixBox"
  );
  var projectionMatrixLocationBox = gl.getUniformLocation(
    programBox,
    "projectionMatrixBox"
  );
  var viewMatrixLocationBox = gl.getUniformLocation(
    programBox,
    "viewMatrixBox"
  );

  var cameraDistance = 8; // Відстань камери від моделі
  var modelRotationAngle = -1; // Кут обертання моделі
  var cameraPosition;

  // створення та передача потрібних матриць в шейдери
  var modelMatrixBox = mat4.create();
  mat4.identity(modelMatrixBox);

  var projectionMatrixBox = mat4.create();
  mat4.perspective(projectionMatrixBox, Math.PI / 4, 1, 2, 10);

  var viewMatrixBox = mat4.create();
  function rotateBoxAndCover() {
    // Обчислення положення камери
    cameraPosition = [
      Math.sin(modelRotationAngle) * cameraDistance,
      0,
      Math.cos(modelRotationAngle) * cameraDistance,
    ];
  }
  rotateBoxAndCover();
  mat4.lookAt(viewMatrixBox, cameraPosition, [0, 0, 0], [0, 1, 0]);

  gl.uniformMatrix4fv(modelMatrixLocationBox, gl.FALSE, modelMatrixBox);
  gl.uniformMatrix4fv(
    projectionMatrixLocationBox,
    gl.FALSE,
    projectionMatrixBox
  );
  gl.uniformMatrix4fv(viewMatrixLocationBox, gl.FALSE, viewMatrixBox);

  function drawBox() {
    // використання програми шейдерів
    gl.useProgram(programBox);

    // передача матриці в шейдер
    gl.uniformMatrix4fv(modelMatrixLocationBox, gl.FALSE, modelMatrixBox);
    gl.uniformMatrix4fv(viewMatrixLocationBox, gl.FALSE, viewMatrixBox);

    // відображення
    gl.drawElements(gl.TRIANGLES, indicesBox.length, gl.UNSIGNED_SHORT, 0);
  }

  // створення програми шейдерів та прив'язка шейдерів до програми
  var programCover = initGL_2(gl);

  // використання програми шейдерів
  gl.useProgram(programCover);

  // створення буфера вершин
  var vertexBufferCover = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCover);

  // встановлення значень вершин трикутника та їх кольорів
  var verticesCover = [
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

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(verticesCover),
    gl.STATIC_DRAW
  );

  // створення буфера індексів
  var indexBufferCover = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferCover);

  // індекси вершин для створення граней квадрата
  var indicesCover = [
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
    new Uint16Array(indicesCover),
    gl.STATIC_DRAW
  );

  // встановлення покажчиків на атрибути
  var positionPointerCover = gl.getAttribLocation(
    programCover,
    "aVertexPositionCover"
  );
  gl.vertexAttribPointer(
    positionPointerCover,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(positionPointerCover);

  var colorPointerCover = gl.getAttribLocation(
    programCover,
    "aVertexColorCover"
  );
  gl.vertexAttribPointer(
    colorPointerCover,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(colorPointerCover);

  // отримання локаторів змінних
  var modelMatrixLocationCover = gl.getUniformLocation(
    programCover,
    "modelMatrixCover"
  );
  var projectionMatrixLocationCover = gl.getUniformLocation(
    programCover,
    "projectionMatrixCover"
  );
  var viewMatrixLocationCover = gl.getUniformLocation(
    programCover,
    "viewMatrixCover"
  );

  // створення та передача потрібних матриць в шейдери
  var modelMatrixCover = mat4.create();
  mat4.identity(modelMatrixCover);

  // вісь для обертання
  var edgeCenterCover = [0, -1, 1];
  // початковий кут обертання кришки
  var rotationAngleCover = -0.2;

  function animateRotationCover() {
    // застосовуємо зсув, щоб центральна точка ребра була вихідним пунктом координат
    mat4.identity(modelMatrixCover);
    mat4.translate(modelMatrixCover, modelMatrixCover, [
      -edgeCenterCover[0],
      -edgeCenterCover[1],
      -edgeCenterCover[2],
    ]);

    // обертаємо модель навколо осі, що пролягає через це ребро
    mat4.rotateX(modelMatrixCover, modelMatrixCover, rotationAngleCover);

    // застосовуємо зворотній зсув, щоб повернути куб до його вихідного положення
    mat4.translate(modelMatrixCover, modelMatrixCover, edgeCenterCover);
    mat4.translate(modelMatrixCover, modelMatrixCover, [0.0, 1.1, 0.0]);

    // Застосовуємо масштабування, щоб зробити куб плоским
    mat4.scale(modelMatrixCover, modelMatrixCover, [1.0, 0.1, 1.0]);
  }
  animateRotationCover();

  var projectionMatrixCover = mat4.create();
  mat4.perspective(projectionMatrixCover, Math.PI / 4, 1, 2, 10);

  var viewMatrixCover = mat4.create();
  rotateBoxAndCover();
  mat4.lookAt(viewMatrixCover, cameraPosition, [0, 0, 0], [0, 1, 0]);

  gl.uniformMatrix4fv(modelMatrixLocationCover, gl.FALSE, modelMatrixCover);
  gl.uniformMatrix4fv(
    projectionMatrixLocationCover,
    gl.FALSE,
    projectionMatrixCover
  );
  gl.uniformMatrix4fv(viewMatrixLocationCover, gl.FALSE, viewMatrixCover);

  function drawCover() {
    // використання програми шейдерів
    gl.useProgram(programCover);

    // передача матриці в шейдер
    gl.uniformMatrix4fv(modelMatrixLocationCover, gl.FALSE, modelMatrixCover);
    gl.uniformMatrix4fv(viewMatrixLocationCover, gl.FALSE, viewMatrixCover);

    gl.drawElements(gl.TRIANGLES, indicesCover.length, gl.UNSIGNED_SHORT, 0);
  }

  function drawScene() {
    // очистка екрану та відображення квадрата
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawCover();
    drawBox();
  }

  // запуск функції для рендерингу анімації
  drawScene();

  // Додаємо обробник події для натискання клавіші
  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowUp":
        // Обробка натискання стрілки вгору
        handleArrowUp();
        break;
      case "ArrowDown":
        // Обробка натискання стрілки вниз
        handleArrowDown();
        break;
      case "ArrowLeft":
        // Обробка натискання стрілки вліво
        handleArrowLeft();
        break;
      case "ArrowRight":
        // Обробка натискання стрілки вправо
        handleArrowRight();
        break;
      default:
        // Ігноруємо інші клавіші
        break;
    }
  });

  // Функція, яка виконується при натисканні стрілки up
  function handleArrowUp() {
    // Збільшуємо кут обертання для наступної ітерації
    if (rotationAngleCover - 0.1 > 0 || rotationAngleCover < -3) {
      console.log("Stop");
      return;
    }
    rotationAngleCover -= 0.1;
    animateRotationCover();
    drawScene();
    console.log("Стрілка up була натиснута!");
  }

  // Функція, яка виконується при натисканні стрілки down
  function handleArrowDown() {
    // Збільшуємо кут обертання для наступної ітерації
    if (rotationAngleCover >= 0 || rotationAngleCover + 0.1 < -3) {
      console.log("Stop");
      return;
    }
    rotationAngleCover += 0.1;
    animateRotationCover();
    drawScene();
    console.log("Стрілка down була натиснута!");
  }

  // Функція, яка виконується при натисканні стрілки left
  function handleArrowLeft() {
    // Оновлення кута обертання моделі
    modelRotationAngle += 0.1;

    // Оновлення матриці огляду
    rotateBoxAndCover();

    mat4.lookAt(viewMatrixBox, cameraPosition, [0, 0, 0], [0, 1, 0]);
    mat4.lookAt(viewMatrixCover, cameraPosition, [0, 0, 0], [0, 1, 0]);

    drawScene();
    console.log("Стрілка left була натиснута!");
  }

  // Функція, яка виконується при натисканні стрілки right
  function handleArrowRight() {
    // Оновлення кута обертання моделі
    modelRotationAngle -= 0.1;

    // Оновлення матриці огляду
    rotateBoxAndCover();

    mat4.lookAt(viewMatrixBox, cameraPosition, [0, 0, 0], [0, 1, 0]);
    mat4.lookAt(viewMatrixCover, cameraPosition, [0, 0, 0], [0, 1, 0]);

    drawScene();
    console.log("Стрілка right була натиснута!");
  }

  function initGL_1(gl) {
    // створення вершинного шейдера
    var boxVertexShaderSource = `
    attribute vec3 aVertexPositionBox;
    attribute vec3 aVertexColorBox;
    uniform mat4 modelMatrixBox;
    uniform mat4 projectionMatrixBox;
    uniform mat4 viewMatrixBox;
    varying vec3 vColorBox;
    void main() {
        gl_Position = projectionMatrixBox * viewMatrixBox * modelMatrixBox * vec4(aVertexPositionBox, 1.0);
        vColorBox = aVertexColorBox;
    }
  `;

    var boxVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(boxVertexShader, boxVertexShaderSource);
    gl.compileShader(boxVertexShader);

    // перевірка успішності компіляції вершинного шейдера
    if (!gl.getShaderParameter(boxVertexShader, gl.COMPILE_STATUS)) {
      console.error(
        "Помилка компіляції box вершинного шейдера:",
        gl.getShaderInfoLog(boxVertexShader)
      );
      return;
    }

    // створення фрагментного шейдера
    var boxFragmentShaderSource = `
    precision mediump float;
    varying vec3 vColorBox;
    void main() {
        gl_FragColor = vec4(vColorBox, 1.0);
    }
  `;

    var boxFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(boxFragmentShader, boxFragmentShaderSource);
    gl.compileShader(boxFragmentShader);

    // перевірка успішності компіляції фрагментного шейдера
    if (!gl.getShaderParameter(boxFragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Помилка компіляції box фрагментного шейдера:",
        gl.getShaderInfoLog(boxFragmentShader)
      );
      return;
    }

    // створення програми шейдерів та прив'язка шейдерів до програми
    var boxProgram = gl.createProgram();
    gl.attachShader(boxProgram, boxVertexShader);
    gl.attachShader(boxProgram, boxFragmentShader);
    gl.linkProgram(boxProgram);

    // перевірка успішності створення програми шейдерів
    if (!gl.getProgramParameter(boxProgram, gl.LINK_STATUS)) {
      console.error(
        "Помилка створення програми шейдерів:",
        gl.getProgramInfoLog(boxProgram)
      );
      return;
    }

    return boxProgram;
  }

  function initGL_2(gl) {
    // створення вершинного шейдера
    var coverVertexShaderSource = `
    attribute vec3 aVertexPositionCover;
    attribute vec3 aVertexColorCover;
    uniform mat4 modelMatrixCover;
    uniform mat4 projectionMatrixCover;
    uniform mat4 viewMatrixCover;
    varying vec3 vColorCover;
    void main() {
        gl_Position = projectionMatrixCover * viewMatrixCover * modelMatrixCover * vec4(aVertexPositionCover, 1.0);
        vColorCover = aVertexColorCover;
    }
  `;

    var coverVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(coverVertexShader, coverVertexShaderSource);
    gl.compileShader(coverVertexShader);

    // перевірка успішності компіляції вершинного шейдера
    if (!gl.getShaderParameter(coverVertexShader, gl.COMPILE_STATUS)) {
      console.error(
        "Помилка компіляції cover вершинного шейдера:",
        gl.getShaderInfoLog(coverVertexShader)
      );
      return;
    }

    // створення фрагментного шейдера
    var coverFragmentShaderSource = `
    precision mediump float;
    varying vec3 vColorCover;
    void main() {
        gl_FragColor = vec4(vColorCover, 1.0);
    }
  `;

    var coverFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(coverFragmentShader, coverFragmentShaderSource);
    gl.compileShader(coverFragmentShader);

    // перевірка успішності компіляції фрагментного шейдера
    if (!gl.getShaderParameter(coverFragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Помилка компіляції cover фрагментного шейдера:",
        gl.getShaderInfoLog(coverFragmentShader)
      );
      return;
    }

    // створення програми шейдерів та прив'язка шейдерів до програми
    var coverProgram = gl.createProgram();
    gl.attachShader(coverProgram, coverVertexShader);
    gl.attachShader(coverProgram, coverFragmentShader);
    gl.linkProgram(coverProgram);

    // перевірка успішності створення програми шейдерів
    if (!gl.getProgramParameter(coverProgram, gl.LINK_STATUS)) {
      console.error(
        "Помилка створення програми шейдерів:",
        gl.getProgramInfoLog(coverProgram)
      );
      return;
    }

    return coverProgram;
  }
};
