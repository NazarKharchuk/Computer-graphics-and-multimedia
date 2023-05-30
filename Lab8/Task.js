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
        attribute vec3 aNormal;
        uniform mat4 modelMatrix;
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        varying vec3 v_position;
        varying vec3 v_normal;
        void main() {
            vec4 pos = vec4(aVertexPosition, 1.0);
            vec4 normal = vec4(aNormal, 0.0);

            v_position = (viewMatrix * modelMatrix * pos).xyz;
            v_normal = normalize((viewMatrix * modelMatrix * normal).xyz);

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
        varying vec3 v_position;
        varying vec3 v_normal;

        void main() {
          vec3 u_light_position = vec3(5.0, 5.0, 0.0);  // розташування джерела світла
          vec3 u_ambient_color = vec3(0.0, 0.0, 1.0);   // ambient навколишній колір сцени
          vec3 u_diffuse_color = vec3(0.0, 1.0, 0.0);   // diffuse дифузний колір поверхні
          vec3 u_specular_color = vec3(0.5, 1.0, 0.0);  // specular дзеркальний колір поверхні
          float u_shininess = 2.0;      // shininess блиск поверхні

          // Розрахувати вектори для розрахунків затемнення
          vec3 L = normalize(u_light_position - v_position);
          vec3 N = normalize(v_normal);
          vec3 V = normalize(-v_position);
        
          // Розрахувати дифузну складову
          float diffuse = max(dot(N, L), 0.0);
          vec3 diffuse_color = u_diffuse_color * diffuse;
        
          // Розрахувати дзеркальний компонент
          vec3 R = reflect(-L, N);
          float specular = pow(max(dot(R, V), 0.0), u_shininess);
          vec3 specular_color = u_specular_color * specular;
          
          // Затемнення Ламберта для дифузної складової
          vec3 lambertian = u_ambient_color + diffuse_color;
    
          // Затемнення Блінна-Фонга для дзеркальної складової
          vec3 blinnPhong = lambertian + specular_color;
    
          gl_FragColor = vec4(blinnPhong, 1.0);
        
          //gl_FragColor = vec4(color, 1.0);
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
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Left
    -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

    // Right
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,

    // Front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

    // Back
    1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

    // Bottom
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
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
  gl.vertexAttribPointer(positionPointer, 3, gl.FLOAT, gl.FALSE, 0, 0);
  gl.enableVertexAttribArray(positionPointer);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  var normalPointer = gl.getAttribLocation(program, "aNormal");
  gl.vertexAttribPointer(normalPointer, 3, gl.FLOAT, gl.FALSE, 0, 0);
  gl.enableVertexAttribArray(normalPointer);

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
  mat4.perspective(projectionMatrix, Math.PI / 4, 1, 2, 10);

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
