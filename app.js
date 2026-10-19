const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const menuOverlay = document.getElementById('menu-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
let gameLoop;
let gameSpeed = 150;
let currentMode = 'classic';
let obstacles = [];
let particles = [];
let isGameOver = false;

highScoreEl.textContent = highScore;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type, duration, vol) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            return generateFood();
        }
    }
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x === food.x && obstacles[i].y === food.y) {
            return generateFood();
        }
    }
}

function generateMaze() {
    obstacles = [];
    if (currentMode === 'maze') {
        obstacles.push({x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12});
        obstacles.push({x: 9, y: 10}, {x: 8, y: 10});
        obstacles.push({x: 15, y: 5}, {x: 15, y: 6}, {x: 15, y: 7});
        obstacles.push({x: 5, y: 15}, {x: 6, y: 15}, {x: 7, y: 15});
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    scoreEl.textContent = score;
    particles = [];
    isGameOver = false;
    generateMaze();
    generateFood();
    clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function drawGame() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    obstacles.forEach(obs => {
        ctx.fillStyle = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0055';
        ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    });

    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ffff' : 'rgba(0, 255, 255, 0.6)';
        ctx.shadowBlur = index === 0 ? 20 : 10;
        ctx.shadowColor = '#00ffff';
        
        ctx.beginPath();
        ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    drawParticles();
}

function update() {
    if (isGameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (currentMode === 'wrap') {
        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;
    } else {
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return gameOver();
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            return gameOver();
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        createParticles(food.x, food.y, '#ffcc00');
        playSound(600, 'sine', 0.1, 0.5);
        generateFood();
        
        if (gameSpeed > 80) {
            gameSpeed -= 3;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }

    updateParticles();
    drawGame();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    playSound(150, 'sawtooth', 0.5, 0.5);
    createParticles(snake[0].x, snake[0].y, '#ff0055');
    drawGame();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('cyberSnakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
}

function changeDirection(dir) {
    if (dir === 'up' && dy === 0) { dx = 0; dy = -1; }
    if (dir === 'down' && dy === 0) { dx = 0; dy = 1; }
    if (dir === 'left' && dx === 0) { dx = -1; dy = 0; }
    if (dir === 'right' && dx === 0) { dx = 1; dy = 0; }
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }
    if ((e.key === 'ArrowUp' || e.key === 'w') && dy === 0) { dx = 0; dy = -1; }
    if ((e.key === 'ArrowDown' || e.key === 's') && dy === 0) { dx = 0; dy = 1; }
    if ((e.key === 'ArrowLeft' || e.key === 'a') && dx === 0) { dx = -1; dy = 0; }
    if ((e.key === 'ArrowRight' || e.key === 'd') && dx === 0) { dx = 1; dy = 0; }
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentMode = e.target.getAttribute('data-mode');
        menuOverlay.classList.add('hidden');
        gameSpeed = 150;
        resetGame();
    });
});

restartBtn.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    gameSpeed = 150;
    resetGame();
});

drawGame();