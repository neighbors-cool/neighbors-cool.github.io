let canvas;
let canvasContext;
let framesPerSecond = 90;
const BACKGROUND_COLOR = 'black';

//let ball = new Ball();
let balls = [];
let numBalls = 1;
let paddle;
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
let lowestBrick = 0;

let centerScreenX;
let centerScreenY;
let clientRectLeft;
let distanceFromRight = 300;

// Mobile Buttons
let leftButtonX = 0;
let buttonY = 0;
let rightButtonX = 0;

window.onload = function () {
	setup();
	let clientRectLeft = canvas.getBoundingClientRect().left - document.documentElement.scrollLeft;

	/*setText("white");
	canvasContext.font = "8px Roboto";
	for(let i = 10; i < 1000; i=i+10) {
		canvasContext.fillText(i, 0, i);
	}
	for(let i = 20; i < 1000; i=i+20) {
		canvasContext.fillText(i, i, 5);
	}*/

	setInterval(function () {
		moveEverything();
		drawEverything();
	}, (1000 / framesPerSecond));

	canvas.addEventListener('mousemove', function (event) {
		paddle.pos.x = event.clientX - clientRectLeft - paddle.halfWidth;
	});
	canvas.addEventListener('click', handleClick);
	// Convert a touch move into a mousemove
	canvas.addEventListener('touchmove', function (e) {
		// stop touch event
		e.stopPropagation();
		e.preventDefault();
	
		// translate to mouse event
		var clkEvt = new MouseEvent('mousemove',  {
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
	}, false);
};

function setup() {
	canvas = document.getElementById('gameCanvas');
	paddle = new Paddle();
	let dim = getViewportDimension();
	if(dim.w <= 767) {
		canvas.width = dim.w - 40;
	} else {
		canvas.width = dim.w - 60;
	}
	canvas.height = dim.h - 220;
	canvasContext = canvas.getContext('2d');
	centerScreenX = canvas.width / 2;
	centerScreenY = canvas.height / 2;
	
	paddle.pos.x = centerScreenX - paddle.halfWidth;
	paddle.pos.y = canvas.height - paddle.padding - paddle.height;
	brick_columns = Math.floor(canvas.width / (BRICK_WIDTH + BRICK_WIDTH_PADDING));
	brick_rows = Math.floor(canvas.height / (BRICK_HEIGHT + BRICK_HEIGHT_PADDING) / 3);
	lowestBrick = (brick_rows * (BRICK_HEIGHT + BRICK_HEIGHT_PADDING)) + BRICK_HEIGHT + 20;

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
		//ball.checkForBrickHit();
		ball.checkForPaddleHit();
		ball.checkForBoarderHit();
		if(ball.checkForBottomScreenHit()) {
			balls.splice(i, 1);
			ball = undefined;
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
	canvasContext.fillText('Level: ' + level + ' -  Lives: ' + lives, canvas.width - distanceFromRight, 25);
	canvasContext.fillText('Score: ' + score, 5, 25);

	// Draw bricks
	for (let i = 0; i < bricks.length; i++) {
		bricks[i].draw();
	}

	if (showingWinScreen) {
		setText("white");
		started_yet = false;
		canvasContext.fillText('Next Level!', centerScreenX - 60, centerScreenY);
		canvasContext.fillText('Click to Continue', centerScreenX - 90, centerScreenY + 50);
		return;
	}

	if (showingLoseScreen) {
		setText("white");
		started_yet = false;
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
		if(started_yet) {
			canvasContext.fillText('Paused', centerScreenX - 30, centerScreenY + 50);
		} else {
			canvasContext.fillText("Click/Tap to Start/Pause!", centerScreenX - 100, centerScreenY + 50);
		}
	}
}

function checkForWin() {
	showingWinScreen = (bricks.length === 0);
}

// 'click/tap' to start/pause 
function handleClick(evt) {
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
  if(canvas.width >= 556) {
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

class Vector {
	constructor(x, y) {
		this.x = 0;
		this.y = 0;
		if (x) {
			this.x = x;
		}
		if (y) {
			this.y = y;
		}
		this.toString = function () {
			return 'x:' + this.x + ', y:' + this.y;
		};
	}
}

class Brick {
	constructor(x, y, color) {
		this.pos = new Vector(x, y);
		this.color = color;

		this.draw = function () {
			colorRect(this.pos.x, this.pos.y, BRICK_WIDTH, BRICK_HEIGHT, this.color);
		};

		this.hit = function () {
			score += (10 * level);

			if (score >= rewardScore) {
				rewardScore += rewardScore;
				createNewBall();
			}
			bricks = bricks.filter(function(brick) {
				return this !== brick;
			}, this);
		};
	}
}

class Paddle {
	constructor() {
		this.pos = new Vector(0, 0);
		this.width = 100;
		this.height = 10;
		this.padding = 10;
		this.halfWidth = this.width / 2;

		// Draw Paddle
		this.draw = function () {
			colorRect(this.pos.x, this.pos.y, this.width, this.height, 'white');
		};
	}
}

class Ball {
	constructor() {
		this.pos = new Vector();
		this.vel = new Vector();
		this.radius = 10;
		this.colorControl = 0;
		this.color = '';

		this.setBallBoarder = function() {
			this.top = this.pos.y - this.radius;
			this.bottom = this.pos.y + this.radius;
			this.left = this.pos.x - this.radius;
			this.right = this.pos.x + this.radius;
		}
		this.setBallBoarder();

		// Draw Ball
		this.draw = function () {
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

		// Move the ball
		this.move = function () {
			// Set boundary and default motion
			if (this.vel.x === 0) {
				this.vel.x--;
			} else {
				this.vel.x = constrain(this.vel.x, -9, 9);
			}
			if (this.vel.y === 0) {
				this.vel.y--;
			}
			
			// If ball is at brick height, use pixel perfect-ish
			if(this.top <= lowestBrick) {
				let testingPixelPerfect = true;
				let xTarget = (this.pos.x + this.vel.x);
				let yTarget = (this.pos.y + this.vel.y);
				while(testingPixelPerfect) {
					if(this.vel.x > 0) {
						if(this.pos.x < xTarget) {
							this.pos.x += 0.1;
						} else {
							this.pos.x = xTarget;
						}
					} else {
						if(this.pos.x > xTarget) {
							this.pos.x -= 0.1;
						} else {
							this.pos.x = xTarget;
						}
					}
					
					if(this.vel.y > 0) {
						if(this.pos.y < yTarget) {
							this.pos.y += 0.1;
						} else {
							this.pos.y = yTarget;
						}
					} else {
						if(this.pos.y > yTarget) {
							this.pos.y -= 0.1;
						} else {
							this.pos.y = yTarget;
						}
					}
					
					this.setBallBoarder();

					// If the ball hit something or if its where its supposed to be
					if(this.checkForBrickHit() || (this.pos.x === xTarget && this.pos.y === yTarget)) {
						testingPixelPerfect = false;
					}
				}
			} else {
				this.pos.x += this.vel.x;
				this.pos.y += this.vel.y;
				this.setBallBoarder();
			}
		};

		this.reset = function () {
			this.vel.x = getRandomInt(-8, 8);
			this.vel.y = -4 - level;
			this.pos.x = centerScreenX - this.radius;
			this.pos.y = canvas.height - paddle.padding - paddle.height - this.radius - 10;
		};

		this.checkForBrickHit = function () {
			// First check to see if ball is at brick height
			if(this.top > lowestBrick) {
				return false;
			}

			// Check if Brick Hit
			for (let brick of bricks) {
				// Check that the ball is vertically in line with the brick
				if (this.right >= brick.pos.x && this.left <= (brick.pos.x + BRICK_WIDTH)) {
					// Check that the ball is horizontally in line with the brick
					if (this.bottom >= brick.pos.y && this.top <= (brick.pos.y + BRICK_HEIGHT)) {
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
						} else if (minDist === distFromBottomEdge) {
							// Bounce Down
							this.vel.y = Math.abs(Math.round(this.vel.y));
						} else if (minDist === distFromLeftEdge) {
							// Bounce Left
							this.vel.x = -Math.abs(Math.round(this.vel.x));
						} else {
							// Bounce Right
							this.vel.x = Math.abs(Math.round(this.vel.x));
						}
						brick = undefined;
						return true;
					}
				}
			}
			return false;
		};

		this.checkForPaddleHit = function () {
			if (this.right >= paddle.pos.x
				&& this.left <= (paddle.pos.x + paddle.width)
				&& this.bottom >= paddle.pos.y - (paddle.height / 2)) {
				// Ball is colliding with paddle
				this.vel.y = -Math.abs(Math.round(this.vel.y));
				let deltaX = this.pos.x - (paddle.pos.x + paddle.halfWidth);
				this.vel.x = Math.round(deltaX * angle);
				return true;
			}
			return false;
		};

		this.checkForBottomScreenHit = function() {
			if (this.bottom >= canvas.height) {
				// Ball hit bottom of screen
				return true;
			}
			return false;
		}

		this.checkForBoarderHit = function () {
			// Check for Top Screen Border Collision
			if (this.top <= 0) {
				this.vel.y = Math.abs(Math.round(this.vel.y));
				return true;
			}
			// Check for Left or Right Screen Border Collision
			if (this.right >= canvas.width) {
				// Right Screen, Bounce Left
				this.vel.x = -Math.abs(Math.round(this.vel.x));
				return true;
			} else if (this.left <= 0) {
				// Left Screen Bounce Right
				this.vel.x = Math.abs(Math.round(this.vel.x));
				return true;
			}
			return false;
		};
	}
}