let canvas;
let canvasContext;
let framesPerSecond = 60;
const BACKGROUND_COLOR = 'black';

//let ball = new Ball();
let balls = [];
let numBalls = 1;
let paddle = new Paddle();
let level = 1;
let score = 0;
let angle = 0.3;
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

let centerScreenX;
let centerScreenY;
let clientRectLeft;

// Mobile Buttons
let leftButtonX = 0;
let buttonY = 0;
let rightButtonX = 0;

window.onload = function () {
    setup();
    let clientRectLeft = canvas.getBoundingClientRect().left - document.documentElement.scrollLeft;

    setInterval(function () {
        moveEverything();
        drawEverything();
    }, (1000 / framesPerSecond));

    if(canvas.width >= 556) {
        document.addEventListener('keydown', handleKeyPressEvent);
        canvas.addEventListener('mousemove', function (event) {
            paddle.pos.x = event.clientX - clientRectLeft - paddle.halfWidth;
        });
    } else {
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchmove', function (event) {
            paddle.pos.x = event.targetTouches[0].clientX - clientRectLeft - paddle.halfWidth;
        });
    }
};

function setup() {
    canvas = document.getElementById('gameCanvas');
    let dim = getViewportDimension();
    canvas.width = dim.w - 60;
    canvas.height = dim.h - 220;
    canvasContext = canvas.getContext('2d');
    centerScreenX = canvas.width / 2;
    centerScreenY = canvas.height / 2;
    
    paddle.pos.x = centerScreenX - paddle.halfWidth;
    paddle.pos.y = canvas.height - paddle.padding - paddle.height;
    brick_columns = Math.floor(canvas.width / (BRICK_WIDTH + BRICK_WIDTH_PADDING));
    brick_rows = Math.floor(canvas.height / (BRICK_HEIGHT + BRICK_HEIGHT_PADDING) / 3);

    createBalls();
    createBricks();
    rewardScore = (1000 * level);
}

function moveEverything() {
    if(showingWinScreen || showingLoseScreen || paused) {
        return;
    }
    checkForWin();
    for(let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        ball.move();
        ball.checkForBrickHit();
        ball.checkForPaddleHit();
        if(ball.checkForScreenHit()) {
            balls.splice(i, 1);
        }
    }
    if(balls.length === 0) {
        lives--;
        showingLoseScreen = true;
    }
}

function drawEverything() {
    // Draw Background
    colorRect(0, 0, canvas.width, canvas.height, BACKGROUND_COLOR);

    // Show lives
    setText("white");
    canvasContext.fillText('Level: ' + level + ' -  Lives: ' + lives, canvas.width - 300, 25);
    canvasContext.fillText('Score: ' + score, 5, 25);

    // Draw bricks
    drawBricks();

    if(canvas.width < 556) {
        drawButtons();
    }

    if (showingWinScreen) {
        started_yet = false;
        setText("white");
        canvasContext.fillText('Next Level!', centerScreenX - 60, centerScreenY);
        canvasContext.fillText('Click to Continue', centerScreenX - 90, centerScreenY + 50);
        return;
    }

    if (showingLoseScreen) {
        started_yet = false;
        setText("white");
        if(lives === 0) {
            canvasContext.fillText('You lose... Score: ' + score, centerScreenX - 90, centerScreenY + 20);
        } else {
            canvasContext.fillText(lives + ' More Li' + (lives % 2 == 0 ? 'ves' : 'fe') + '!', centerScreenX - 90, centerScreenY + 20);
        }
        canvasContext.fillText('Click to Continue', centerScreenX - 90, centerScreenY + 70);
        return;
    }

    paddle.draw();
    for(let ball of balls) {
        ball.draw();
    }

    if (paused) {
        setText("white");
        if(started_yet) {
            canvasContext.fillText('Paused', centerScreenX - 30, centerScreenY + 50);
        } else {
            if(canvas.width < 556) {
                canvasContext.fillText("Start!", centerScreenX - 50 , centerScreenY + 50);
            } else {
                canvasContext.fillText("Press Space to Start/Pause!", centerScreenX - 150, centerScreenY + 50);
            }
        }
    }
}

function checkForWin() {
    for (let i = 0; i < bricks.length; i++) {
        if (bricks[i].visible()) {
            return;
        }
    }
    showingWinScreen = true;
}

// Desktop pause
function handleKeyPressEvent(evt) {
    if(evt.keyCode == 32) {
        evt.preventDefault();
        if (showingWinScreen) {
            if(level % 2 === 0 && lives !== 0) {
                // Give an extra life on odd levels > 1
                lives++;
            }
            level++;
            rewardScore = (1000 * level);
            showingWinScreen = false;
            paused = true;
            for(let ball of balls) {
                ball.reset();
            }
            createBricks();
            createBalls();
        } else if(showingLoseScreen) {
            showingLoseScreen = false;
            paused = true;
            createBalls();
            if(lives === 0) {
                started_yet = false;
                level = 1;
                score = 0;
                rewardScore = (1000 * level);
                lives = NUMBER_OF_LIVES;
                for(let ball of balls) {
                    ball.reset();
                }
                createBricks();
            }
        } else {
            paused = !paused;
            started_yet = true;
        }
    }
}

// Mobile 'click'
function handleClick(evt) {
    if (showingWinScreen) {
        if(level % 2 === 0 && lives !== 0) {
            lives++;
        }
        level++;
        showingWinScreen = false;
        paused = true;
        for(let ball of balls) {
            ball.reset();
        }
        createBricks();
        return;
    }
    if(showingLoseScreen) {
        level = 1;
        lives = NUMBER_OF_LIVES;
        showingLoseScreen = false;
        paused = true;
        started_yet = false;
        for(let ball of balls) {
            ball.reset();
        }
        createBricks();
        return;
    }
    let clickX = evt.clientX-16;
    let clickY = evt.clientY-94;
    if(clickY >= buttonY && clickY <= buttonY + 35) {
        if(clickX >= rightButtonX && clickX <= rightButtonX + 40) {
            paused = !paused;
            started_yet = true;
        }
    }
}

function drawButtons() {
    let left = canvas.width / 6;
    let top = canvas.height / 6;
    buttonY = canvas.height - top;
    rightButtonX = canvas.width - left;

    colorRect(rightButtonX, buttonY, 40, 35, "white");

    setText("black");
    let playPause = (paused ? '|>' : '| |');
    canvasContext.fillText(playPause, canvas.width - left + 10, canvas.height - top + 28);
}

function getViewportDimension() {
    let e = window, a = 'inner';
    if (!( 'innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {w:e[a + 'Width'], h:e[a + 'Height']};
}

// p5js constrain
function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}

function setText(color) {
  canvasContext.fillStyle = color;
  canvasContext.font = "30px Roboto";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}

function drawBricks() {
    for (let i = 0; i < bricks.length; i++) {
        bricks[i].draw();
    }
}

// p5js.map
/*function map(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
      return newval;
    }
    if (start2 < stop2) {
      return this.constrain(newval, start2, stop2);
    } else {
      return this.constrain(newval, stop2, start2);
    }
}*/

function createBricks() {
    bricks = [];
    let leftPad = (canvas.width - (brick_columns * (BRICK_WIDTH + BRICK_WIDTH_PADDING)) + BRICK_WIDTH_PADDING) / 2;
    let topPad = 10;
    let hue = getRandomInt(0, 360);
    let modifyer = (getRandomInt(0,1) ? -20 : 20);
    for (let j = 1; j <= brick_rows; j++) {
        let color = 'hsl(' + hue + ', 100%, 50%)';
        for (let k = 0; k < brick_columns; k++) {
            bricks.push(new Brick(((k * (BRICK_WIDTH + BRICK_WIDTH_PADDING)) + leftPad),
                                    ((j * (BRICK_HEIGHT + BRICK_HEIGHT_PADDING)) + topPad),
                                    color));
        }
        if(hue + modifyer > 360 || hue + modifyer < 0) {
            modifyer *= -1;
        }
        hue += modifyer;
    }
}

function createBalls() {
    for(let i = 0; i < numBalls; i++) {
        createNewBall();
    }
}

function createNewBall() {
    let ball = new Ball();
    ball.reset();
    balls.push(ball);
};

function Vector(x, y) {
    this.x = 0;
    this.y = 0;
    if(x) {
        this.x = x;
    }
    if(y) {
        this.y = y;
    }
    this.toString = function() {
        return 'x:' + this.x + ', y:' + this.y;
    }
}

function Brick(x, y, color) {
    this.pos = new Vector(x, y);
    this.color = color;

    this.draw = function() {
        colorRect(this.pos.x, this.pos.y, BRICK_WIDTH, BRICK_HEIGHT, this.color);
    };

    this.hit = function() {
        this.color = BACKGROUND_COLOR;
        score += (10 * level);

        if(score >= rewardScore) {
            rewardScore += rewardScore;
            createNewBall();
        }
    };

    this.visible = function() {
        return this.color !== BACKGROUND_COLOR;
    };
}

function Paddle() {
    this.pos = new Vector(0, 0);
    this.width = 100;
    this.height = 10;
    this.padding = 10;
    this.halfWidth = this.width / 2;

    // Draw Paddle
    this.draw = function() {
        colorRect(this.pos.x, this.pos.y, this.width, this.height, 'white');
    };
}

function Ball() {
    this.pos = new Vector();
    this.vel = new Vector();
    this.radius = 10;
    this.top = this.pos.y - this.radius;
    this.bottom = this.pos.y + this.radius;
    this.left = this.pos.x - this.radius;
    this.right = this.pos.x + this.radius;
    this.colorControl = 0;
    this.color = '';

    // Draw Ball
    this.draw = function() {
        if ((this.colorControl % (framesPerSecond / 5)) === 0) {
            this.color = 'hsl(' + getRandomInt(0, 360) + ', 100%, 50%)';
            this.colorControl = 0;
        }
        this.colorControl++;
        canvasContext.fillStyle = this.color;
        canvasContext.beginPath();
        // centerX, centerY, radius, startDraw, endDraw, counterClockwise
        canvasContext.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
        canvasContext.fill();
    };

    this.move = function() {
        // Move the ball
        this.vel.x = constrain(this.vel.x, -9, 9);
        this.pos.x += this.vel.x;

        if(this.vel.y === 0) {
            this.vel.y--;
        }
        this.pos.y += this.vel.y;
        
        this.top = this.pos.y - this.radius;
        this.bottom = this.pos.y + this.radius;
        this.left = this.pos.x - this.radius;
        this.right = this.pos.x + this.radius;
    };

    this.reset = function() {
        this.vel.x = getRandomInt(-8, 8);
        this.vel.y = -4 - level;
        this.pos.x = centerScreenX - this.radius;
        this.pos.y = canvas.height - paddle.padding - paddle.height - this.radius - 10;
    };

    this.checkForBrickHit = function() {
        // Check if Brick Hit
        for(let brick of bricks) {
            // Make Sure Brick is Visible
            if (brick.visible()) {
                // Check if Ball Collided with Brick
                // Check that the ball is vertically over the brick
                if (this.right >= brick.pos.x && this.left <= (brick.pos.x + BRICK_WIDTH)) {
                    // Check that the ball is horizontally in line with the brick
                    if (this.bottom >= brick.pos.y && this.top <= (brick.pos.y + BRICK_HEIGHT)) {
                        // Make Brick Invisible
                        brick.hit();

                        // Decide where the Ball hit the Brick
                        let distFromLeftEdge = Math.abs(Math.round(this.right - brick.pos.x));
                        let distFromRightEdge = Math.abs(Math.round(this.left - (brick.pos.x + BRICK_WIDTH)));
                        let distFromTopEdge = Math.abs(Math.round(this.bottom - brick.pos.y));
                        let distFromBottomEdge = Math.abs(Math.round(this.top - (brick.pos.y + BRICK_HEIGHT)));
                        let minDist = Math.min(distFromLeftEdge, distFromRightEdge, distFromTopEdge, distFromBottomEdge); 
                        if (minDist === distFromTopEdge) {
                            // Bounce Up
                            this.vel.y = -Math.abs(Math.round(this.vel.y));
                        } else if(minDist === distFromBottomEdge) {
                            // Bounce Down
                            this.vel.y = Math.abs(Math.round(this.vel.y));
                        } else if(minDist === distFromLeftEdge) {
                            // Bounce Left
                            this.vel.x = -Math.abs(Math.round(this.vel.x));
                        } else {
                            // Bounce Right
                            this.vel.x = Math.abs(Math.round(this.vel.x));
                        }
                        return;
                    }
                }
            }
        }
    };

    this.checkForPaddleHit = function() {
        if (this.right >= paddle.pos.x
                && this.left <= (paddle.pos.x + paddle.width)
                && this.bottom >= paddle.pos.y - (paddle.height/2)) {
            // Ball is colliding with paddle
            this.vel.y = -Math.abs(Math.round(this.vel.y));
            let deltaX = this.pos.x - (paddle.pos.x + paddle.halfWidth);
            this.vel.x = Math.round(deltaX * angle);
            return;
        }
    };

    this.checkForScreenHit = function() {
        if (this.bottom >= canvas.height) {
            // Ball hit bottom of screen
            return true;
        }
        // Check for Top Screen Border Collision
        if (this.top <= 0) {
            this.vel.y = Math.abs(Math.round(this.vel.y));
        }
        // Check for Left or Right Screen Border Collision
        if (this.right >= canvas.width) {
            // Right Screen, Bounce Left
            this.vel.x = -Math.abs(Math.round(this.vel.x));
        } else if (this.left <= 0) {
            // Left Screen Bounce Right
            this.vel.x = Math.abs(Math.round(this.vel.x));
        }
    };
}