window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

// const recognition = new window.SpeechRecognition();
// recognition.continuous = true; //continuous results are returned for each recognition
// recognition.start();
// recognition.onresult = (event) => {
//   const speechToText = event.results[0][0].transcript;
// };

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
}

const backgroundMusic = new sound("./Tetris.mp3");
backgroundMusic.sound.volume = 0.3;
const controllerSound = new sound("./control.wav");
controllerSound.sound.volume = 0.4;
const dropSound = new sound("./drop.wav");
dropSound.sound.volume = 0.4;
const gameOverSound = new sound("./game-over.wav");
const gameOverSound2 = new sound("./game-over2.wav");
const levelUpSound = new sound("./level-up.wav");
const levelUpSound2 = new sound("./level-up2.wav");
levelUpSound2.sound.volume = 0.4;
let mute = false;

function muteOrSound(sound) {
  if (!mute) {
    backgroundMusic.play();
    sound.play();
  } else {
    backgroundMusic.stop();
    sound.stop();
  }
}

// selecting the whole canvas
const canvas = document.getElementById("voistris");

// select a square
const context = canvas.getContext("2d");

// score
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

// context = 30
const ROW = 20;
const COLUMN = 10;
const SQUARE = 30;
const EMPTY = "black";
let hold;
let holdTime = true;
let paused = false;

function drawSquare(x, y, fillColor, strokeColor) {
  context.fillStyle = fillColor;
  context.fillRect(x * SQUARE, y * SQUARE, SQUARE, SQUARE);
  
  context.strokeStyle = strokeColor;
  context.strokeRect(x * SQUARE, y * SQUARE, SQUARE, SQUARE);
}

// create board
let board = [];

for (let r = 0; r < ROW; r++) {
  board[r] = [];
  for (let c = 0; c < COLUMN; c++) {
    board[r][c] = EMPTY;
  }
}

// draw board
function drawBoard() {
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COLUMN; c++) {
      drawSquare(c, r, board[r][c], "#333232");
    }
  }
}

drawBoard();

document.getElementById("game-end").style.display = 'none';
document.getElementById("paused").style.display = 'none';

function playGame() {
  muteOrSound(backgroundMusic);

  var ctrl = new anycontrol();
  
  ctrl.addCommand("left", function () {
    console.log("left")
    piece.moveLeft();
    dropStart = Date.now();
  });

  ctrl.addCommand("right", function () {
    console.log("right")
    piece.moveRight();
    dropStart = Date.now();
  });

  ctrl.addCommand("rotate", function () {
    console.log("rotate")
    piece.rotate();
    dropStart = Date.now();
  });

  ctrl.addCommand("drop", function () {
    console.log("drop")
    piece.moveAllTheWayDown();
    dropStart = Date.now();
  });

  ctrl.addCommand("hold", function () {
    console.log("drop")
    piece.holdPiece();
    dropStart = Date.now();
  });
  
  // ctrl.start();
  
  // the pieces and their colors
  const PIECES = [
    [Z, "#ff0000", "./voistrimino-colors/next-red.png"], // red
    [S, "#00ff00", "./voistrimino-colors/next-green.png"], // green
    [T, "#cc00ff", "./voistrimino-colors/next-purple.png"], // purple
    [O, "#ffff00", "./voistrimino-colors/next-yellow.png"], // yellow
    [I, "#66ffff", "./voistrimino-colors/next-light-blue.png"], // light-blue
    [L, "#ff6500", "./voistrimino-colors/next-orange.png"], // orange
    [J, "#00ffcc", "./voistrimino-colors/next-mint.png"], // mint
    [U, "#ffcccc", "./voistrimino-colors/next-pink.png"], // pink
    [W, "#ff1cd0", "./voistrimino-colors/next-dark-pink.png"], // dark-pink
    [PLUS, "#6300d9", "./voistrimino-colors/next-light-purple.png"], // light-purple
    [DIAGONAL, "#ffffff", "./voistrimino-colors/next-white.png"], // white
    [DOT, "#226f35", "./voistrimino-colors/next-forest-green.png"] // forest green
  ];

  // initiate a piece
  let piece = randomPiece();
  let next = randomPiece();
  let picture = next.picture;
  document.getElementById("next-piece-image").src = picture;
  
  // random piece
  function randomPiece() {
    let randomN = Math.floor(Math.random() * PIECES.length);
    return new Piece( PIECES[randomN][0], PIECES[randomN][1], PIECES[randomN][2]);
  }
  
  // piece constructor
  function Piece(voistrimino, color, picture) {
    this.voistrimino = voistrimino;
    this.color = color;
    this.outlineColor = "white";
    this.picture = picture;
    this.holdTime = 1;
    
    this.voistriminoN = 0; // start from the first pattern
    this.activeVoistrimino = this.voistrimino[this.voistriminoN];
    
    this.x = 3;
    this.y = -2;
  }
  
  // fill function
  Piece.prototype.fill = function (color) {
    for (let r = 0; r < this.activeVoistrimino.length; r++) {
      for (let c = 0; c < this.activeVoistrimino.length; c++) {
        if (this.activeVoistrimino[r][c]) {
          // we draw only occupied squares
          drawSquare(this.x + c, this.y + r, color);
        }
      }
    }
  };
  
  // draw Piece
  Piece.prototype.draw = function () {
    this.fill(this.color, "white");
  };
  
  // // unDraw Piece
  Piece.prototype.unDraw = function () {
    this.fill(EMPTY, "white");
  };
  
  // update movement (movingDown)
  Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeVoistrimino)) {
      this.unDraw();
      this.y++;
      this.draw();
    } else {
      this.lock();
      holdTime = true;
      piece = next;
      next = randomPiece();
      picture = next.picture;
      document.getElementById("next-piece-image").src = picture;
    }
  };
  
  // move right
  Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeVoistrimino)) {
      this.unDraw();
      this.x++;
      this.draw();
    }
  };
  
  // move left
  Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeVoistrimino)) {
      this.unDraw();
      this.x--;
      this.draw();
    }
  };
  
  Piece.prototype.moveAllTheWayDown = function () {
    while (!this.collision(0, 1, this.activeVoistrimino)) {
      this.moveDown();
    }
  };
  Piece.prototype.holdPiece = function () {
    if (!hold) {
      hold = this;
      this.unDraw();
      piece = randomPiece();
    } else if (holdTime) {
      this.unDraw();
      piece = hold;
      piece.x = this.x;
      piece.y = this.y;
      hold = this;
      piece.draw();
      holdTime = false;
    } else if (!holdTime) {
    }
    document.getElementById("hold-piece-image").src = hold.picture;
  };
  
  // rotate piece
  Piece.prototype.rotate = function () {
    let nextPattern = this.voistrimino[(this.voistriminoN + 1) % this.voistrimino.length];
    let kick = 0; 
  
    if (this.collision(0, 0, nextPattern)) {
      if (this.x > COLUMN / 2) {
        kick = -1; // right wall
      } else {
        kick = 1; // left wall
      }
    }
    
    if (!this.collision(kick, 0, nextPattern)) {
      this.unDraw();
      this.x += kick;
      this.voistriminoN = (this.voistriminoN + 1) % this.voistrimino.length;
      this.activeVoistrimino = this.voistrimino[this.voistriminoN];
      this.draw();
    }
  };
  
  let score = 0;
  let speed = 1000;
  let level = 0;
  
  // lock piece
  Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeVoistrimino.length; r++) {
      for (let c = 0; c < this.activeVoistrimino.length; c++) {
        // skip vacant squares
        if (!this.activeVoistrimino[r][c]) continue;
  
        // pieces to lock on top = game over
        if (this.y + r < 0) {
          // if (!alert('YOU LOSE')) {
          //   window.location.reload();
          // }
          gameOver = true;
          backgroundMusic.sound.volume = 0;
          muteOrSound(gameOverSound);
          document.getElementById("gameover-score").innerHTML = score;
          document.getElementById("game-end").style.display = 'block';
          document.getElementById("game-end").addEventListener("click", () => window.location.reload());
          muteOrSound(gameOverSound2);
        }
        
        // lock piece
        board[this.y + r][this.x + c] = this.color;
        holdTime = true;
      }
    }
  
    // remove full row
    for (let r = 0; r < ROW; r++) {
      let isRowFull = true;
  
      for (let c = 0; c < COLUMN; c++) {
        isRowFull = isRowFull && (board[r][c] != EMPTY);
      }
  
      if (isRowFull) {
        // if the row is full
        // move all rows down
        for (let y = r; y > 1; y--) {
          for (let c = 0; c < COLUMN; c++) {
            board[y][c] = board[y - 1][c];
          }
        }
        // create new line on top
        for(let c = 0; c < COLUMN; c++) {
          board[0][c] = EMPTY;
        }
  
        score += 10;
        if (!(score % 30)) {
          speed *= 0.8;
          level += 1;
          muteOrSound(levelUpSound);
          muteOrSound(levelUpSound2);
        }
      }
    }
    // update board
    drawBoard();
  
    // update score
    scoreElement.innerHTML = score;
    levelElement.innerHTML = level;
  };
  
  // collision detection
  Piece.prototype.collision = function(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece.length; c++) {
        if (!piece[r][c]) continue;
  
        let newX = this.x + c + x;
        let newY = this.y + r + y;
  
        if (newX < 0 || newX >= COLUMN || newY >= ROW) return true;
        if (newY < 0) continue;
        if (board[newY][newX] !=  EMPTY) return true;
      }
    }
  
    return false;
  };
  
  // keyboard control
  document.addEventListener("keydown", CONTROL);
  
  function CONTROL(event) {
    if (event.keyCode == 37)  {
      piece.moveLeft();
      dropStart = Date.now();
      muteOrSound(controllerSound);
    } else if (event.keyCode == 38) {
      piece.rotate();
      dropStart = Date.now();
      muteOrSound(controllerSound);
    } else if (event.keyCode == 39) {
      piece.moveRight();
      dropStart = Date.now();
      muteOrSound(controllerSound);
    } else if (event.keyCode == 40) {
      piece.moveDown();
      muteOrSound(controllerSound);
    } else if (event.keyCode == 32) {
      piece.moveAllTheWayDown();
      muteOrSound(dropSound);
    } else if (event.keyCode == 16) {
      piece.holdPiece();
      muteOrSound(controllerSound);
    } else if (event.keyCode == 80) {
      pauseGame();
    }
  }
  
  // drop every 1 second
  let dropStart = Date.now();
  let gameOver = false;
  
  function drop() {
    console.log(paused);
    let now = Date.now();
    let delta = now - dropStart;
    
    if (delta > speed) {
      piece.moveDown();
      dropStart = Date.now();
    }
    
    if (!gameOver) {
      if (paused) return;
      requestAnimationFrame(drop);
    }
  }

  drop();

  function pauseGame() {
    paused = !paused; // toggle the gamePaused value (false <-> true)
    if (!paused) {
      drop();
      backgroundMusic.play();
      document.getElementById("paused").style.display = 'none';
    } else {
      backgroundMusic.stop();
      document.getElementById("paused").style.display = 'block';
    }
  }
}

const playbutton = document.getElementById("playbutton");

document.getElementById("playbutton").addEventListener("click", PLAYGAME);

let volumeIcon = document.getElementById("volume-icon");
volumeIcon.addEventListener("click", () => {
  if (!mute) {
    mute = true;
    backgroundMusic.stop();
    volumeIcon.className = "fas fa-volume-mute";
  } else {
    mute = false;
    backgroundMusic.play();
    volumeIcon.className = "fas fa-volume-up";
  }
});

function PLAYGAME() {
  document.getElementById("playbutton").style.display = 'none';
  playGame();
}




