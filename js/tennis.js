var canvas;
var canvasContext;
var ballX = 0;
var ballY = 0;
var ballSpeedX = 10;
var ballSpeedY = 4;

var framesPerSecond = 30;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;
var started_yet = false;
var paused = true;

var paddle1Y = 250;
var paddle2Y = 250;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDING = 5;
const BLOCK_SIZE = 20;

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
                (Math.floor(canvas.width / BLOCK_SIZE) / 3) * BLOCK_SIZE,
                (Math.floor(canvas.height / BLOCK_SIZE) / 3) * BLOCK_SIZE
            );
        }
    }, 1000 / framesPerSecond);
    document.addEventListener("keydown", keyPush);

    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2);
    });
};

function setup() {
  canvas = document.getElementById("gameCanvas");
  var dim = getViewportDimension();
  canvas.width = dim.w - 20;
  canvas.height = dim.h - 140;
  canvasContext = canvas.getContext("2d");
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  moveEverything();
  drawEverything();
}

function getViewportDimension() {
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {w:e[a + 'Width'], h:e[a + 'Height']};
}

function setText() {
  canvasContext.fillStyle = "white";
  canvasContext.font = "30px Roboto";
}

function handleMouseClick(evt) {
    if (showingWinScreen) {
        player1Score = 0;
        player2Score = 0;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        showingWinScreen = false;
    }
}

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function ballReset() {
    if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        showingWinScreen = true;
        return;
    }

    ballSpeedX = -ballSpeedX;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function computerMovement() {
    var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT / 2)
    if (paddle2YCenter < ballY - 35) {
        paddle2Y += 5;
    } else if (paddle2YCenter > ballY + 35) {
        paddle2Y -= 5;
    }
}

function moveEverything() {
    if (showingWinScreen) {
        return;
    }
    computerMovement();

    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballX <= PADDING + PADDLE_WIDTH) {
        if (ballX <= 0) {
            player2Score++; // Must call before ballReset()
            ballReset();
        } else if (ballY > paddle1Y && ballY < (paddle1Y + PADDLE_HEIGHT)) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        }
    }
    if (ballX >= canvas.width - PADDING - PADDLE_WIDTH) {
        if (ballX >= canvas.width) {
            player1Score++; // Must call before ballReset()
            ballReset();
        } else if (ballY > paddle2Y && ballY < (paddle2Y + PADDLE_HEIGHT)) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        }
    }
    if (ballY >= canvas.height || ballY <= 0) {
        ballSpeedY = -ballSpeedY;
    }
}

function drawNet() {
    for (var i = 0; i < canvas.height; i += 40) {
        colorRect(canvas.width / 2 - 1, i, 2, 20, 'white');
    }
}

function drawEverything() {
    // Draw Background
    colorRect(0, 0, canvas.width, canvas.height, 'black');
    if (showingWinScreen) {
        setText();
        if (player1Score >= WINNING_SCORE) {
            canvasContext.fillText("You Won!", 350, 200);
        } else if (player2Score >= WINNING_SCORE) {
            canvasContext.fillText("You lost...", 350, 200);
        }
        canvasContext.fillText("Click to Continue", 350, 500);
        return;
    }

    // Draw Net
    drawNet();

    // Player Paddle
    colorRect(PADDING, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    // Computer Paddle
    colorRect(canvas.width - PADDLE_WIDTH - PADDING, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    // Draw Ball
    colorCircle(ballX, ballY, 10, 'white');

    setText();
    canvasContext.fillText(player1Score, 100, 100);
    canvasContext.fillText(player2Score, canvas.width - 100, 100);

    if(paused) {
      setText();
      if(!started_yet) {
        canvasContext.fillText(
          "Press Space to Start/Pause!",
          (Math.floor(canvas.width / BLOCK_SIZE) / 3) * BLOCK_SIZE,
          (Math.floor(canvas.height / BLOCK_SIZE) / 3) * BLOCK_SIZE
        );
      }
    }
}

function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}

function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    // centerX, centerY, radius, startDraw, endDraw, counterClockwise
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function keyPush(evt) {
  switch (evt.keyCode) {
    case 32: //Space
      paused = !paused;
      started_yet = true;
      break;
  }
}