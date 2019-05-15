const BASE_TAIL = 5;
const BLOCK_SIZE = 20;
const APPLE_SIZE = 15;
var canvas;
var canvasContext;
var framesPerSecond = 20;
var headX = 5;
var headY = 5;
var appleX = 15;
var appleY = 15;
var speedX = 0;
var speedY = 0;
var trail = [];
var tail = BASE_TAIL;
var highScore = 0;
var block_columns = 20;
var block_rows = 20;
var started_yet = false;
var paused = true;

window.onload = function() {
  setup();
  setInterval(function() {
    if(!paused) {
      moveEverything();
      drawEverything();
    } else if(started_yet) {
      setText();
      canvasContext.fillText(
        "Paused",
        (block_columns / 3) * BLOCK_SIZE,
        (block_rows / 3) * BLOCK_SIZE
      );
    }
  }, 1000 / framesPerSecond);
  document.addEventListener("keydown", keyPush);
};

function setup() {
  canvas = document.getElementById("gameCanvas");
  var dim = getViewportDimension();
  canvas.width = dim.w - 20;
  canvas.height = dim.h - 140;
  canvasContext = canvas.getContext("2d");
  block_columns = Math.floor(canvas.width / BLOCK_SIZE);
  block_rows = Math.floor(canvas.height / BLOCK_SIZE);

  appleX = Math.floor(Math.random() * block_columns);
  appleY = Math.floor(Math.random() * block_rows);

  moveEverything();
  drawEverything();
}

function setText() {
  canvasContext.fillStyle = "white";
  canvasContext.font = "30px Roboto";
}

function getViewportDimension() {
  var e = window, a = "inner";
  if(!("innerWidth" in window)) {
    a = "client";
    e = document.documentElement || document.body;
  }
  return {
    w: e[a + "Width"],
    h: e[a + "Height"]
  };
}

function moveEverything() {
  // Update the head location
  headX += speedX;
  headY += speedY;

  // Wrap the screen if necessary
  if(headX < 0) {
    headX = block_columns - 1;
  }
  if(headX > block_columns - 1) {
    headX = 0;
  }
  if(headY < 0) {
    headY = block_rows - 1;
  }
  if(headY > block_rows - 1) {
    headY = 0;
  }

  // Move head forward
  trail.push({x:headX, y:headY});

  // 'move tail forward' (remove where tail used to be)
  while (trail.length > tail) {
    trail.shift();
  }
}

function drawEverything() {
  // Draw background
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Score
  setText();
  canvasContext.fillText((tail - BASE_TAIL).toLocaleString() + ' : ' + highScore.toLocaleString(), 20, 20);

  // Draw body
  canvasContext.fillStyle = "lime";
  for (var i = 0; i < trail.length; i++) {
    canvasContext.fillRect(
      trail[i].x * BLOCK_SIZE,
      trail[i].y * BLOCK_SIZE,
      APPLE_SIZE,
      APPLE_SIZE
    );
    if(i<trail.length-1 && trail[i].x == headX && trail[i].y == headY) {
      // Hit self
      if((tail - BASE_TAIL) > highScore) {
        highScore = (tail - BASE_TAIL);
      }
      tail = BASE_TAIL;
    }
  }

  // Found Apple!
  if(appleX == headX && appleY == headY) {
    tail++;
    appleX = Math.floor(Math.random() * block_columns);
    appleY = Math.floor(Math.random() * block_rows);
  }

  // Draw Apple
  canvasContext.fillStyle = "red";
  console.log(appleX);
  canvasContext.fillRect(
    appleX * BLOCK_SIZE,
    appleY * BLOCK_SIZE,
    APPLE_SIZE,
    APPLE_SIZE
  );

  if(paused) {
    setText();
    if(!started_yet) {
      canvasContext.fillText(
        "Press Space to Start/Pause!",
        (block_columns / 3) * BLOCK_SIZE,
        (block_rows / 3) * BLOCK_SIZE
      );
    }
  }
}

function keyPush(evt) {
  switch (evt.keyCode) {
    case 37: //UP
      if(speedX !== 1) {
        speedX = -1;
        speedY = 0;
      }
      break;
    case 38: //LEFT
      if(speedY !== 1) {
        speedX = 0;
        speedY = -1;
      }
      break;
    case 39: //DOWN
      if(speedX !== -1) {
        speedX = 1;
        speedY = 0;
      }
      break;
    case 40: //RIGHT
      if(speedY !== -1) {
        speedX = 0;
        speedY = 1;
      }
      break;
    case 32: //Space
      paused = !paused;
      started_yet = true;
      break;
  }
}
