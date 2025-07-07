let canvas = document.getElementById('aim');
let ctx = canvas.getContext('2d');
let targets = [];
let score = 0, misses = 0;
let timer = 60, interval;
let currentMode = '';
let targetSize = 30;
let isRunning = false;

const usernameInput = document.getElementById('username');
const saveUsernameBtn = document.getElementById('save-username');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');
const statsSection = document.getElementById('stats');
const statsList = document.getElementById('stats-list');

function drawTarget(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();
}

function spawnTarget() {
  let x = Math.random() * (canvas.width - 2 * targetSize) + targetSize;
  let y = Math.random() * (canvas.height - 2 * targetSize) + targetSize;
  targets.push({ x, y });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  targets.forEach(t => drawTarget(t.x, t.y, targetSize));
}

canvas.addEventListener('click', (e) => {
  if (!isRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let hit = false;
  targets = targets.filter(t => {
    let dx = mouseX - t.x;
    let dy = mouseY - t.y;
    if (Math.sqrt(dx * dx + dy * dy) < targetSize) {
      score++;
      hit = true;
      return false;
    }
    return true;
  });

  if (!hit) misses++;

  document.getElementById('score-display').textContent = 'Score: ' + score;
  document.getElementById('miss-display').textContent = 'Misses: ' + misses;
  updateGame();
});

function startGame(mode) {
  currentMode = mode;
  targets = [];
  score = 0;
  misses = 0;
  document.getElementById('score-display').textContent = 'Score: 0';
  document.getElementById('miss-display').textContent = 'Misses: 0';
  timer = mode === 'mode2' ? 60 : 999;
  gameContainer.classList.remove('hidden');
  menu.classList.add('hidden');
  isRunning = true;

  if (mode === 'mode2') {
    interval = setInterval(() => {
      timer--;
      document.getElementById('timer-display').textContent = 'Time: ' + timer + 's';
      if (timer <= 0) {
        endGame();
      }
    }, 1000);
  } else {
    document.getElementById('timer-display').textContent = 'Time: --';
  }

  gameLoop();
}

function gameLoop() {
  if (!isRunning) return;
  if (targets.length < 5) spawnTarget();
  updateGame();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  isRunning = false;
  clearInterval(interval);
  let username = localStorage.getItem('username') || 'Player';
  let stats = JSON.parse(localStorage.getItem('gameStats')) || [];
  stats.push({ username, score, misses, mode: currentMode, date: new Date().toLocaleString() });
  localStorage.setItem('gameStats', JSON.stringify(stats));
  alert('Game Over! Score: ' + score);
  showMenu();
}

function showMenu() {
  gameContainer.classList.add('hidden');
  menu.classList.remove('hidden');
}

document.querySelectorAll('.game-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.mode));
});

document.getElementById('end-game').addEventListener('click', endGame);
document.getElementById('target-size').addEventListener('input', (e) => {
  targetSize = parseInt(e.target.value);
});

document.getElementById('view-stats').addEventListener('click', () => {
  menu.classList.add('hidden');
  statsSection.classList.remove('hidden');
  statsList.innerHTML = '';
  let stats = JSON.parse(localStorage.getItem('gameStats')) || [];
  stats.forEach(stat => {
    let li = document.createElement('li');
    li.textContent = `${stat.username} - ${stat.score} points - ${stat.misses} misses - ${stat.mode} - ${stat.date}`;
    statsList.appendChild(li);
  });
});

document.getElementById('back-to-menu').addEventListener('click', () => {
  statsSection.classList.add('hidden');
  menu.classList.remove('hidden');
});

saveUsernameBtn.addEventListener('click', () => {
  localStorage.setItem('username', usernameInput.value);
  alert('Username saved!');
});
