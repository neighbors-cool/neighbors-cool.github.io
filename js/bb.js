var canvas;
var canvasContext;
var framesPerSecond = 50;
var ballX = 0;
var ballY = 0;
var ballSpeedX = 0;
var ballSpeedY = 0;
const BALL_RADIUS = 10;
var ballColorControl = 0;
var ballColor = '';

var showingWinScreen = false;
var paused = true;
var started_yet = false;
const NUMBER_OF_LIVES = 3;
var lives = NUMBER_OF_LIVES;

var paddleY = 0;
var paddleX = 0;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDING = 5;

var bricks = [];
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
var brick_rows = 6;
var brick_columns = 7;

var centerScreenX;
var centerScreenY;
var clientRectLeft;
var textStartX;

var times = {};

window.onload = function () {
    setup();
    var clientRectLeft = canvas.getBoundingClientRect().left - document.documentElement.scrollLeft;

    reset();
    createBricks();
    setInterval(function () {
        // var now = new Date().getTime();
        moveEverything();
        drawEverything();
        // var execTime = (new Date().getTime() - now);
        // if(times.hasOwnProperty(execTime)) {
        //     times[execTime] += 1;
        // } else {
        //     times[execTime] = 1;
        // }
    }, (1000 / framesPerSecond));

    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('mousemove', function (evt) {
        // if (!paused) {
            paddleX = evt.clientX - clientRectLeft - (PADDLE_WIDTH / 2);
        // }
    });
};

function setup() {
    canvas = document.getElementById('gameCanvas');
    var dim = getViewportDimension();
    canvas.width = dim.w - 20;
    canvas.height = dim.h - 140;
    canvasContext = canvas.getContext('2d');
    
    paddleX = centerScreenX;
    paddleY = canvas.height - PADDING - PADDLE_HEIGHT;
    centerScreenX = canvas.width / 2;
    centerScreenY = canvas.height / 2;
    textStartX = centerScreenX - 20;
    brick_columns = Math.floor(canvas.width / (BRICK_WIDTH + 10));
    brick_rows = (Math.floor(brick_columns / 3) < 6 ? 6 : Math.floor(brick_columns / 3));
    if(((BRICK_HEIGHT + 5) * brick_rows) > (canvas.height / 2)) {
        brick_rows = Math.ceil(brick_rows / 2);
    }
}

function getViewportDimension() {
    var e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {w:e[a + 'Width'], h:e[a + 'Height']};
}

function moveEverything() {
    checkForWin();
    if (showingWinScreen || paused) {
        return;
    }
    // Move the ball
    ballX += ballSpeedX;
    if (ballSpeedY === 0) {
        ballSpeedY++;
    }
    ballY += ballSpeedY;

    // Check if Brick Hit
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        // Make Sure Brick is Visible
        if (brick.visible) {
            // Check if Ball Collided with Brick
            // Check that the ball is vertically over the brick
            if ((ballX + BALL_RADIUS) >= brick.x && (ballX - BALL_RADIUS) <= (brick.x + BRICK_WIDTH)) {
                // Check that the ball is horizontally in line with the brick
                if ((ballY + BALL_RADIUS) >= brick.y && (ballY - BALL_RADIUS) <= (brick.y + BRICK_HEIGHT)) {
                    // Make Brick Invisible
                    brick.visible = false;
                    // Decide where the Ball hit the Brick
                    let distFromLeftEdge = Math.abs((ballX + BALL_RADIUS) - brick.x);
                    let distFromRightEdge = Math.abs((ballX - BALL_RADIUS) - (brick.x + BRICK_WIDTH));
                    let distFromTopEdge = Math.abs((ballY + BALL_RADIUS) - brick.y);
                    let distFromBottomEdge = Math.abs((ballY - BALL_RADIUS) - (brick.y + BRICK_HEIGHT));
                    let minDist = Math.min(distFromLeftEdge, distFromRightEdge, distFromTopEdge, distFromBottomEdge); 
                    if (minDist === distFromTopEdge) {
                        // Bounce Up
                        ballSpeedY = -Math.abs(ballSpeedY);
                    } else if(minDist === distFromBottomEdge) {
                        // Bounce Down
                        ballSpeedY = Math.abs(ballSpeedY);
                    } else if(minDist === distFromLeftEdge) {
                        // Bounce Left
                        ballSpeedX = -Math.abs(ballSpeedX);
                    } else {
                        // Bounce Right
                        ballSpeedX = Math.abs(ballSpeedX);
                    }
                    return;
                }
            }
        }
    }

    // Check For Screen Border or Paddle Collision
    if ((ballY + BALL_RADIUS) >= canvas.height) {
        // Ball hit bottom of screen
        lives--; // Must call before reset()
        reset();
        paused = true;
        return;
    }
    if ((ballX + BALL_RADIUS) >= paddleX && (ballX - BALL_RADIUS) < (paddleX + PADDLE_WIDTH) && (ballY + BALL_RADIUS) >= paddleY) {
        // Ball is colliding with paddle
        ballSpeedY = -Math.abs(ballSpeedY);
        let deltaX = ballX - (paddleX + (PADDLE_WIDTH / 2));
        ballSpeedX = deltaX * 0.4;
        return;
    }
    // Check for Top Screen Border Collision
    if ((ballY - BALL_RADIUS) <= 0) {
        ballSpeedY = Math.abs(ballSpeedY);
    }
    // Check for Left or Right Screen Border Collision
    if ((ballX + BALL_RADIUS) >= canvas.width) {
        // Right Screen, Bounce Left
        ballSpeedX = -Math.abs(ballSpeedX);
    } else if ((ballX - BALL_RADIUS) <= 0) {
        // Left Screen Bounce Right
        ballSpeedX = Math.abs(ballSpeedX);
    }
}

function drawEverything() {
    // Draw Background
    colorRect(0, 0, canvas.width, canvas.height, 'black');
    // Show lives
    canvasContext.fillStyle = 'white';
    canvasContext.fillText('Lives: ' + lives, textStartX, centerScreenY);
    // Draw bricks
    drawBricks();
    if (showingWinScreen) {
        canvasContext.fillStyle = 'white';
        if (lives === 0) {
            canvasContext.fillText('You lose...', textStartX, centerScreenY + 50);
        } else if (lives > 0) {
            canvasContext.fillText('You Win!', textStartX, centerScreenY + 50);
        }
        canvasContext.fillText('Click to Continue', textStartX, centerScreenY + 100);
        return;
    }
    // Draw Paddle
    colorRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    // Draw Ball
    if ((ballColorControl % (framesPerSecond / 5)) === 0) {
        ballColor = getRandomColor();
    }
    ballColorControl++;
    colorCircle(ballX, ballY, ballColor);

    if (paused) {
        if(!started_yet) {
            canvasContext.fillText('Start!', textStartX, centerScreenY + 100);
            started_yet = true;
        } else {
            canvasContext.fillText('Paused', textStartX, centerScreenY + 100);
        }
    }
}

function checkForWin() {
    for (let i = 0; i < bricks.length; i++) {
        if (bricks[i].visible) {
            return;
        }
    }
    showingWinScreen = true;
}

function reset() {
    if (lives === 0) {
        showingWinScreen = true;
        return;
    }
    if (getRandomInt(1, 2) === 1) {
        ballSpeedX = getRandomInt(-10, -5);
    } else {
        ballSpeedX = getRandomInt(5, 10);
    }
    ballSpeedY = getRandomInt(6, 9) * -1;
    ballX = centerScreenX - BALL_RADIUS;
    ballY = canvas.height - PADDING - PADDLE_HEIGHT - BALL_RADIUS - 10;
}

function handleMouseClick(evt) {
    if (showingWinScreen) {
        lives = NUMBER_OF_LIVES;
        ballX = centerScreenX;
        ballY = canvas.height - PADDING - PADDLE_HEIGHT - BALL_RADIUS - 10;
        ballSpeedY = getRandomInt(6, 9) * -1;
        showingWinScreen = false;
        paused = true;
        createBricks();
    } else {
        if (paused) {
            paused = false;
        } else {
            paused = true;
            // var keys = [];
            // for (var key in times) {
            //     if (times.hasOwnProperty(key)) {
            //         keys.push(key);
            //     }
            // }
            // keys.sort ();
            // for (i in keys) {
            //     console.log(keys[i] +"="+times[keys[i]]);
            // }
        }
    }
}

function drawBricks() {
    let color = '';
    for (let i = 0; i < bricks.length; i++) {
        // set color
        if (bricks[i].visible) {
            color = bricks[i].color;
        } else {
            color = 'black';
        }
        //Draw Brick
        colorRect(bricks[i].x, bricks[i].y, BRICK_WIDTH, BRICK_HEIGHT, color);
    }
}

function createBricks() {
    var leftPad = (canvas.width - (brick_columns * (BRICK_WIDTH + 10))) / 2;
    bricks = [];
    let chosenColors = '';
    for (let j = 1; j < brick_rows; j++) {
        let color = getRandomColor();
        while (chosenColors.search(color) > 0) {
            color = getRandomColor();
        }
        chosenColors += color;
        for (let k = 0; k < brick_columns; k++) {
            bricks.push({
                x: (k * (BRICK_WIDTH + 10)) + leftPad,
                y: (j * (BRICK_HEIGHT + 5)) + 10,
                visible: true,
                color: color
            });
        }
    }
}

function getRandomColor() {
    return 'hsl(' + 360 * Math.random() + ', 100%, 50%)';
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}

function colorCircle(centerX, centerY, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    // centerX, centerY, radius, startDraw, endDraw, counterClockwise
    canvasContext.arc(centerX, centerY, BALL_RADIUS, 0, Math.PI * 2, true);
    canvasContext.fill();
}