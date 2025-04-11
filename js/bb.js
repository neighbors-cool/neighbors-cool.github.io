let canvas;
let canvasContext;
let framesPerSecond = 144; // Set to fixed 144 FPS
let frameInterval = 1000 / framesPerSecond;
const BACKGROUND_COLOR = "black";
const BASE_BALL_SPEED = 4; // Base speed without FPS scaling
const MAX_BALL_SPEED = 7; // Max speed without FPS scaling
const REFERENCE_HEIGHT = 800; // Reference height for speed scaling

// Try to enable high refresh rate mode
if (window.matchMedia) {
    // Check if the browser supports high refresh rate
    const highRefreshRate = window.matchMedia('(refresh-rate: 144)');
    if (!highRefreshRate.matches) {
        // If 144Hz not available, try for anything higher than 60Hz
        const mediumRefreshRate = window.matchMedia('(refresh-rate: higher-than-60)');
        if (mediumRefreshRate.matches) {
            // Adjust FPS to match the screen's actual refresh rate if we can't get 144Hz
            framesPerSecond = 120;
            frameInterval = 1000 / framesPerSecond;
        }
    }
}

let fpsCounter = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
const FPS_UPDATE_INTERVAL = 500;

let balls = [];
let numBalls = 1;
let paddle;
let level = 1;
let score = 0;
let angle = 0.1;
let rewardScore = 0;

let showingWinScreen = false;
let showingLoseScreen = false;
let paused = true;
let started_yet = false;
const NUMBER_OF_LIVES = 3;
let lives = NUMBER_OF_LIVES;

let bricks = [];
const BRICK_WIDTH = 60;
const BRICK_WIDTH_PADDING = 8;
const BRICK_HEIGHT_PADDING = 7;
const BRICK_HEIGHT = 20;
let brick_rows = 6;
let brick_columns = 7;
let lowestBrick = 0;

let centerScreenX;
let centerScreenY;
let distanceFromRight = 300;


window.onload = function () {
  setup();
  let clientRectLeft = canvas.getBoundingClientRect().left - document.documentElement.scrollLeft;

  requestAnimationFrame(gameLoop);

  canvas.addEventListener("mousemove", function (event) {
    paddle.pos.x = event.clientX - clientRectLeft - paddle.halfWidth;
  });
  canvas.addEventListener("click", handleClick);
  // Convert a touch move into a mousemove
  canvas.addEventListener(
    "touchmove",
    function (e) {
      // stop touch event
      e.stopPropagation();
      e.preventDefault();

      // translate to mouse event
      let clkEvt = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: e.detail,
        screenX: e.touches[0].screenX,
        screenY: e.touches[0].screenY,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
      canvas.dispatchEvent(clkEvt);
    },
    false
  );
};

function setup() {
  canvas = document.getElementById("gameCanvas");
  paddle = new Paddle();
  let dim = getViewportDimension();
  if (dim.w <= 767) {
    canvas.width = dim.w - 40;
  } else {
    canvas.width = dim.w - 60;
  }
  canvas.height = dim.h - 220;
  
  // Enable high performance rendering with explicit sync policy
  const ctx_options = {
    alpha: false,
    desynchronized: true,
    antialias: false,
    powerPreference: "high-performance",
  };
  
  canvasContext = canvas.getContext("2d", ctx_options);
  
  // Request browser to match display refresh rate
  if (canvas.style) {
    canvas.style.imageRendering = "pixelated";
  }
  
  centerScreenX = canvas.width / 2;
  centerScreenY = canvas.height / 2;

  paddle.pos.x = centerScreenX - paddle.halfWidth;
  paddle.pos.y = canvas.height - paddle.padding - paddle.height;
  brick_columns = Math.floor(canvas.width / (BRICK_WIDTH + BRICK_WIDTH_PADDING));
  brick_rows = Math.floor(canvas.height / (BRICK_HEIGHT + BRICK_HEIGHT_PADDING) / 3);
  lowestBrick = brick_rows * (BRICK_HEIGHT + BRICK_HEIGHT_PADDING) + BRICK_HEIGHT + 20;

  createBalls();
  createBricks();
  rewardScore = 1000 * level;
}

function gameLoop() {
    // Request next frame immediately to minimize delay
    requestAnimationFrame(gameLoop);

    // Update and draw
    moveEverything();
    drawEverything();
}

function moveEverything() {
  if (showingWinScreen || showingLoseScreen || paused) {
    return;
  }
  checkForWin();
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    ball.move();
    ball.checkForBrickHit();
    ball.checkForPaddleHit();
    ball.checkForBoarderHit();
    if (ball.checkForBottomScreenHit()) {
      balls.splice(i, 1);
      ball = undefined;
    }
  }
  if (balls.length === 0) {
    lives--;
    showingLoseScreen = true;
  }
}

function drawEverything() {
  // Update FPS counter
  fpsCounter++;
  const now = performance.now();
  if (now - lastFpsUpdate > FPS_UPDATE_INTERVAL) {
    currentFps = Math.round((fpsCounter * 1000) / (now - lastFpsUpdate));
    lastFpsUpdate = now;
    fpsCounter = 0;
  }

  // Draw Background
  colorRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOR);

  // Draw FPS counter
  setText("white");
  canvasContext.font = "16px Roboto"; // Smaller font for FPS
  canvasContext.fillText(currentFps + " FPS", canvas.width - 70, canvas.height - 25);
  
  // Reset font for other text
  setText("white");

  // Show lives
  canvasContext.fillText("Level: " + level + " -  Lives: " + lives, canvas.width - distanceFromRight, 25);
  canvasContext.fillText("Score: " + score, 5, 25);

  // Draw bricks
  for (let i = 0; i < bricks.length; i++) {
    bricks[i].draw();
  }

  if (showingWinScreen) {
    setText("white");
    started_yet = false;
    canvasContext.fillText("Next Level!", centerScreenX - 60, centerScreenY);
    canvasContext.fillText("Click to Continue", centerScreenX - 90, centerScreenY + 50);
    return;
  }

  if (showingLoseScreen) {
    setText("white");
    started_yet = false;
    if (lives === 0) {
      canvasContext.fillText("You lose... Score: " + score, centerScreenX - 90, centerScreenY + 20);
    } else {
      canvasContext.fillText(lives + " More Li" + (lives % 2 == 0 ? "ves" : "fe") + "!", centerScreenX - 90, centerScreenY + 20);
    }
    canvasContext.fillText("Click to Continue", centerScreenX - 90, centerScreenY + 70);
    return;
  }

  paddle.draw();
  for (let ball of balls) {
    ball.draw();
  }

  if (paused) {
    if (started_yet) {
      canvasContext.fillText("Paused", centerScreenX - 30, centerScreenY + 50);
    } else {
      canvasContext.fillText("Click/Tap to Start/Pause!", centerScreenX - 100, centerScreenY + 50);
    }
  }
}

function checkForWin() {
  showingWinScreen = bricks.length === 0;
}

// 'click/tap' to start/pause
function handleClick() {
  if (showingWinScreen) {
    if (level % 2 === 0 && lives !== 0) {
      // Give an extra life on odd levels > 1
      lives++;
    }
    level++;
    rewardScore = 1000 * level;
    showingWinScreen = false;
    paused = true;
    for (let ball of balls) {
      ball.reset();
    }
    createBricks();
    createBalls();
  } else if (showingLoseScreen) {
    showingLoseScreen = false;
    paused = true;
    createBalls();
    if (lives === 0) {
      started_yet = false;
      level = 1;
      score = 0;
      rewardScore = 1000 * level;
      lives = NUMBER_OF_LIVES;
      for (let ball of balls) {
        ball.reset();
      }
      createBricks();
    }
  } else {
    paused = !paused;
    started_yet = true;
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

// p5js constrain
function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

function setText(color) {
  canvasContext.fillStyle = color;
  if (canvas.width >= 556) {
    canvasContext.font = "30px Roboto";
    distanceFromRight = 300;
  } else {
    canvasContext.font = "22px Roboto";
    distanceFromRight = 200;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colorRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

function createBricks() {
  bricks = [];
  let leftPad = (canvas.width - brick_columns * (BRICK_WIDTH + BRICK_WIDTH_PADDING) + BRICK_WIDTH_PADDING) / 2;
  let topPad = 10;
  let hue = getRandomInt(0, 360);
  let modifyer = getRandomInt(0, 1) ? -20 : 20;
  for (let j = 1; j <= brick_rows; j++) {
    let color = "hsl(" + hue + ", 100%, 50%)";
    for (let k = 0; k < brick_columns; k++) {
      bricks.push(new Brick(k * (BRICK_WIDTH + BRICK_WIDTH_PADDING) + leftPad, j * (BRICK_HEIGHT + BRICK_HEIGHT_PADDING) + topPad, color));
    }
    if (hue + modifyer > 360 || hue + modifyer < 0) {
      modifyer *= -1;
    }
    hue += modifyer;
  }
}

function createBalls() {
  for (let i = 0; i < numBalls; i++) {
    createNewBall();
  }
}

function createNewBall() {
  let ball = new Ball();
  ball.reset();
  balls.push(ball);
}

class Vector {
  constructor(x, y) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }
  toString() {
    return "x:" + this.x + ", y:" + this.y;
  }
}

class Brick {
  constructor(x, y, color) {
    this.pos = new Vector(x, y);
    this.color = color;
  }

  draw() {
    colorRect(this.pos.x, this.pos.y, BRICK_WIDTH, BRICK_HEIGHT, this.color);
  }

  hit() {
    score += 10 * level;

    if (score >= rewardScore) {
      rewardScore += rewardScore;
      createNewBall();
    }
    bricks = bricks.filter(function (brick) {
      return this !== brick;
    }, this);
  }
}

class Paddle {
  constructor() {
    this.pos = new Vector(0, 0);
    this.width = 100;
    this.height = 10;
    this.padding = 10;
    this.halfWidth = this.width / 2;
  }
  // Draw Paddle
  draw() {
    colorRect(this.pos.x, this.pos.y, this.width, this.height, "white");
  }
}

class Ball {
  constructor() {
    this.pos = new Vector();
    this.vel = new Vector();
    this.radius = 10;
    this.colorControl = 0;
    this.color = "";
    this.setBallBoarder();
    this.baseSpeed = BASE_BALL_SPEED;
    this.maxSpeed = MAX_BALL_SPEED;
    this.updateSpeedMultiplier();
  }

  updateSpeedMultiplier() {
    // Scale speed based on screen height but keep original speed scale
    this.speedMultiplier = this.baseSpeed + (Math.min(canvas.height, REFERENCE_HEIGHT) / REFERENCE_HEIGHT) * (this.maxSpeed - this.baseSpeed);
  }

  setBallBoarder() {
    this.top = this.pos.y - this.radius;
    this.bottom = this.pos.y + this.radius;
    this.left = this.pos.x - this.radius;
    this.right = this.pos.x + this.radius;
  }

  // Draw Ball
  draw() {
    if (this.colorControl % (framesPerSecond / 5) === 0) {
      this.color = "hsl(" + getRandomInt(0, 360) + ", 100%, 50%)";
      this.colorControl = 0;
    }
    this.colorControl++;
    canvasContext.fillStyle = this.color;
    canvasContext.beginPath();
    // centerX, centerY, radius, startDraw, endDraw, counterClockwise
    canvasContext.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
    canvasContext.fill();
  }

  // Move the ball
  move() {
    // Set default motion
    if (this.vel.x === 0) {
      this.vel.x--;
    }
    if (this.vel.y === 0) {
      this.vel.y--;
    }

    // Normalize the velocity vector
    let hyp = Math.hypot(this.vel.x, this.vel.y);
    
    // Move ball based on normalized direction and speed
    this.pos.x += (this.vel.x / hyp) * this.speedMultiplier;
    this.pos.y += (this.vel.y / hyp) * this.speedMultiplier;

    this.setBallBoarder();
  }

  reset() {
    this.vel.x = getRandomInt(-2, 2);
    this.vel.y = getRandomInt(-3, -4) - level;
    this.pos.x = centerScreenX - this.radius;
    this.pos.y = canvas.height - paddle.padding - paddle.height - this.radius - 10;
    this.updateSpeedMultiplier();
  }

  checkForBrickHit() {
    // First check to see if ball is at brick height
    if (this.top > lowestBrick) {
      return false;
    }

    // Check if Brick Hit
    for (let brick of bricks) {
      // Check that the ball is vertically in line with the brick
      if (this.right >= brick.pos.x && this.left <= brick.pos.x + BRICK_WIDTH) {
        // Check that the ball is horizontally in line with the brick
        if (this.bottom >= brick.pos.y && this.top <= brick.pos.y + BRICK_HEIGHT) {
          brick.hit();

          // Decide where the Ball hit the Brick
          let distFromLeftEdge = Math.abs(this.right - brick.pos.x);
          let distFromRightEdge = Math.abs(this.left - (brick.pos.x + BRICK_WIDTH));
          let distFromTopEdge = Math.abs(this.bottom - brick.pos.y);
          let distFromBottomEdge = Math.abs(this.top - (brick.pos.y + BRICK_HEIGHT));
          let minDist = Math.min(distFromLeftEdge, distFromRightEdge, distFromTopEdge, distFromBottomEdge);
          if (minDist === distFromTopEdge) {
            // Bounce Up
            this.vel.y = -Math.abs(this.vel.y);
          } else if (minDist === distFromBottomEdge) {
            // Bounce Down
            this.vel.y = Math.abs(this.vel.y);
          } else if (minDist === distFromLeftEdge) {
            // Bounce Left
            this.vel.x = -Math.abs(this.vel.x);
          } else {
            // Bounce Right
            this.vel.x = Math.abs(this.vel.x);
          }
          brick = undefined;
          return true;
        }
      }
    }
    return false;
  }

  checkForPaddleHit() {
    if (this.right >= paddle.pos.x && this.left <= paddle.pos.x + paddle.width && this.bottom >= paddle.pos.y - paddle.height / 2) {
      // Ball is colliding with paddle
      this.vel.y = -Math.abs(this.vel.y);
      let deltaX = this.pos.x - (paddle.pos.x + paddle.halfWidth - paddle.halfWidth / 6);
      this.vel.x = Math.round(deltaX * angle);
      return true;
    }
    return false;
  }

  checkForBottomScreenHit() {
    if (this.bottom >= canvas.height) {
      // Ball hit bottom of screen
      return true;
    }
    return false;
  }

  checkForBoarderHit() {
    // Check for Top Screen Border Collision
    if (this.top <= 0) {
      this.vel.y = Math.abs(this.vel.y);
      return true;
    }
    // Check for Left or Right Screen Border Collision
    if (this.right >= canvas.width) {
      // Right Screen, Bounce Left
      this.vel.x = -Math.abs(this.vel.x);
      return true;
    } else if (this.left <= 0) {
      // Left Screen Bounce Right
      this.vel.x = Math.abs(this.vel.x);
      return true;
    }
    return false;
  }
}
