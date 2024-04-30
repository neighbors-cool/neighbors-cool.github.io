let canvas;
let canvasContext;
let framesPerSecond = 60;
let centerScreenX;
let centerScreenY;
let started_yet = false;
let paused = true;
let score = 0;
let win = false;
const asteroids = [];
const numberOfAsteroids = 10;
const minAsteroidSize = 6;
const maxAsteroidSize = 10;
const asteroidSizeMultiplier = 4;
const minAsteroidSpeed = 50;
const lowAsteroidSpeed = -100;
const highAsteroidSpeed = 100;
const maxShipSpeed = 200;
const maxBulletCount = 10;
const backgroundColor = "black";
const asteroidsColor = "white";

let ship;

window.onload = function() {
    setup();
    setInterval(function() {
        if(!paused) {
            moveEverything();
        }
        drawEverything();
    }, 1000 / framesPerSecond);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('keydown', keyUpdate);
    canvas.addEventListener('keyup', keyUpdate);
}

class Vector {
	constructor(x, y) {
		this.x = (x ? x : 0);
		this.y = (y ? y : 0);
	}
}

class Ship {
    constructor() {
        this.radius = 10;
        this.speed = 0.01;
        this.pos = new Vector(centerScreenX, centerScreenY);
        this.rads = angle(this.pos.x, this.pos.y, this.pos.x, this.pos.y-1);
		this.vel = new Vector((Math.cos(this.rads)*this.speed/framesPerSecond), (Math.sin(this.rads)*this.speed/framesPerSecond));
        this.bullets = [];
        this.fireInterval = 10; // frames between bullets
        this.currentInterval = this.fireInterval;
    }

    move() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if(this.pos.x > canvas.width + 5) {
            this.pos.x = -5;
        }
        if(this.pos.x < -5) {
            this.pos.x = canvas.width + 5;
        }
        if(this.pos.y > canvas.height + 5) {
            this.pos.y = -5;
        }
        if(this.pos.y < -5) {
            this.pos.y = canvas.height + 5;
        }

        // remove bullets
        for(let i = 0; i < this.bullets.length; i++) {
            if(this.bullets[i].removed) {
                this.bullets.splice(i, 1);
                i--;
            } else {
                this.bullets[i].move();
            }
        }

        // Fire bullet if less than maxBulletCount on screen
        if(keyStatusMap[' '] && this.bullets.length <= maxBulletCount && this.currentInterval == 0) {
            this.fire();
            this.currentInterval = this.fireInterval;
        }

        if(this.currentInterval > 0) {
            this.currentInterval--;
        }
    }

    draw() {
		canvasContext.beginPath();
        canvasContext.fillStyle = asteroidsColor;
        canvasContext.moveTo(this.pos.x, this.pos.y);

        let newXL = this.pos.x + (Math.cos(this.rads+Math.PI*.85)*30);
        let newYL = this.pos.y + (Math.sin(this.rads+Math.PI*.85)*30);
        let newXR = this.pos.x + (Math.cos(this.rads+Math.PI*1.15)*30);
        let newYR = this.pos.y + (Math.sin(this.rads+Math.PI*1.15)*30);

        canvasContext.lineTo(newXL, newYL);
        canvasContext.lineTo(newXR, newYR);
        canvasContext.fill();

		canvasContext.beginPath();
        canvasContext.fillStyle = 'red';
		// centerX, centerY, radius, startDraw, endDraw, counterClockwise
		canvasContext.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2, true);
		canvasContext.fill();
        setText();
    }

    // arrow key press will adjust the facing and speed in the appropriate direction over time (small adjustment in this call)
    updateVelocity() {
        if(keyStatusMap['ArrowLeft']) {
            this.rads += -0.05;
        }
        if(keyStatusMap['ArrowRight']) {
            this.rads += 0.05;
        }
        if(this.rads > Math.PI*2) {
            this.rads = -Math.PI*2;
        } else if(this.rads < -Math.PI*2) {
            this.rads = Math.PI*2;
        }
        
        // Slow down
        if(keyStatusMap['ArrowDown'] && this.speed > 2) {
            this.speed += -2;
        }
        // Speed up while up arrow is pressed
        if(this.speed < maxShipSpeed && keyStatusMap['ArrowUp']) {
            this.speed += 1;
        } else if(this.speed > 1) {
            this.speed += -1;
        }

		this.vel.x = (Math.cos(this.rads)*this.speed/framesPerSecond);
		this.vel.y = (Math.sin(this.rads)*this.speed/framesPerSecond);
    }

    fire() {
        let b = new Bullet(this);
        this.bullets.push(b);
    }

    // checkForBoarderHit() {
    //     return ((this.pos.y - this.radius) <= -50)
    //     || ((this.pos.y + this.radius) >= canvas.height + 50)
    //     || ((this.pos.x + this.radius) >= canvas.width + 50)
    //     || ((this.pos.x - this.radius) <= -50);
	// }
}

class Bullet {
    constructor(ship) {
        this.radius = 5;
        this.speed = 200;
        this.pos = new Vector(ship.pos.x, ship.pos.y);
        let rads = angle(ship.pos.x, ship.pos.y, ship.pos.x+ship.vel.x, ship.pos.y+ship.vel.y);
		this.vel = new Vector((Math.cos(rads)*this.speed/framesPerSecond), (Math.sin(rads)*this.speed/framesPerSecond));
        this.removed = false;
    }
	
    move() {
        if(this.checkForBoarderHit()) {
            this.remove();
            return;
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
	}

    draw() {
		canvasContext.fillStyle = asteroidsColor;
		canvasContext.beginPath();
		// centerX, centerY, radius, startDraw, endDraw, counterClockwise
		canvasContext.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI/2, true);
	    canvasContext.fill();
    }

    remove() {
        this.removed = true;
    }

    checkForBoarderHit() {
        return ((this.pos.y - this.radius) <= -50)
        || ((this.pos.y + this.radius) >= canvas.height + 50)
        || ((this.pos.x + this.radius) >= canvas.width + 50)
        || ((this.pos.x - this.radius) <= -50);
	}
}

class Asteroid {
	constructor(populate) {
        this.size; // int
        this.radius; // int
        this.pos; // Vector
        this.vel; // Vector
        this.rads; // float
        this.speed; // float
        this.shape = []; // array of vectors
        this.color = asteroidsColor; // String
        this.removed = false; // Boolean
        if(populate) {
            this.reset(true);
        }
	}

    deepCopy() {
        let newA = new Asteroid(false);
        newA.size = this.size;
        newA.radius = this.radius;
        newA.pos = new Vector(this.pos.x, this.pos.y);
        newA.vel = new Vector(this.vel.x, this.vel.y);
        newA.rads = this.rads;
        newA.speed = this.speed;
        newA.color = this.color;
        for(let i = 0; i < this.shape.length; i++) {
            newA.shape.push(new Vector(this.shape[i].x, this.shape[i].y));
        }
        return newA;
    }

	// Draw Asteroid
    // TODO draw better asteroid
	draw() {
        canvasContext.fillStyle = this.color;
		canvasContext.beginPath();

        canvasContext.moveTo(this.shape[0].x, this.shape[0].y);
        for(let i = 1; i < this.shape.length; i += 1) {
            canvasContext.lineTo(this.shape[i].x, this.shape[i].y);
        }
        canvasContext.fill();
	}

	// Move the asteroid
	move() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        // move shape
        for(let i = 0; i < this.shape.length; i += 1) {
            this.shape[i].x += this.vel.x;
            this.shape[i].y += this.vel.y;
        }

        if(this.checkForBoarderHit()) {
            this.reset(false);
        }

        // if(this.pos.x > canvas.width + 5) {
        //     this.pos.x = -5;
        // }
        // if(this.pos.x < -5) {
        //     this.pos.x = canvas.width + 5;
        // }
        // if(this.pos.y > canvas.height + 5) {
        //     this.pos.y = -5;
        // }
        // if(this.pos.y < -5) {
        //     this.pos.y = canvas.height + 5;
        // }
    }

    checkForAsteroidHit() {
        for(let i = 0; i < ship.bullets.length; i++) {
            let b = ship.bullets[i];
            if(this.checkForBulletHit(b)) {
                score += this.size;
                b.removed = true;
                this.size = this.size - 1;
                if(this.size < minAsteroidSize) {
                    // this.reset();
                    this.removed = true;
                    return false;
                }
                this.radius = this.size * asteroidSizeMultiplier;
                return true;
            }
        }
        return false;
    }

	reset(resetSize) {
        if(resetSize) {
            this.size = Math.floor(getRandomFloat(minAsteroidSize, maxAsteroidSize));
        }
		this.radius = this.size * asteroidSizeMultiplier;

        if(Math.random() < 0.5) {
            // X on screen and Y off screen
            let onScreenX = getRandomFloat(0, canvas.width);
            let offScreenY = (Math.random() < 0.5 ? getRandomFloat(-20, 0) : getRandomFloat(canvas.height, canvas.height + 20));
            this.pos = new Vector(onScreenX, offScreenY);
            this.speed = (offScreenY <= 0 ? getRandomFloat(minAsteroidSpeed, highAsteroidSpeed) : getRandomFloat(lowAsteroidSpeed, -minAsteroidSpeed));
        } else {
            // X off screen and Y on screen
            let offScreenX = (Math.random() < 0.5 ? getRandomFloat(-20, 0) : getRandomFloat(canvas.width, canvas.width + 20));
            let onScreenY = getRandomFloat(0, canvas.height);
            this.pos = new Vector(offScreenX, onScreenY);
            this.speed = (offScreenX <= 0 ? getRandomFloat(minAsteroidSpeed, highAsteroidSpeed) : getRandomFloat(lowAsteroidSpeed, -minAsteroidSpeed));
        }

        let randomPointInMiddle50X = getRandomFloat((getMiddle(0, centerScreenX)), (getMiddle(centerScreenX, canvas.width)));
        let randomPointInMiddle50Y = getRandomFloat((getMiddle(0, centerScreenY)), (getMiddle(centerScreenY, canvas.height)));

        this.rads = angle(randomPointInMiddle50X, randomPointInMiddle50Y, this.pos.x, this.pos.y);
		this.vel = new Vector((Math.cos(this.rads)*this.speed/framesPerSecond), (Math.sin(this.rads)*this.speed/framesPerSecond));

        // create shape
        this.shape = [];
        for(let i = 0; i <= Math.PI*2; i += ((Math.PI*2)/10)) {
            this.shape.push(new Vector(this.pos.x + (Math.cos(this.rads+i)*this.radius*Math.random()),
                                       this.pos.y + (Math.sin(this.rads+i)*this.radius*Math.random())));
        }
	}

    checkForBulletHit(bullet) {
        return ((this.pos.y - this.radius) <= bullet.pos.y)
        && ((this.pos.y + this.radius) >= bullet.pos.y)
        && ((this.pos.x + this.radius) >= bullet.pos.x)
        && ((this.pos.x - this.radius) <= bullet.pos.x);
    }

	checkForBoarderHit() {
        return ((this.pos.y - this.radius) <= -50)
        || ((this.pos.y + this.radius) >= canvas.height + 50)
        || ((this.pos.x + this.radius) >= canvas.width + 50)
        || ((this.pos.x - this.radius) <= -50);
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

function setup() {
    canvas = document.getElementById("gameCanvas");
    let dim = getViewportDimension();
    canvas.width = dim.w;
    canvas.height = dim.h - 220;
    canvasContext = canvas.getContext("2d");
	centerScreenX = canvas.width / 2;
	centerScreenY = canvas.height / 2;
    setText();
    ship = new Ship();
    for(let i = 0; i < numberOfAsteroids; i++) {
        asteroids.push(new Asteroid(true));
    }
    moveEverything();
    drawEverything();
}

function moveEverything() {
    if(win) return;
    let tempLength = asteroids.length;
    for(let i = 0; i < tempLength; i++) {
        let a = asteroids[i];
        if(a.checkForAsteroidHit()) {
            // create a new asteroid, reuse this one, and split them off at 45 degrees

            a.shape = [];
            for(let j = 0; j <= Math.PI*2; j += ((Math.PI*2)/10)) {
                a.shape.push(new Vector(a.pos.x + (Math.cos(a.rads+j)*a.radius*Math.random()),
                                           a.pos.y + (Math.sin(a.rads+j)*a.radius*Math.random())));
            }

            let newA = a.deepCopy();
            newA.rads += Math.PI*0.25;
            newA.vel = new Vector((Math.cos(newA.rads)*newA.speed/framesPerSecond),
                                  (Math.sin(newA.rads)*newA.speed/framesPerSecond));
            asteroids.push(newA);
            
            a.rads += (Math.random() > 0.5 ? Math.PI/Math.random() : Math.PI*Math.random());
            a.vel = new Vector((Math.cos(a.rads)*a.speed/framesPerSecond),
                                  (Math.sin(a.rads)*a.speed/framesPerSecond));
        }
    }

    asteroids.forEach(asteroid => asteroid.move());

    // remove asteroids
    for(let i = 0; i < asteroids.length; i++) {
        if(asteroids[i].removed) {
            asteroids.splice(i, 1);
            i--;
        }
    }

    ship.bullets.forEach(bullet => bullet.move());
    ship.updateVelocity();
    ship.move();
}

function drawEverything() {
    // Draw background
    canvasContext.fillStyle = backgroundColor;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    if(!win) {
        asteroids.forEach(asteroid => asteroid.draw());
        ship.bullets.forEach(bullet => bullet.draw());
    }
    ship.draw();
    canvasContext.fillText('Score: ' + score, 30, 60);

	if (paused) {
		if(started_yet) {
			canvasContext.fillText('Paused', centerScreenX - 30, centerScreenY + 50);
		} else {
			canvasContext.fillText("Click/Enter to Start/Pause!", centerScreenX - 150, centerScreenY + 50);
		}
	} else if(asteroids.length <= 0) {
        canvasContext.fillText("You Win!", centerScreenX - 60, centerScreenY + 50);
        canvasContext.fillText("Click/Enter to Restart!", centerScreenX - 120, centerScreenY + 80);
        win = true;
    }
}

function restart() {
    for(let i = 0; i < numberOfAsteroids; i++) {
        asteroids.push(new Asteroid(true));
    }
    moveEverything();
    drawEverything();
    win = false;
    score = 0;
    ship.bullets = [];

}

let keyStatusMap = {};
function keyUpdate(evt) {
    evt.preventDefault();
    if(evt.type === 'keydown' || evt.type === 'keyup') {
        if(evt.type === 'keydown' && evt.key === 'Enter') {
            return;
        } else if(evt.type === 'keyup' && evt.key === 'Enter') {
            handlePause();
        } else if(!paused) {
            keyStatusMap[evt.key] = evt.type === 'keydown';
        }
    }
}

function getRandomFloat(min, max) {
	return ((Math.random() * (max - min + 1)) + min);
}

// range (-PI, PI]
function angle(ax, ay, bx, by) {
    return Math.atan2((by - ay), (bx - ax));
}

function getMiddle(a, b) {
    return ((b - a) / 2) + a;
}

function disableScroll() { 
	scrollTop = document.documentElement.scrollTop;
    window.onscroll = function() { 
        window.scrollTo(0, scrollTop); 
    };
} 

function enableScroll() { 
	window.onscroll = function() {}; 
}

function handleClick(evt) {
  evt.preventDefault();
  handlePause();
}

function setText() {
  canvasContext.fillStyle = 'white';
  if(canvas.width >= 556) {
    canvasContext.font = "30px Roboto";
  } else {
    canvasContext.font = "22px Roboto";
  }
}

function handlePause() {
  started_yet = true;
  if(win) {
    restart();
    return;
  }
  if(paused) {
    paused = false;
    disableScroll();
  } else {
    paused = true;
    setText();
    enableScroll();
  }
}