const BASE_TAIL = 5;
const BLOCK_SIZE = 20;
const APPLE_SIZE = 15;
let canvas;
let canvasContext;
let framesPerSecond = 10;
let headX = 5;
let headY = 5;
let appleX = 15;
let appleY = 15;
let speedX = 1;
let speedY = 0;
let trail = [];
let tail = BASE_TAIL;
let highScore = 0;
let block_columns = 20;
let block_rows = 20;
let started_yet = false;
let paused = true;

let prevX = 0;
let prevY = 0;

let lastTimestamp = 0;
const frameInterval = 1000 / framesPerSecond;

window.onload = function () {
  setup();
  requestAnimationFrame(gameLoop);
  canvas.addEventListener("keydown", keyPush);
  canvas.addEventListener("click", handleClick);
  document.addEventListener("touchstart", function (e) {
    // stop touch event
    e.stopPropagation();
    e.preventDefault();
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });
  canvas.addEventListener(
    "touchmove",
    function (e) {
      // stop touch event
      e.stopPropagation();
      e.preventDefault();

      let evt;
      let diffX = prevX - e.touches[0].clientX;
      let diffY = prevY - e.touches[0].clientY;
      if (Math.max(Math.abs(diffX), Math.abs(diffY)) == Math.abs(diffX)) {
        // X Moved Most
        if (diffX > 0) {
          // Move Left
          evt = new KeyboardEvent("keydown", { key: "ArrowLeft" });
        } else {
          // Move Right
          evt = new KeyboardEvent("keydown", { key: "ArrowRight" });
        }
      } else {
        // Y Moved Most
        if (diffY > 0) {
          // Move Up
          evt = new KeyboardEvent("keydown", { key: "ArrowUp" });
        } else {
          // Move Down
          evt = new KeyboardEvent("keydown", { key: "ArrowDown" });
        }
      }
      canvas.dispatchEvent(evt);
    },
    false
  );
};

function setup() {
  canvas = document.getElementById("gameCanvas");
  let dim = getViewportDimension();
  if (dim.w <= 767) {
    canvas.width = dim.w - 40;
  } else {
    canvas.width = dim.w - 60;
  }
  canvas.height = dim.h - 220;
  canvasContext = canvas.getContext("2d");
  block_columns = Math.floor(canvas.width / BLOCK_SIZE);
  block_rows = Math.floor(canvas.height / BLOCK_SIZE);

  headX = Math.floor(Math.random() * block_columns);
  headY = Math.floor(Math.random() * block_rows);
  appleX = Math.floor(Math.random() * block_columns);
  appleY = Math.floor(Math.random() * block_rows);

  moveEverything();
  drawEverything();
}

function setText() {
  canvasContext.fillStyle = "white";
  if (canvas.width >= 556) {
    canvasContext.font = "30px Roboto";
  } else {
    canvasContext.font = "22px Roboto";
  }
}

function getViewportDimension() {
  let e = window,
    a = "inner";
  if (!("innerWidth" in window)) {
    a = "client";
    e = document.documentElement || document.body;
  }
  return { w: e[a + "Width"], h: e[a + "Height"] };
}

function disableScroll() {
  scrollTop = document.documentElement.scrollTop;
  window.onscroll = function () {
    window.scrollTo(0, scrollTop);
  };
}

function enableScroll() {
  window.onscroll = function () {};
}

function moveEverything() {
  // Update the head location
  headX += speedX;
  headY += speedY;

  // Wrap the screen if necessary
  if (headX < 0) {
    headX = block_columns - 1;
  }
  if (headX > block_columns - 1) {
    headX = 0;
  }
  if (headY < 0) {
    headY = block_rows - 1;
  }
  if (headY > block_rows - 1) {
    headY = 0;
  }

  // Move head forward
  trail.push({ x: headX, y: headY });

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
  canvasContext.fillText((tail - BASE_TAIL).toLocaleString() + " : " + highScore.toLocaleString(), 40, 40);

  // Draw body
  canvasContext.fillStyle = "lime";
  for (let i = 0; i < trail.length; i++) {
    canvasContext.fillRect(trail[i].x * BLOCK_SIZE, trail[i].y * BLOCK_SIZE, APPLE_SIZE, APPLE_SIZE);
    if (i < trail.length - 1 && trail[i].x == headX && trail[i].y == headY) {
      // Hit self
      if (tail - BASE_TAIL > highScore) {
        highScore = tail - BASE_TAIL;
      }
      tail = BASE_TAIL;
    }
  }

  // Found Apple!
  if (appleX == headX && appleY == headY) {
    tail++;
    appleX = Math.floor(Math.random() * block_columns);
    appleY = Math.floor(Math.random() * block_rows);
  }

  // Draw Apple
  canvasContext.fillStyle = "red";
  canvasContext.fillRect(appleX * BLOCK_SIZE, appleY * BLOCK_SIZE, APPLE_SIZE, APPLE_SIZE);

  if (paused) {
    setText();
    if (!started_yet) {
      canvasContext.fillText("Click/Tap to Start/Pause!", canvas.width / 2 - 130, (block_rows / 3) * BLOCK_SIZE);
    }
  }
}

function handlePause() {
  started_yet = true;
  if (paused) {
    paused = false;
    disableScroll();
  } else {
    paused = true;
    setText();
    canvasContext.fillText("Paused", canvas.width / 2 - 40, (block_rows / 3) * BLOCK_SIZE);
    enableScroll();
  }
}

function handleClick(evt) {
  evt.preventDefault();
  handlePause();
}

function keyPush(evt) {
  evt.preventDefault();
  switch (evt.key) {
    case "ArrowLeft":
      if (speedX !== 1) {
        speedX = -1;
        speedY = 0;
      }
      break;
    case "ArrowUp":
      if (speedY !== 1) {
        speedX = 0;
        speedY = -1;
      }
      break;
    case "ArrowRight":
      if (speedX !== -1) {
        speedX = 1;
        speedY = 0;
      }
      break;
    case "ArrowDown":
      if (speedY !== -1) {
        speedX = 0;
        speedY = 1;
      }
      break;
    case " ": //Space
      handlePause();
  }
}

function gameLoop(timestamp) {
  // Calculate time elapsed since last frame
  const elapsed = timestamp - lastTimestamp;

  // Only update if enough time has passed
  if (elapsed > frameInterval) {
    if (!paused) {
      moveEverything();
      drawEverything();
    }
    lastTimestamp = timestamp - (elapsed % frameInterval);
  }

  requestAnimationFrame(gameLoop);
}
