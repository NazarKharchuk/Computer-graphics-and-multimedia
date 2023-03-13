"use strict";

//Отримуємо координати прямокутника канвасу
let canvas = document.getElementById("my-canvas");
let context = canvas.getContext("2d");

//Масив, що містить кольори для точок
let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

//Отримуємо координати прямокутника канвасу
let rect = canvas.getBoundingClientRect();

//Функція, що створює точку на місці курсора
function createPoint(event) {
  //Виправляємо позицію курсора в межах прямокутника канвасу
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  //Рандомно вибираємо колір точки
  let color = colors[Math.floor(Math.random() * colors.length)];

  //Створюємо точку
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, 10, 0, 2 * Math.PI);
  context.fill();
}

//Додаємо обробник подій на натискання миші
canvas.addEventListener("mousedown", createPoint);
