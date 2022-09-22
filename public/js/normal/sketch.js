// Source image to chop up
let source;
// Tiles configuration
let tiles = [];
let cols = 4;
let rows = 4;
let w, h;

// Order of tiles
let board = [];

// Loading the image
function preload() {
  // get a random image from "https://picsum.photos/"
  let randomImage = Math.floor(Math.random() * 1000);
  source = loadImage("https://picsum.photos/400/400?image=" + randomImage);

  document.querySelector("main div").innerHTML = `
    <img src="https://picsum.photos/400/400?image=${randomImage}" alt="Original Image">
  `;
}

function setup() {
  document.querySelector("#status-value").innerText = "Playing...";
  document.querySelector("#status-value").style.color = "#ffdd00";

  createCanvas(400, 400);

  // put the canvas inside the main div
  let canvas = document.querySelector("canvas");
  document.querySelector("main .canvas-div").appendChild(canvas);

  // pixel dimensions of each tiles
  w = width / cols;
  h = height / rows;

  // Chop up source image into tiles
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;
      let img = createImage(w, h);
      img.copy(source, x, y, w, h, 0, 0, w, h);
      let index = i + j * cols;
      board.push(index);
      let tile = new Tile(index, img);
      tiles.push(tile);
    }
  }

  // Remove the last tile
  tiles.pop();
  board.pop();
  // -1 means empty spot
  board.push(-1);

  // Shuffle the board
  simpleShuffle(board);
}

// Swap two elements of an array
function swap(i, j, arr) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

// Pick a random spot to attempt a move
function randomMove(arr) {
  let r1 = floor(random(cols));
  let r2 = floor(random(rows));
  move(r1, r2, arr);
}

// Shuffle the board
function simpleShuffle(arr) {
  for (let i = 0; i < 1000; i++) {
    randomMove(arr);
  }
}

// Move based on click
function mousePressed() {
  let i = floor(mouseX / w);
  let j = floor(mouseY / h);
  move(i, j, board);
}

function draw() {
  background(0);

  // Draw the current board
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = i + j * cols;
      let x = i * w;
      let y = j * h;
      let tileIndex = board[index];
      if (tileIndex > -1) {
        let img = tiles[tileIndex].img;
        image(img, x, y, w, h);
      }
    }
  }

  // Show it as grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;
      strokeWeight(2);
      noFill();
      rect(x, y, w, h);
    }
  }

  // If it is solved
  if (isSolved()) {
    console.log("SOLVED");
    document.querySelector("#status-value").innerText = "SOLVED!";
    document.querySelector("#status-value").style.color = "green";
    noLoop();
  }
}

// Check if solved
function isSolved() {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== tiles[i].index) {
      return false;
    }
  }
  return true;
}

// Swap two pieces
function move(i, j, arr) {
  let blank = findBlank();
  let blankCol = blank % cols;
  let blankRow = floor(blank / rows);

  // Double check valid move
  if (isNeighbor(i, j, blankCol, blankRow)) {
    swap(blank, i + j * cols, arr);
  }
}

// Check if neighbor
function isNeighbor(i, j, x, y) {
  if (i !== x && j !== y) {
    return false;
  }

  if (abs(i - x) == 1 || abs(j - y) == 1) {
    return true;
  }
  return false;
}

function findBlank() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] == -1) return i;
  }
}
