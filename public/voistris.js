import { sendScore, getAllScores } from './score.js';
import * as Voistrimino from './voistrimino.js';

getAllScores().then((e) => {
  e.data.forEach((data, i) => {
    document.getElementById(`top-score-name-${i}`).innerHTML = data.name;
    document.getElementById(`top-score-score-${i}`).innerHTML = data.score;
  });
});

let favicon_images = [
                    "./favicon/blue-favicon.png",
                    "./favicon/yellow-favicon.png",
                    "./favicon/green-favicon.png",
                    "./favicon/red-favicon.png"
                ],
    image_counter = 0; // To keep track of the current image

setInterval(function() {
  let favicon = document.getElementById("favicon-link");
  favicon.href = favicon_images[image_counter];

  if (image_counter == favicon_images.length -1) {
    image_counter = 0;
  } else {
    image_counter++;
  }
}, 100);

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  if (src === "./sound/Tetris.mp3") {
    this.sound.setAttribute("loop", "true");
  }
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
}

const backgroundMusic = new sound("./sound/Tetris.mp3");
backgroundMusic.sound.volume = 0.3;
const controllerSound = new sound("./sound/control.wav");
controllerSound.sound.volume = 0.4;
const dropSound = new sound("./sound/drop.wav");
dropSound.sound.volume = 0.4;
const gameOverSound = new sound("./sound/game-over.wav");
const gameOverSound2 = new sound("./sound/game-over2.wav");
const levelUpSound = new sound("./sound/level-up.wav");
const levelUpSound2 = new sound("./sound/level-up2.wav");
levelUpSound2.sound.volume = 0.4;
const beep1 = new sound("./sound/count-beep.wav");
const beep2 = new sound("./sound/count-beep.wav");
const beep3 = new sound("./sound/count-beep.wav");
const go = new sound("./sound/go.wav");
const ready = new sound("./sound/ready.wav");
let mute = false;

function muteOrSound(sound) {
  if (!mute) {
    sound.play();
  } else {
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
let voiceOrKeyboard = null;

document.getElementById("game-end").style.display = 'none';
document.getElementById("paused").style.display = 'none';
document.getElementById("restart").addEventListener("click", () => window.location.reload());

function playGame() {  
  // the pieces and their colors
  const PIECES = [
    [Voistrimino.Z, "#ff0000", "./voistrimino-colors/next-red.png"], // red
    [Voistrimino.S, "#00ff00", "./voistrimino-colors/next-green.png"], // green
    [Voistrimino.T, "#cc00ff", "./voistrimino-colors/next-purple.png"], // purple
    [Voistrimino.O, "#ffff00", "./voistrimino-colors/next-yellow.png"], // yellow
    [Voistrimino.I, "#66ffff", "./voistrimino-colors/next-light-blue.png"], // light-blue
    [Voistrimino.L, "#ff6500", "./voistrimino-colors/next-orange.png"], // orange
    [Voistrimino.J, "#00ffcc", "./voistrimino-colors/next-mint.png"], // mint
    [Voistrimino.U, "#ffcccc", "./voistrimino-colors/next-pink.png"], // pink
    [Voistrimino.W, "#ff1cd0", "./voistrimino-colors/next-dark-pink.png"], // dark-pink
    [Voistrimino.PLUS, "#6300d9", "./voistrimino-colors/next-light-purple.png"], // light-purple
    [Voistrimino.DIAGONAL, "#ffffff", "./voistrimino-colors/next-white.png"], // white
    [Voistrimino.DOT, "#226f35", "./voistrimino-colors/next-forest-green.png"] // forest green
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
      piece = next;
      next = randomPiece();
      document.getElementById("next-piece-image").src = next.picture;
      this.unDraw();
    } else if (holdTime) {
      this.unDraw();
      piece = hold;

      piece.x = this.x;
      piece.y = this.y;

      if (piece.color === "#66ffff" && piece.x > 6) piece.x = 6;
      if (piece.x > 7) piece.x = 7;
      if (this.x < 0) piece.x = 0;

      hold = this;
      piece.draw();
      holdTime = false;
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
  let speed = 800;
  let level = 0;
  
  // lock piece
  Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeVoistrimino.length; r++) {
      for (let c = 0; c < this.activeVoistrimino.length; c++) {
        // skip vacant squares
        if (!this.activeVoistrimino[r][c]) continue;
  
        // pieces to lock on top = game over
        if (this.y + r < 0) {
          gameOver = true;
          backgroundMusic.sound.volume = 0;
          muteOrSound(gameOverSound);
          document.getElementById("gameover-score").innerHTML = score;
          document.getElementById("game-end").style.display = 'block';
          document.getElementById("game-end").addEventListener("click", () => {
            window.open('https://www.linkedin.com/in/miso-lee-872836149/', '_blank');
            window.location.reload();
          });

          sendScore({ name, score });
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

        muteOrSound(levelUpSound2);
  
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
  if (voiceOrKeyboard === "keyboard") {
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
      } else if (event.keyCode == 77) {
        if (!mute) {
          mute = true;
          backgroundMusic.stop();
          volumeIcon.className = "fas fa-volume-mute";
        } else {
          mute = false;
          backgroundMusic.play();
          volumeIcon.className = "fas fa-volume-up";
        }
      }
    }
  } else if (voiceOrKeyboard === "voice") {
    var ctrl = new anycontrol();

    const commandLeft = document.getElementById("voice-commands-left").value;
    const commandRight = document.getElementById("voice-commands-right").value;
    const commandDown = document.getElementById("voice-commands-down").value;
    const commandRotate = document.getElementById("voice-commands-rotate").value;
    const commandHold = document.getElementById("voice-commands-hold").value;
    const commandDrop = document.getElementById("voice-commands-drop").value;

    ctrl.addCommand(`${commandLeft}`, function () {
      piece.moveLeft();
      dropStart = Date.now();
    });

    ctrl.addCommand(`${commandRight}`, function () {
      piece.moveRight();
      dropStart = Date.now();
    });

    ctrl.addCommand(`${commandDown}`, function () {
      piece.moveDown();
      dropStart = Date.now();
    });

    ctrl.addCommand(`${commandRotate}`, function () {
      piece.rotate();
      dropStart = Date.now();
    });

    ctrl.addCommand(`${commandDrop}`, function () {
      piece.moveAllTheWayDown();
      dropStart = Date.now();
    });

    ctrl.addCommand(`${commandHold}`, function () {
      piece.holdPiece();
      dropStart = Date.now();
    });

    ctrl.addCommand("restart", function () {
      window.location.reload();
    });

    ctrl.addCommand("pause", function () {
      pauseGame();
    });

    ctrl.addCommand("play", function () {
      pauseGame();
    });

    ctrl.start();
  }
  
  // drop every 1 second
  let dropStart = Date.now();
  let gameOver = false;
  
  function drop() {
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
      muteOrSound(backgroundMusic);
      document.getElementById("paused").style.display = 'none';
    } else {
      backgroundMusic.stop();
      document.getElementById("paused").style.display = 'block';
    }
  }
}

const keyboard = document.getElementById("keyboard");
keyboard.addEventListener("click", () => {
  playbutton.style.visibility = 'visible';
  document.getElementById("choose-option").style.visibility = 'hidden';
});

const voiceInput = document.getElementById("voice-option");
const voice = document.getElementById("voice");
voice.addEventListener("click", () => {
  voiceInput.style.visibility = 'visible';
  document.getElementById("choose-option").style.visibility = 'hidden';
});

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

const playbutton = document.getElementById("playbutton");
playbutton.addEventListener("click", PLAYWITHKEYBOARD);

function PLAYCOUNTDOWN() {
  let countdown = document.getElementById("countdown");
  
  setTimeout(() => {
    backgroundMusic.stop();
    muteOrSound(beep1);
    countdown.innerHTML = 3;
    countdown.className = 'count';
    playbutton.style.backgroundColor = 'transparent';
    playbutton.removeEventListener("click", PLAYWITHKEYBOARD);
  }, 0);
  setTimeout(() => {
    muteOrSound(beep2);
    countdown.innerHTML = 2;
    countdown.className = 'count';
  }, 800);
  setTimeout(() => {
    muteOrSound(beep3);
    muteOrSound(ready);
    countdown.innerHTML = 1;
    countdown.className = 'count';
  }, 1600);
  setTimeout(() => {
    muteOrSound(go);
    countdown.innerHTML = "GO!";
    countdown.className = 'go';
    if (voiceOrKeyboard === "keyboard") {
      document.getElementById("commands").style.visibility = 'visible';
      document.getElementById("commands").style.animation = 'commands 0.7s';
    } else if (voiceOrKeyboard === "voice") {
      const commandLeft = document.getElementById("voice-commands-left").value;
      const commandRight = document.getElementById("voice-commands-right").value;
      const commandDown = document.getElementById("voice-commands-down").value;
      const commandRotate = document.getElementById("voice-commands-rotate").value;
      const commandHold = document.getElementById("voice-commands-hold").value;
      const commandDrop = document.getElementById("voice-commands-drop").value;
      
      document.getElementById("command-outline-hold").innerHTML = "HOLD";
      document.getElementById("command-outline-drop").innerHTML = "DROP";
      document.getElementById("command-outline-pause").style.display = "none";
      document.getElementById("command-outline-mute").style.display = "none";
      document.getElementById("command-outline-mute").style.display = "none";

      document.getElementById("voice-control-right").innerHTML = commandRight;
      document.getElementById("voice-control-left").innerHTML = commandLeft;
      document.getElementById("voice-control-rotate").innerHTML = commandRotate;
      document.getElementById("voice-control-down").innerHTML = commandDown;
      document.getElementById("voice-control-hold").innerHTML = commandHold;
      document.getElementById("voice-control-drop").innerHTML = commandDrop;
      document.getElementById("voice-control-mute").innerHTML = "RESTART";
      document.getElementById("voice-control-pause").innerHTML = "PAUSE / PLAY";

      document.getElementById("commands").style.visibility = 'visible';
      document.getElementById("commands").style.animation = 'commands 0.7s';

    }
    
    document.getElementById("scoreboard").style.visibility = 'visible';
    document.getElementById("scoreboard").style.animation = 'commands 0.7s';
    document.getElementById("score-level").style.visibility = 'visible';
    document.getElementById("score-level").style.animation = 'score-level 0.7s';
    document.getElementById("restart-volume").style.visibility = 'visible';
    document.getElementById("restart-volume").style.animation = 'restart-volume 5s';
  }, 2400);
  setTimeout(() => playbutton.style.display = 'none', 3200);
  setTimeout(() => {
    playGame();
    if (mute) {
      document.getElementById("volume-icon").className = "fas fa-volume-mute";
      backgroundMusic.stop();
    } else {
      backgroundMusic.play();
    }
  }, 3200);

}

const chooseVoicePlay = document.getElementById("choose-voice-play");
chooseVoicePlay.addEventListener("click", () => {
  document.getElementById("voice-option").style.visibility = 'hidden';
  document.getElementById("countdown").style.visibility = 'visible';
  PLAYGAMEWITHVOICE();
});

function PLAYWITHKEYBOARD() {
  voiceOrKeyboard = "keyboard";
  PLAYCOUNTDOWN();  
}

function PLAYGAMEWITHVOICE() {
  voiceOrKeyboard = "voice";
  mute = true;
  PLAYCOUNTDOWN();
}