const BASE_TAIL = 5;
const BLOCK_SIZE = 20;
const APPLE_SIZE = 15;
var canvas;
var canvasContext;
var framesPerSecond = 10;
var headX = 5;
var headY = 5;
var appleX = 15;
var appleY = 15;
var speedX = 1;
var speedY = 0;
var trail = [];
var tail = BASE_TAIL;
var highScore = 0;
var block_columns = 20;
var block_rows = 20;
var started_yet = false;
var paused = true;

var prevX = 0;
var prevY = 0;

window.onload = function() {
  setup();
  setInterval(function() {
    if(!paused) {
      moveEverything();
      drawEverything();
    }
  }, 1000 / framesPerSecond);
  document.addEventListener('keydown', keyPush);
  document.addEventListener('click', handleClick);
  document.addEventListener('touchstart', function (e) {
    // stop touch event
    e.stopPropagation();
    e.preventDefault();
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });
  document.addEventListener('touchmove', function (e) {
    // stop touch event
    e.stopPropagation();
    e.preventDefault();

    var evt;
    var diffX = prevX - e.touches[0].clientX;
    var diffY = prevY - e.touches[0].clientY;
    if(Math.max(Math.abs(diffX), Math.abs(diffY)) == Math.abs(diffX)) {
      // X Moved Most
      if(diffX > 0) {
        // Move Left
        evt = new KeyboardEvent('keydown', {'key': 'ArrowLeft'}); 
      } else {
        // Move Right
        evt = new KeyboardEvent('keydown', {'key': 'ArrowRight'}); 
      }
    } else {
      // Y Moved Most
      if(diffY > 0) {
        // Move Up
        evt = new KeyboardEvent('keydown', {'key': 'ArrowUp'}); 
      } else {
        // Move Down
        evt = new KeyboardEvent('keydown', {'key': 'ArrowDown'}); 
      }
    }
    document.dispatchEvent(evt);
  }, false);
};

function setup() {
  canvas = document.getElementById("gameCanvas");
  var dim = getViewportDimension();
  if(dim.w <= 767) {
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
  canvasContext.fillStyle = 'white';
  if(canvas.width >= 556) {
    canvasContext.font = "30px Roboto";
    distanceFromRight = 300;
  } else {
    canvasContext.font = "22px Roboto";
    distanceFromRight = 200;
  }
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

function disableScroll() { 
	scrollTop = document.documentElement.scrollTop;
  window.onscroll = function() { 
    window.scrollTo(0, scrollTop); 
  };
} 

function enableScroll() { 
	window.onscroll = function() {}; 
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
  canvasContext.fillText((tail - BASE_TAIL).toLocaleString() + ' : ' + highScore.toLocaleString(), 40, 40);

  // Draw body
  canvasContext.fillStyle = "lime";
  for (var i = 0; i < trail.length; i++) {
    canvasContext.fillRect(trail[i].x * BLOCK_SIZE, trail[i].y * BLOCK_SIZE, APPLE_SIZE, APPLE_SIZE);
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
  canvasContext.fillRect(appleX * BLOCK_SIZE, appleY * BLOCK_SIZE, APPLE_SIZE, APPLE_SIZE);

  if(paused) {
    setText();
    if(!started_yet) {
      canvasContext.fillText("Click/Tap to Start/Pause!", (canvas.width / 2) - 130, (block_rows / 3) * BLOCK_SIZE);
    }
  }
}

function handlePause() {
  started_yet = true;
  if(paused) {
    paused = false;
    disableScroll();
  } else {
    paused = true;
    setText();
    canvasContext.fillText("Paused", (canvas.width / 2) - 40, (block_rows / 3) * BLOCK_SIZE);
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
    case 'ArrowLeft':
      if(speedX !== 1) {
        speedX = -1;
        speedY = 0;
      }
      break;
    case 'ArrowUp':
      if(speedY !== 1) {
        speedX = 0;
        speedY = -1;
      }
      break;
    case 'ArrowRight':
      if(speedX !== -1) {
        speedX = 1;
        speedY = 0;
      }
      break;
    case 'ArrowDown':
      if(speedY !== -1) {
        speedX = 0;
        speedY = 1;
      }
      break;
    case ' ': //Space
      handlePause();
  }
}
