window.onload = function () {
  // отримання об'єкта canvas
  let canvas = document.getElementById("canvas");

  // отримання контексту WebGL
  let gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL не підтримується вашим браузером!");
    return;
  }

  var shadowVertexShaderSource = `
  attribute vec4 a_Position;
  uniform mat4 u_MvpMatrix;
  void main() {
     gl_Position = u_MvpMatrix * a_Position;
  }
  `;

  var shadowVertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shadowVertexShader, shadowVertexShaderSource);
  gl.compileShader(shadowVertexShader);

  // перевірка успішності компіляції shadow вершинного шейдера
  if (!gl.getShaderParameter(shadowVertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "Помилка компіляції shadow вершинного шейдера:",
      gl.getShaderInfoLog(shadowVertexShader)
    );
    return;
  }

  var shadowFragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  void main() {
     const vec4 bitShift = vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0);
     const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
     vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
     rgbaDepth -= rgbaDepth.gbaa * bitMask;
     gl_FragColor = rgbaDepth;
  }
  `;

  var shadowFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shadowFragmentShader, shadowFragmentShaderSource);
  gl.compileShader(shadowFragmentShader);

  // перевірка успішності компіляції shadow фрагментного шейдера
  if (!gl.getShaderParameter(shadowFragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "Помилка компіляції shadow фрагментного шейдера:",
      gl.getShaderInfoLog(shadowFragmentShader)
    );
    return;
  }

  // створення shadow програми шейдерів та прив'язка шейдерів до програми
  var shadowProgram = gl.createProgram();
  gl.attachShader(shadowProgram, shadowVertexShader);
  gl.attachShader(shadowProgram, shadowFragmentShader);
  gl.linkProgram(shadowProgram);

  // перевірка успішності створення програми шейдерів
  if (!gl.getProgramParameter(shadowProgram, gl.LINK_STATUS)) {
    console.error(
      "Помилка створення shadow програми шейдерів:",
      gl.getProgramInfoLog(shadowProgram)
    );
    return;
  }

  var vertexShaderSource = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_MvpMatrixFromLight;
  varying vec4 v_PositionFromLight;
  varying vec4 v_Color;
  void main() {
     gl_Position = u_MvpMatrix * a_Position;
     v_PositionFromLight = u_MvpMatrixFromLight * a_Position;
     v_Color = a_Color;
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

  var fragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D u_ShadowMap;
  varying vec4 v_PositionFromLight;
  varying vec4 v_Color;
  float unpackDepth(const in vec4 rgbaDepth) {
     const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
     float depth = dot(rgbaDepth, bitShift);
     return depth;
  }
  void main() {
     vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w)/2.0 + 0.5;
     vec4 rgbaDepth=texture2D(u_ShadowMap,shadowCoord.xy);
     float depth = unpackDepth(rgbaDepth);
     float visibility = (shadowCoord.z>depth+0.0015) ? 0.5 : 1.0;
     gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
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
  var vertices = new Float32Array([
    4, -2, 2, -4, -2, 2, -4, -2, -2, 4, -2, -2, 3, 2, 1, 3, 2, -1, 0.5, 2, 1,
    0.5, 2, -1, -3, 2, 1, -3, 2, -1, -0.5, 2, 1, -0.5, 2, -1,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // створення буфера кольорів
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // встановлення кольорів
  var colors = new Float32Array([
    0.0, 0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.0, 0.5, 1.0, 0.5, 0.0,
    1.0, 0.5, 0.0, 1.0, 0.5, 0.0, 1.0, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 1.0, 0.5,
    0.0, 1.0, 0.5, 0.0, 1.0, 0.5,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // створення буфера індексів
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // індекси вершин для створення граней квадрата
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 5, 6, 7, 8, 9, 10, 9, 10, 11,
  ]);
  var numIndices = indices.length;

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // отримання локаторів змінних
  var shadow_a_Position = gl.getAttribLocation(shadowProgram, "a_Position");
  var shadow_a_Color = gl.getAttribLocation(shadowProgram, "a_Color");
  var shadow_u_MvpMatrix = gl.getUniformLocation(shadowProgram, "u_MvpMatrix");

  var a_Position = gl.getAttribLocation(program, "a_Position");
  var a_Color = gl.getAttribLocation(program, "a_Color");
  var u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
  var u_MvpMatrixFromLight = gl.getUniformLocation(
    program,
    "u_MvpMatrixFromLight"
  );
  var u_ShadowMap = gl.getUniformLocation(program, "u_ShadowMap");

  // Ініціалізація буфера фреймбуфера з розмірами 2048х2048
  var fbo = initFramebufferObject(gl, 2048, 2048);
  // Активація текстурного блоку 0
  gl.activeTexture(gl.TEXTURE0);
  // Прив'язка текстури буфера фреймбуфера
  gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

  // Встановлення кольору очищення буфера (білий)
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  // Активація тесту глибини
  gl.enable(gl.DEPTH_TEST);

  // Створення тимчасової матриці 4х4
  var tmp = new Matrix4();
  // Створення матриці проекції та огляду з точки світла
  var viewProjMatrixFromLight = new Matrix4();
  // Встановлення перспективи матриці проекції
  viewProjMatrixFromLight.perspective(70.0, 1.0, 1.0, 200.0);

  // Встановлення точки огляду тимчасової матриці
  tmp.lookAt(0, 40, 2, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  // Множення матриць огляду та проекції з точки світла
  viewProjMatrixFromLight.multiply_matrix(tmp.entries);

  // Створення нової тимчасової матриці 4х4
  tmp = new Matrix4();
  // Створення матриці проекції та огляду
  var viewProjMatrix = new Matrix4();
  // Встановлення перспективи матриці проекції
  viewProjMatrix.perspective(45, canvas.width / canvas.height, 1.0, 100.0);
  // Встановлення точки огляду тимчасової матриці
  tmp.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  // Множення матриць огляду та проекції
  viewProjMatrix.multiply_matrix(tmp.entries);

  // Створення матриці моделі-виду-проекції з точки світла
  var mvpMatrixFromLight_t = new Matrix4();

  // Прив'язка буфера фреймбуфера
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  // Встановлення розмірів вікна прив'язки буфера фреймбуфера
  gl.viewport(0, 0, 2048, 2048);
  // Очищення буфера кольору та буфера глибини
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Використання шейдерної програми для тіней
  gl.useProgram(shadowProgram);

  // Прив'язка буфера вершин
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Вказівка атрибуту позиції вершин
  gl.vertexAttribPointer(shadow_a_Position, 3, gl.FLOAT, false, 0, 0);
  // Активація атрибуту позиції вершин
  gl.enableVertexAttribArray(shadow_a_Position);
  // Прив'язка буфера індексів
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Встановлення матриці проекції-огляду з точки світла
  g_mvpMatrix.set(viewProjMatrixFromLight);
  // Множення матриці моделі на матрицю проекції-огляду
  g_mvpMatrix.multiply_matrix(g_modelMatrix.entries);
  // Передача значення матриці моделі-виду-проекції з точки світла у шейдер
  gl.uniformMatrix4fv(shadow_u_MvpMatrix, false, g_mvpMatrix.entries);
  // Виконання рендерингу об'єкта за допомогою індексів
  gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_BYTE, 0);

  // Копіювання матриці моделі-виду-проекції з точки світла
  mvpMatrixFromLight_t.set(g_mvpMatrix);

  // Зняття прив'язки буфера фреймбуфера
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  // Встановлення розмірів вікна прив'язки
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Очищення буфера кольору та буфера глибини
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Використання шейдерної програми
  gl.useProgram(program);

  // Передача значення текстурного блоку 0
  gl.uniform1i(u_ShadowMap, 0);
  // Передача значення матриці моделі-виду-проекції з точки світла у шейдер
  gl.uniformMatrix4fv(
    u_MvpMatrixFromLight,
    false,
    mvpMatrixFromLight_t.entries
  );

  // Прив'язка буфера вершин
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Вказівка атрибуту позиції вершин
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Активація атрибуту позиції вершин
  gl.enableVertexAttribArray(a_Position);
  // Перевірка наявності атрибуту кольору
  if (a_Color != undefined) {
    // Прив'язка буфера кольорів
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Вказівка атрибуту кольору
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    // Активація атрибуту кольору
    gl.enableVertexAttribArray(a_Color);
  }
  // Прив'язка буфера індексів
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Встановлення матриці проекції-огляду
  g_mvpMatrix.set(viewProjMatrix);
  // Множення матриці моделі на матрицю проекції-огляду
  g_mvpMatrix.multiply_matrix(g_modelMatrix.entries);
  // Передача значення матриці моделі-виду-проекції у шейдер
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.entries);
  // Виконання рендерингу об'єкта за допомогою індексів
  gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_BYTE, 0);
};
// Створення матриці моделі
var g_modelMatrix = new Matrix4();
// Створення матриці моделі-виду-проекції
var g_mvpMatrix = new Matrix4();
