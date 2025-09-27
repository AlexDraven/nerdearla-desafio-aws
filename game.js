const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Variables del juego
let gameRunning = true;
let score = 0;
let gameSpeed = 4;
let gameEndTime = 0;

// Jugador (Hacker)
const player = {
    x: 75,
    y: 450,
    width: 36,
    height: 48,
    velocityY: 0,
    jumping: false,
    grounded: true,
    animFrame: 0
};

// Obstáculos
let obstacles = [];
let obstacleTimer = 0;

// Física
const gravity = 0.8;
const jumpPower = -15;
const groundY = 450;

// Controles
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        e.preventDefault();
        jump();
    }
    if (e.code === 'Space' && !gameRunning) {
        e.preventDefault();
        // Solo reiniciar si han pasado al menos 500ms desde que terminó el juego
        if (Date.now() - gameEndTime > 1000) {
            restartGame();
        }
    }
});

function jump() {
    if (player.grounded) {
        player.velocityY = jumpPower;
        player.jumping = true;
        player.grounded = false;
    }
}

function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: groundY + 15,
        width: 24,
        height: 36
    });
}

function updatePlayer() {
    // Aplicar gravedad
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Verificar si está en el suelo
    if (player.y >= groundY) {
        player.y = groundY;
        player.velocityY = 0;
        player.jumping = false;
        player.grounded = true;
    }
}

function updateObstacles() {
    // Crear nuevos obstáculos
    obstacleTimer++;
    if (obstacleTimer > 120) { // Cada 2 segundos aprox
        createObstacle();
        obstacleTimer = 0;
    }

    // Mover obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        // Eliminar obstáculos que salieron de pantalla
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            scoreElement.textContent = `SCORE: ${score}`;
            
            // Aumentar velocidad cada 20 puntos
            if (score % 20 === 0) {
                gameSpeed += 0.3;
            }
            
            // Ganar al llegar a 100 puntos
            if (score >= 100) {
                gameWin();
            }
        }
    }
}

function checkCollisions() {
    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    }
}

function gameOver() {
    gameRunning = false;
    gameEndTime = Date.now();
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

function gameWin() {
    gameRunning = false;
    gameEndTime = Date.now();
    finalScoreElement.textContent = score;
    gameOverElement.querySelector('h2').textContent = 'ACCESS GRANTED';
    gameOverElement.classList.add('show');
}

function restartGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 4;
    obstacles = [];
    obstacleTimer = 0;
    player.y = groundY;
    player.velocityY = 0;
    player.jumping = false;
    player.grounded = true;
    scoreElement.textContent = 'SCORE: 0';
    gameOverElement.querySelector('h2').textContent = 'CONNECTION LOST';
    gameOverElement.classList.remove('show');
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;
    
    // Sombra elíptica
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, groundY + h + 8, w/2 + 2, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Piernas (vista lateral)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 8, y + 28, 8, h - 28); // pierna trasera
    ctx.fillRect(x + 18, y + 28, 8, h - 28); // pierna delantera
    
    // Costuras
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(x + 10, y + 30, 1, h - 30);
    ctx.fillRect(x + 20, y + 30, 1, h - 30);
    
    // Torso (perfil)
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(x + 6, y + 14, 20, 18);
    ctx.fillRect(x + 8, y + 16, 16, 12); // pecho
    
    // Brazo trasero
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(x + 4, y + 16, 4, 12);
    
    // Brazo delantero (en movimiento)
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(x + 24, y + 18, 6, 10);
    ctx.fillRect(x + 28, y + 22, 4, 6); // antebrazo
    
    // Capucha (perfil)
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(x + 8, y - 4, 16, 16);
    ctx.fillRect(x + 10, y - 2, 12, 12);
    ctx.fillStyle = '#050505';
    ctx.fillRect(x + 11, y - 3, 10, 3);
    
    // Cabeza (perfil)
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(x + 12, y + 4, 14, 12);
    ctx.fillRect(x + 14, y + 6, 10, 8);
    
    // Cabello (perfil)
    ctx.fillStyle = '#2f2f2f';
    ctx.fillRect(x + 12, y - 1, 14, 8);
    ctx.fillRect(x + 10, y + 1, 16, 6);
    // Mechones laterales
    ctx.fillRect(x + 8, y + 2, 3, 4);
    ctx.fillRect(x + 25, y + 2, 3, 4);
    
    // Lentes de sol (vista lateral)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 15, y + 7, 8, 4); // marco principal
    ctx.fillRect(x + 14, y + 8, 10, 2); // ensanchamiento
    
    // Cristal oscuro
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 16, y + 8, 6, 2);
    
    // Reflejo sutil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 16, y + 8, 2, 1);
    
    // Patilla
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 22, y + 8, 3, 1);
    
    // Nariz (perfil)
    ctx.fillStyle = '#e5d4a3';
    ctx.fillRect(x + 24, y + 11, 2, 2);
    
    // Barba (perfil)
    ctx.fillStyle = '#404040';
    ctx.fillRect(x + 18, y + 14, 6, 4);
    ctx.fillStyle = '#303030';
    ctx.fillRect(x + 19, y + 15, 4, 2);
    
    // Logo tech
    ctx.fillStyle = '#00ff41';
    ctx.fillRect(x + 12, y + 20, 8, 2);
    ctx.fillRect(x + 14, y + 22, 4, 1);
    
    // Zapatillas (vista lateral)
    ctx.fillStyle = '#000000';
    // Zapato trasero
    ctx.fillRect(x + 6, y + h - 6, 10, 6);
    ctx.fillRect(x + 2, y + h - 4, 6, 4); // punta
    // Zapato delantero
    ctx.fillRect(x + 18, y + h - 6, 10, 6);
    ctx.fillRect(x + 26, y + h - 4, 6, 4);
    
    // Suelas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + h - 3, 10, 3);
    ctx.fillRect(x + 18, y + h - 3, 10, 3);
    
    // Cordones
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + 10, y + h - 5, 3, 1);
    ctx.fillRect(x + 22, y + h - 5, 3, 1);
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        const x = obstacle.x;
        const y = obstacle.y;
        const w = obstacle.width;
        const h = obstacle.height;
        
        // Sombra del servidor
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x + 2, groundY + player.height + 2, w, 8);
        
        // Cuerpo del servidor
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(x, y, w, h);
        
        // Marco del servidor
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        
        // Luces LED del servidor
        ctx.fillStyle = '#ff0040';
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(x + 6, y + 2, 2, 2);
        ctx.fillRect(x + 10, y + 2, 2, 2);
        
        // Ranuras de ventilación
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
        for (let i = 0; i < h - 10; i += 4) {
            ctx.beginPath();
            ctx.moveTo(x + 2, y + 8 + i);
            ctx.lineTo(x + w - 2, y + 8 + i);
            ctx.stroke();
        }
    }
}

function drawGround() {
    const groundStart = groundY + player.height;
    
    // Plataforma cyberpunk
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, groundStart, canvas.width, 20);
    
    // Borde superior con glow
    ctx.fillStyle = '#00ff41';
    ctx.fillRect(0, groundStart, canvas.width, 2);
    
    // Líneas de circuito en el suelo
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, groundStart + 5);
        ctx.lineTo(i + 30, groundStart + 5);
        ctx.moveTo(i + 15, groundStart + 5);
        ctx.lineTo(i + 15, groundStart + 15);
        ctx.stroke();
    }
    
    // Puntos de conexión
    ctx.fillStyle = '#00ff41';
    for (let i = 15; i < canvas.width; i += 50) {
        ctx.fillRect(i - 1, groundStart + 4, 2, 2);
        ctx.fillRect(i - 1, groundStart + 14, 2, 2);
    }
}

function drawBackground() {
    // Fondo cyberpunk oscuro
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid cyberpunk
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 60) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Edificios cyberpunk en el fondo
    drawCyberBuildings();
    
    // Efectos de scanlines
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
    for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawCyberBuildings() {
    // Edificios en el fondo con luces
    const buildings = [
        {x: 150, y: 225, w: 90, h: 225},
        {x: 300, y: 150, w: 120, h: 300},
        {x: 525, y: 180, w: 105, h: 270},
        {x: 750, y: 120, w: 135, h: 330},
        {x: 975, y: 210, w: 112, h: 240}
    ];
    
    buildings.forEach(building => {
        // Silueta del edificio
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(building.x, building.y, building.w, building.h);
        
        // Ventanas con luces
        ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
        for (let i = 0; i < building.w; i += 22) {
            for (let j = 0; j < building.h; j += 30) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(building.x + i + 3, building.y + j + 3, 12, 18);
                    // Brillo interior
                    ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
                    ctx.fillRect(building.x + i + 5, building.y + j + 5, 8, 14);
                    ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
                }
            }
        }
    });
}

function gameLoop() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo
    drawBackground();

    if (gameRunning) {
        updatePlayer();
        updateObstacles();
        checkCollisions();
    }

    // Dibujar elementos del juego
    drawGround();
    drawPlayer();
    drawObstacles();

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();