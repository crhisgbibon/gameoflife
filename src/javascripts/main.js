function CalculateVh()
{
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

window.addEventListener('DOMContentLoaded', CalculateVh);
window.addEventListener('resize', CalculateVh);
window.addEventListener('orientationchange', CalculateVh);

class Cell{
  constructor(index, row, col, up, down, left, right, upLeft, upRight, downLeft, downRight, alive)
  {
    this.index = index;

    this.row = row;
    this.col = col;

    this.up = up;
    this.down = down;
    
    this.left = left;
    this.right = right;
    
    this.upLeft = upLeft;
    this.upRight = upRight;
    
    this.downLeft = downLeft;
    this.downRight = downRight;

    this.alive = alive;
    this.counter = 0;

    this.around = [];
  }

  Assess()
  {
    this.counter = 0;
    for(let i = 0; i < this.around.length; i++) if(cells[this.around[i]].alive) this.counter++;
  }

  DOA()
  {
    let result = 0;
    if(this.alive)
    {
      if(this.counter < 2) this.alive = false;
      if(this.counter == 2 || this.counter == 3) this.alive = true;
      if(this.counter > 3) this.alive = false;
    }
    else
    {
      if(this.counter == 3) this.alive = true;
    }
    if(this.alive)
    {
      if(buttons[this.index].dataset.state != "alive") { buttons[this.index].dataset.state = "alive"; result = 1;}
    }
    else
    {
      if(buttons[this.index].dataset.state != "dead") { buttons[this.index].dataset.state = "dead"; result = 1; }
    }
    return result;
  }
}

const playPauseButton = document.getElementById("playPauseButton");

const startButton = document.getElementById("startButton");
startButton.onclick = function(){ StartInterval() };

const stepButton = document.getElementById("stepButton");
stepButton.onclick = function(){ Step() };

const resetButton = document.getElementById("resetButton");
resetButton.onclick = function(){ Start() };

const countDisplay = document.getElementById("countDisplay");

const borderButton = document.getElementById("borderButton");
borderButton.onclick = function(){ ToggleBorder() };

const optionsButton = document.getElementById("optionsButton");
optionsButton.onclick = function(){ ToggleSettings() };

const settingsMenu = document.getElementById("settingsMenu");
settingsMenu.style.display = 'none';

const sizeAxis = document.getElementById("sizeAxis");
sizeAxis.onchange = function(){ UpdateSlider(sizeAxis.value, 1) };

const sizeDisplay = document.getElementById("sizeDisplay");
sizeDisplay.onchange = function(){ UpdateText(sizeDisplay.value, 1) };

const frequencyAxis = document.getElementById("frequencyAxis");
frequencyAxis.onchange = function(){ UpdateSlider(frequencyAxis.value, 2) };

const frequencyDisplay = document.getElementById("frequencyDisplay");
frequencyDisplay.onchange = function(){ UpdateText(frequencyDisplay.value, 2) };

sizeDisplay.value = sizeAxis.value;
frequencyDisplay.value = frequencyAxis.value;

const generateButton = document.getElementById("generateButton");
generateButton.onclick = function(){ ToggleSettings(); Start() };

const gameDiv = document.getElementById("gameDiv");
const cells = [];
const buttons = [];

let toggleS = false;
let toggleB = true;

let buttonSize = 0;

let size = 16;
let frequency = 1000;
let interval = null;
let generations = 0;
let deadGame = false;

function Start()
{
  if(interval != null) ClearInterval();
  playPauseButton.src = "./src/public/playCircled.svg";
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight * 0.925;
  let squareSize;
  if(screenWidth >= screenHeight) squareSize = screenHeight;
  else squareSize = screenWidth;
  squareSize = squareSize * 0.9;
  gameDiv.style.width = squareSize + "px";
  gameDiv.style.height = squareSize + "px";
  buttonSize = squareSize / size;
  gameDiv.innerHTML = "";
  cells.length = 0;
  buttons.length = 0;
  size = sizeAxis.value;
  frequency = frequencyAxis.value;
  generations = 0;
  deadGame = false;
  countDisplay.innerHTML = generations;
  let counter = 0;
  for(let x = 0; x < size; x++)
  {
    for(let y = 0; y < size; y++)
    {
      let cell = new Cell();
      cell.alive = false;
      FindIndex(counter, cell);
      cells.push(cell);
      let b = document.createElement("BUTTON");
      b.className = "gameButton";
      b.dataset.index = counter;
      b.dataset.state = "dead";
      b.style.width = buttonSize + "px";
      b.style.height = buttonSize + "px";
      b.onclick = function() { Flip(b.dataset.index) };
      gameDiv.appendChild(b);
      buttons.push(b);
      counter++;
    }
  }
  for(let i = 0; i < cells.length; i++)
  {
    if(cells[i].upLeft == -1) cells[i].upLeft = cells[cells[i].up].left;
    if(cells[i].upRight == -1) cells[i].upRight = cells[cells[i].up].right;
    if(cells[i].downLeft == -1) cells[i].downLeft = cells[cells[i].down].left;
    if(cells[i].downRight == -1) cells[i].downRight = cells[cells[i].down].right;
    cells[i].around = [cells[i].up, cells[i].down, cells[i].left, cells[i].right, cells[i].upLeft, cells[i].upRight, cells[i].downLeft, cells[i].downRight];
  }
}

function StartInterval()
{
  if(interval === null)
  {
    playPauseButton.src = "./src/public/playPause.svg";
    interval = setInterval(Iterate, frequency);
  }
  else
  {
    playPauseButton.src = "./src/public/playCircled.svg";
    clearInterval(interval);
    interval = null;
  };
}

function ClearInterval()
{
  if(interval == null) return;
  clearInterval(interval);
  interval = null;
}

function FindIndex(index, cell)
{
  let indexInt = parseInt(index);
  let sizeInt = parseInt(size);
  cell.index = index;
  let col = indexInt % size;
  let row = Math.floor(indexInt / size);
  cell.col = col;
  cell.row = row;
  if(row > 0) cell.up = (indexInt - sizeInt); else { let offset = sizeInt - cell.index; cell.up = (sizeInt * sizeInt) - offset; }
  if(row < (sizeInt - 1)) cell.down = (indexInt + sizeInt); else { let offset = cells.length - cell.index; cell.down = offset + cell.col; }
  if(col > 0) cell.left = (indexInt - 1); else { cell.left = cell.index + (sizeInt - 1); }
  if(col < (sizeInt - 1)) cell.right = (indexInt + 1); else { cell.right = cell.index - (sizeInt - 1); }
  if(row > 0 && col > 0) cell.upLeft = (indexInt - (sizeInt + 1)); else cell.upLeft = -1;
  if(row > 0 && col < (sizeInt - 1)) cell.upRight = (indexInt - (sizeInt - 1)); else cell.upRight = -1;
  if(row < (sizeInt - 1) && col > 0) cell.downLeft = (indexInt + (sizeInt - 1)); else cell.downLeft = -1;
  if(row < (sizeInt - 1) && col < (sizeInt - 1)) cell.downRight = (indexInt + (sizeInt + 1)); else cell.downRight = -1;
}

function Flip(index)
{
  if(interval != null || generations > 0) return;
  cells[index].alive = !cells[index].alive;
  if(cells[index].alive) buttons[index].dataset.state = "alive";
  else buttons[index].dataset.state = "dead";
}

function Iterate()
{
  if(cells.length == 0) return;
  if(deadGame) { if(interval != null) ClearInterval(); return; }
  let changes = 0;
  for(let i = 0; i < cells.length; i++) cells[i].Assess();
  for(let i = 0; i < cells.length; i++) changes += cells[i].DOA();
  if(changes == 0) deadGame = true;
  generations++;
  countDisplay.innerHTML = generations;
}

function Step()
{
  if(interval != null)
  {
    playPauseButton.src = "./src/public/playCircled.svg";
    ClearInterval();
  }
  Iterate();
}

function ReSize()
{
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight * 0.9;
  let squareSize;
  if(screenWidth >= screenHeight) squareSize = screenHeight;
  else squareSize = screenWidth;
  squareSize = squareSize * 0.9;
  gameDiv.style.width = squareSize + "px";
  gameDiv.style.height = squareSize + "px";
  buttonSize = squareSize / size;
  for(let i = 0; i < buttons.length; i++) { buttons[i].style.width = buttonSize + "px"; buttons[i].style.height = buttonSize + "px"; }
}

function UpdateSlider(value, index)
{
  value = value.toString();
  if(index == 1)
  {
    size = value;
    sizeDisplay.value = value;
  }
  if(index == 2)
  {
    frequency = value;
    frequencyDisplay.value = value;
  }
}

function UpdateText(value, index)
{
let toNum = Number(value);
if(!isNaN(toNum))
{
  if(index == 1)
  {
    if(toNum <= sizeAxis.max && toNum >= sizeAxis.min)
    {
      size = toNum;
      sizeAxis.value = toNum;
    }
    else
    {
      size = 10;
      sizeAxis.value = 10;
      sizeDisplay.value = 10;
    }
  }
  if(index == 2)
  {
    if(toNum <= frequencyAxis.max && toNum >= frequencyAxis.min)
    {
      frequency = toNum;
      frequencyAxis.value = toNum;
    }
    else
    {
      frequency = 1000;
      frequencyAxis.value = 1000;
      frequencyDisplay.value = 1000;
    }
  }
}
}

function ToggleSettings()
{
  toggleS = !toggleS;
  if(toggleS) settingsMenu.style.display = '';
  else settingsMenu.style.display = 'none';
}

function ToggleBorder()
{
  toggleB = !toggleB;
  if(toggleB) for(let i = 0; i < buttons.length; i++) { buttons[i].style.border = "1px solid var(--gridBorder)"; }
  else for(let i = 0; i < buttons.length; i++) { buttons[i].style.border = "0"; }
}

window.addEventListener('resize', ReSize);
document.addEventListener("DOMContentLoaded", Start);