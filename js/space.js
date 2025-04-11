let canvas;
let canvasContext;
let framesPerSecond = 60;
let centerScreenX;
let centerScreenY;
const stars = [];
const numberOfStars = 150;
const maxStarSize = 4;
const maxStarSpeed = 300;
const backgroundColor = "black";

window.onload = function () {
  setup();
  setInterval(function () {
    drawEverything();
    moveEverything();
  }, 1000 / framesPerSecond);
};

function getViewportDimension() {
  let e = window,
    a = "inner";
  if (!("innerWidth" in window)) {
    a = "client";
    e = document.documentElement || document.body;
  }
  return { w: e[a + "Width"], h: e[a + "Height"] };
}

function setup() {
  canvas = document.getElementById("gameCanvas");
  let dim = getViewportDimension();
  canvas.width = dim.w;
  canvas.height = dim.h - 220;
  canvasContext = canvas.getContext("2d");
  centerScreenX = canvas.width / 2;
  centerScreenY = canvas.height / 2;

  drawEverything();
  moveEverything();
}

function moveEverything() {
  stars.forEach((star) => star.move());
}

function drawEverything() {
  // Draw background
  canvasContext.fillStyle = backgroundColor;
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  if (stars.length <= numberOfStars) {
    stars.push(new Star());
  }
  stars.forEach((star) => star.draw());
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function angle(cx, cy, ex, ey) {
  let dy = ey - cy;
  let dx = ex - cx;
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  return theta;
}

// Scale min/max to a/b, return scaled X
function scale(x, a, b, min, max) {
  return ((b - a) * (x - min)) / (max - min) + a;
}

class Vector {
  constructor(x, y) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }
}

class Star {
  constructor() {
    this.pos = new Vector();
    this.vel = new Vector();
    this.rad = new Vector();
    this.speed;
    this.radius;
    this.color;
    this.reset();
  }

  setStarBoarder() {
    this.top = this.pos.y - this.radius;
    this.bottom = this.pos.y + this.radius;
    this.left = this.pos.x - this.radius;
    this.right = this.pos.x + this.radius;
  }

  updateColor() {
    const hue = scale(this.radius, 130, 255, 0.01, maxStarSize);
    const light = scale(this.radius, 1, 100, 0.01, maxStarSize);
    this.color = "hsl(" + hue + ", 50%, " + light + "%)";
  }

  // Draw Star
  draw() {
    this.updateColor();
    canvasContext.fillStyle = this.color;
    canvasContext.beginPath();
    // centerX, centerY, radius, startDraw, endDraw, counterClockwise
    canvasContext.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
    canvasContext.fill();
  }

  // Move the star
  move() {
    if (this.checkForBoarderHit()) {
      this.reset();
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    if (this.radius < maxStarSize) {
      this.radius += 0.02;
    }
    if (this.speed < maxStarSpeed) {
      this.speed += 2;
      this.vel.x = (this.rad.x * this.speed) / framesPerSecond;
      this.vel.y = (this.rad.y * this.speed) / framesPerSecond;
    }
    this.setStarBoarder();
  }

  reset() {
    this.radius = getRandomFloat(0.01, maxStarSize / 4);
    this.updateColor();
    this.speed = 1;
    this.pos.x = getRandomFloat(0, canvas.width);
    this.pos.y = getRandomFloat(0, canvas.height);

    let rads = angle(centerScreenX, centerScreenY, this.pos.x, this.pos.y);
    this.rad.x = Math.cos(rads);
    this.rad.y = Math.sin(rads);
    this.vel.x = (this.rad.x * this.speed) / framesPerSecond;
    this.vel.y = (this.rad.y * this.speed) / framesPerSecond;
  }

  checkForBoarderHit() {
    return this.top <= 0 || this.bottom >= canvas.height || this.right >= canvas.width || this.left <= 0;
  }
}
