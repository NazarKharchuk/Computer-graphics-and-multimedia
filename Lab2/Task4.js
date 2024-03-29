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

  // змінна, що буде зберігати індекси точок
  let pointIndexes = [];

  // змінна, що буде зберігати індекси координат вершин кола
  let circleIndexes = [];

  // змінна, що буде зберігати значення режиму
  let isPoints = true;

  // змінна, що буде зберігати кількість точок кола
  let countCirclePoints = 30;

  // змінна, що буде означати, чи обрано центр кола
  let getCenter = false;

  // створення буферів індексів
  let pointIndexBuffer = gl.createBuffer();
  let circleIndexBuffer = gl.createBuffer();

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
      Math.random(),
      Math.random(),
      Math.random()
    );

    // перевірка умов і додавання індексів
    if (isPoints) {
      pointIndexes.push(points.length / 6 - 1);
    } else {
      if (!getCenter) {
        pointIndexes.push(points.length / 6 - 1);
        getCenter = true;
      } else {
        circleIndexes.push(pointIndexes.pop());

        let center = circleIndexes[circleIndexes.length - 1];
        let firstCirclePoint = points.length / 6 - 1;

        // знаходження радіусу кола
        var radius = Math.sqrt(
          Math.pow(points[center * 6] - points[firstCirclePoint * 6], 2) +
            Math.pow(
              points[center * 6 + 1] - points[firstCirclePoint * 6 + 1],
              2
            )
        );

        //Додавання вершин кола та їх індексів
        for (let i = 0; i <= countCirclePoints; i++) {
          let angle = (i * 2 * Math.PI) / countCirclePoints;
          let x = points[center * 6] + radius * Math.cos(angle);
          let y = points[center * 6 + 1] + radius * Math.sin(angle);
          points.push(x, y, 0.0, Math.random(), Math.random(), Math.random());
          circleIndexes.push(points.length / 6 - 1);
        }
        getCenter = false;
      }
    }

    // заповнення буфера даними
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    // заповнення буфера індексами вершин кола
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleIndexBuffer);

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(circleIndexes),
      gl.STATIC_DRAW
    );

    // малюємо кола
    for(let i = 0; i < circleIndexes.length / (countCirclePoints + 2); i++){
      gl.drawElements(gl.TRIANGLE_FAN, countCirclePoints + 2, gl.UNSIGNED_SHORT, i * (countCirclePoints + 2) * 2);
    }

    // заповнення буфера індексів точок
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointIndexBuffer);

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(pointIndexes),
      gl.STATIC_DRAW
    );

    // малюємо точки
    gl.drawElements(gl.POINTS, pointIndexes.length, gl.UNSIGNED_SHORT, 0);
  }

  // додаємо обробник подій на натискання миші
  canvas.addEventListener("mousedown", createPoint);

  // обробник написку кнопки "Режим точок"
  document.getElementById("point-mode-button").addEventListener("click", () => {
    isPoints = true;
    document.getElementById("point-mode-button").disabled = true;
    document.getElementById("circle-mode-button").disabled = false;
  });

  // обробник написку кнопки "Режим кола"
  document
    .getElementById("circle-mode-button")
    .addEventListener("click", () => {
      isPoints = false;
      countTrianglePoints = 0;
      document.getElementById("circle-mode-button").disabled = true;
      document.getElementById("point-mode-button").disabled = false;
    });
};
