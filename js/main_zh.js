"use strict";

let data = []; // 1: mine, 0: empty, -1: firstClick
let h, w, mine, count;
let startTime; 
let timeoutId;

const btn = document.getElementById("btn");
btn.addEventListener("click", init);
const text = document.getElementById("text");
const textContainer = document.getElementById("textContainer");
const board = document.getElementById("board");
const mineCount = document.querySelector(".mineCount");
const result = document.getElementById("result");
const time = document.getElementById("time");

// Initialize
function init() {
  // Setting size and mines
  h = Number(document.getElementById("h").value);
  w = Number(document.getElementById("w").value);
  mine = Number(document.getElementById("m").value);
  if (h * w - 9 < mine || mine <= 0) {
    result.innerHTML = '<p class="shake"><span class="errMess"></span>錯誤：請輸入正確的數值。</p>';
    return;
  }

  // Clear datas
  data = [];
  text.style.display = "none";
  textContainer.style.display = "none";
  board.innerHTML = "";
  board.style.pointerEvents = "auto";
  clearTimeout(timeoutId);
  result.textContent = "";
  count = mine;
  mineCount.textContent = count;
  time.textContent = "000";

  // Put board
  for (let i = 0; i < h; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < w; j++) {
      const td = document.createElement("td");
      td.addEventListener("click", leftClicked);
      td.addEventListener("contextmenu", rightClicked);
      tr.appendChild(td);
    }
    board.appendChild(tr);
  }
  board.classList.add("animate__animated");
  board.classList.add("animate__lightSpeedInLeft");
}

// Put mines
function putMine() {
  for (let i = 0; i < mine; i++) {
    while (true) {
      const y = Math.floor(Math.random() * h);
      const x = Math.floor(Math.random() * w);
      if (data[y][x] === 0) {
        data[y][x] = 1;
        // board.rows[y].cells[x].classList.add("mine");
        break;
      }
    }
  }
}

// LeftClick to Open the cell
function leftClicked() {
  const y = this.parentNode.rowIndex;  // row
  const x = this.cellIndex;            // col
  // If the cell is opened or flagged
  if (this.className === "open" || this.className === "flag") {
    return;
  }

  // First click
  if (!data.length) {
    startTime = Date.now();
    timer();
    // First, set all cells to 0
    for (let i = 0; i < h; i++) {
      data[i] = Array(w).fill(0);
    }
    // The cell and which around it, set -1
    // the selected cell => (x,y)
    // (x-1) to (x+1); (y-1) to (y+1)
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i >= 0 && i < h && j >= 0 && j < w) {
          data[i][j] = -1;
        }
      }
    }
    putMine();
  }

  // Determine if opened a mined cell
  if (data[y][x] === 1) {
    // Find mine where it is, then add .mine
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (data[i][j] === 1) {
          board.rows[i].cells[j].classList.add("mine");
        }
      }
    }
    board.style.pointerEvents = "none";
    result.innerHTML = "<p class='animate__animated animate__bounce'>GAME OVER</p>";
    clearTimeout(timeoutId);
    return;
  }

  // If no mines around the cell, just open it
  // else add the number how many mines around it
  let mines = countMine(y, x);
  if (mines === 0) {
    open(y, x);
  } else {
    this.textContent = mines;
    this.classList.add("open");
  }

  // Determine clear
  if (countOpenCell()) {
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        // Show all mines
        if (data[i][j] === 1) {
          board.rows[i].cells[j].classList.add("clear");
        }
      }
    }
    board.style.pointerEvents = "none";
    result.innerHTML = "<p class='zoomin'>CLEAR!!</p>";
    clearTimeout(timeoutId);
    return;
  }
}

// RightClick to Flag the cell
function rightClicked(e) {
  // the flagged cell can't be used
  e.preventDefault();
  if (this.className === "open") {
    return;
  }

  // switch the flag hide or show
  this.classList.toggle("flag");
  if (this.className === "flag") {
    count--;
    mineCount.textContent = count;
  } else {
    count++;
    mineCount.textContent = count;
  }
}

// Count the number of mines around the cell
function countMine(y, x) {
  let mines = 0;
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < h && j >= 0 && j < w) {
        if (data[i][j] === 1) {
          mines++;
        }
      }
    }
  }
  return mines;
}

// Open the free cell
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < h && j >= 0 && j < w) {
        let mines = countMine(i, j);
        if (
          board.rows[i].cells[j].className === "open" ||
          board.rows[i].cells[j].className === "flag"
        ) {
          continue;
        }
        if (mines === 0) {
          board.rows[i].cells[j].classList.add("open");
          open(i, j);
        } else {
          // the former function has return mines
          board.rows[i].cells[j].textContent = mines;
          board.rows[i].cells[j].classList.add("open");
        }
      }
    }
  }
}

// Count opend cells
function countOpenCell() {
  let openCell = 0;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (board.rows[i].cells[j].className === "open") {
        openCell++;
      }
    }
  }
  if (h * w - openCell === mine) {
    return true;    // go to determine clear
  }
}

// Stopwatch
function timer() {
  const d = new Date(Date.now() - startTime);
  const s = String(d.getSeconds()).padStart(3, "0");
  time.textContent = `${s}`;
  timeoutId = setTimeout(() => {
    timer();
  }, 1000);
}