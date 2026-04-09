// ---------- AUDIO ----------
let audioCtx, bellAudio, bellSource, bellPanner, bellGain;
let wallSound = new Audio("hit.mp3");
let stepSound = new Audio("step.wav");

// ---------- VOICE ----------
const speak = (text) => {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};

// ---------- GAME ----------
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("status");
const levelText = document.getElementById("level");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn  = document.getElementById("stopBtn");

let maze, player, goal;
let level = 0;
let running = false;
let paused = false;

// ---------- DFS MAZE ----------
function generateLevel(level) {
  let size = 7 + level * 2;
  if (size % 2 === 0) size++;

  let maze = Array.from({ length: size }, () =>
    Array(size).fill(1)
  );

  function carve(x, y) {
    let dirs = [[0,-2],[0,2],[-2,0],[2,0]]
      .sort(() => Math.random() - 0.5);

    for (let [dx, dy] of dirs) {
      let nx = x + dx;
      let ny = y + dy;

      if (ny > 0 && ny < size-1 && nx > 0 && nx < size-1 && maze[ny][nx] === 1) {
        maze[ny][nx] = 0;
        maze[y + dy/2][x + dx/2] = 0;
        carve(nx, ny);
      }
    }
  }

  maze[1][1] = 0;
  carve(1,1);

  return {
    maze,
    start: { x:1, y:1 },
    goal: { x:size-2, y:size-2 }
  };
}

// ---------- BUTTONS ----------
startBtn.onclick = startGame;
pauseBtn.onclick = togglePause;
stopBtn.onclick = stopGame;

// ---------- START ----------
function startGame() {

  if (running) return;

  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();

  if (bellAudio) {
    bellAudio.pause();
    bellAudio = null;
  }

  bellAudio = new Audio("bell.mp3");
  bellAudio.loop = true;

  bellSource = audioCtx.createMediaElementSource(bellAudio);
  bellPanner = audioCtx.createPanner();
  bellGain = audioCtx.createGain();

  bellPanner.panningModel = "HRTF";

  bellSource.connect(bellPanner);
  bellPanner.connect(bellGain);
  bellGain.connect(audioCtx.destination);

  bellAudio.play();

  level = 0;
  loadLevel();

  running = true;
  paused = false;

  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  stopBtn.style.display = "inline-block";

  // AUDIO ONBOARDING
  speak("Welcome to Soundscape Navigator. Use arrow keys to move. Follow the sound to reach the goal. Avoid walls. Press F to pause. Press J to stop the game.");
}

// ---------- STOP ----------
function stopGame() {
  running = false;
  paused = false;

  if (bellAudio) bellAudio.pause();
  stepSound.pause();

  level = 0;
  levelText.innerText = "Level: 1";

  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  stopBtn.style.display = "none";

  statusText.innerText = "Stopped";
}

// ---------- PAUSE ----------
function togglePause() {
  if (!running) return;

  paused = !paused;

  if (paused) {
    bellAudio.pause();
    stepSound.pause();
    pauseBtn.innerText = "Resume";
    speak("Paused");
  } else {
    bellAudio.play();
    pauseBtn.innerText = "Pause";
    speak("Resumed");
  }
}

// ---------- LOAD LEVEL ----------
function loadLevel() {
  let data = generateLevel(level);

  maze = data.maze;
  player = data.start;
  goal = data.goal;

  levelText.innerText = "Level: " + (level+1);
  statusText.innerText = "Find the goal";

  draw();
  updateAudio();
}

// ---------- GOAL ----------
function checkGoal() {
  if (player.x === goal.x && player.y === goal.y) {

    speak("Goal reached");

    level++;

    if (level >= 15) {
      speak("Congratulations. You completed all 15 levels");
      stopGame();
      return;
    }

    speak("New level");
    loadLevel();
  }
}

// ---------- AUDIO ----------
function updateAudio() {
  let dx = goal.x - player.x;
  let dy = goal.y - player.y;

  bellPanner.positionX.setValueAtTime(dx, audioCtx.currentTime);
  bellPanner.positionZ.setValueAtTime(dy, audioCtx.currentTime);
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let s = canvas.width / maze.length;

  for (let y=0;y<maze.length;y++){
    for (let x=0;x<maze.length;x++){
      ctx.fillStyle = maze[y][x] ? "#333" : "#111";
      ctx.fillRect(x*s,y*s,s,s);
    }
  }

  ctx.fillStyle="cyan";
  ctx.fillRect(player.x*s+s*0.25,player.y*s+s*0.25,s*0.5,s*0.5);

  ctx.fillStyle="red";
  ctx.fillRect(goal.x*s+s*0.25,goal.y*s+s*0.25,s*0.5,s*0.5);
}

// ---------- CONTROLS ----------
document.addEventListener("keydown", (e) => {

  let k = e.key.toLowerCase();

  // J toggle
  if (k === "j") {
    if (running) stopGame();
    else startGame();
    return;
  }

  if (k === "f") return togglePause();

  if (k === "h") return speak(
    "Use arrow keys to move. Sound gets louder near the goal. Press J to start or stop. Press F to pause."
  );

  if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;

  e.preventDefault();

  if (!running || paused) return;

  let nx = player.x;
  let ny = player.y;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  if (ny < 0 || nx < 0 || ny >= maze.length || nx >= maze.length || maze[ny][nx] === 1) {
    wallSound.currentTime = 0;
    wallSound.play();
    speak("Wall ahead");
    return;
  }

  player.x = nx;
  player.y = ny;

  stepSound.currentTime = 0;
  stepSound.play();

  updateAudio();
  draw();
  checkGoal();
});

// stop step sound
document.addEventListener("keyup", (e)=>{
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    stepSound.pause();
    stepSound.currentTime = 0;
  }
});
