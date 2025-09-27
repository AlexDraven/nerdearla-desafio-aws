// Three.js setup para primera persona
let scene, camera, renderer, obstacles3D = [], ground3D, gridHelper;
const gameContainer = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Variables del juego
let gameRunning = true;
let score = 0;
let gameSpeed = 0.3;
let gameEndTime = 0;
let obstacleTimer = 0;

// Sistema de carriles
const lanes = [-3, 0, 3];
let currentLane = 1;
let playerX = lanes[currentLane];
const playerY = 1.6;

// Variables para movimiento del suelo
let groundOffset = 0;

// Variables para boost
let isBoosting = false;
let boostMultiplier = 1;
const boostIndicator = document.getElementById('boostIndicator');

function initThreeJS() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 120);
    
    // Cámara en primera persona
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, playerY, 0);
    camera.lookAt(0, playerY, -10);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameContainer.appendChild(renderer.domElement);
    
    // Ajustar cámara para pantalla completa
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0x00ff41, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ff41, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Crear entorno
    createEnvironment();
    
    // Crear fondo distante
    createDistantBackground();
    
    // Agregar efectos de HUD
    createHUD();
}

function createEnvironment() {
    // Suelo infinito
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.8
    });
    ground3D = new THREE.Mesh(groundGeometry, groundMaterial);
    ground3D.rotation.x = -Math.PI / 2;
    ground3D.position.y = 0;
    ground3D.receiveShadow = true;
    scene.add(ground3D);
    
    // Grid cyberpunk grande y continuo
    gridHelper = new THREE.GridHelper(100, 50, 0x00ff41, 0x00ff41);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Techo
    const ceilingGeometry = new THREE.PlaneGeometry(20, 200);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.3
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.set(0, 8, -50);
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);
}

function createDistantBackground() {
    // Montaña cyberpunk
    const mountainGeometry = new THREE.ConeGeometry(20, 25, 8);
    const mountainMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.8
    });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(0, 10, -60);
    scene.add(mountain);
    
    // Montañas laterales
    const smallMountain1 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    smallMountain1.position.set(-30, 8, -55);
    smallMountain1.scale.set(0.7, 0.8, 0.7);
    scene.add(smallMountain1);
    
    const smallMountain2 = new THREE.Mesh(mountainGeometry, mountainMaterial);
    smallMountain2.position.set(25, 6, -58);
    smallMountain2.scale.set(0.6, 0.9, 0.6);
    scene.add(smallMountain2);
    
    // Luna cyberpunk
    const moonGeometry = new THREE.SphereGeometry(4, 12, 12);
    const moonMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 0.7
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(-15, 25, -45);
    scene.add(moon);
    
    // Anillo de la luna
    const ringGeometry = new THREE.RingGeometry(5, 6, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(moon.position);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    
    // Estrellas brillantes
    const starGeometry = new THREE.SphereGeometry(0.4, 6, 6);
    const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 1.0
    });
    
    const starPositions = [
        {x: -25, y: 30, z: -50},
        {x: 5, y: 28, z: -48},
        {x: 20, y: 32, z: -52},
        {x: -5, y: 35, z: -47},
        {x: 30, y: 25, z: -49},
        {x: 15, y: 30, z: -51},
        {x: -10, y: 33, z: -49}
    ];
    
    starPositions.forEach(pos => {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(pos.x, pos.y, pos.z);
        scene.add(star);
    });
    
    // Torres distantes
    const towerGeometry = new THREE.BoxGeometry(1, 8, 1);
    const towerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.7
    });
    
    const towerPositions = [
        {x: -20, z: -45},
        {x: 10, z: -48},
        {x: -8, z: -46}
    ];
    
    towerPositions.forEach(pos => {
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.set(pos.x, 4, pos.z);
        scene.add(tower);
        
        // Luz en la torre
        const lightGeometry = new THREE.SphereGeometry(0.3, 6, 6);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0x00ff41 : 0xff0040,
            emissive: Math.random() > 0.5 ? 0x00ff41 : 0xff0040,
            emissiveIntensity: 0.9
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(pos.x, 8.5, pos.z);
        scene.add(light);
    });
}

function createHUD() {
    // Efecto de lentes en primera persona
    const glassGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
    const glassMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.1
    });
    const glassEffect = new THREE.Mesh(glassGeometry, glassMaterial);
    glassEffect.position.set(0, 0, -0.5);
    camera.add(glassEffect);
    scene.add(camera);
}

// Patrones de enemigos
const enemyPatterns = {
    skull: {
        pattern: [
            [0,0,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,0,0,1,1,1,1,0,0,1,1],
            [1,1,0,0,1,1,1,1,0,0,1,1],
            [1,1,0,0,1,1,1,1,0,0,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,1,1,1],
            [1,1,1,1,0,0,0,0,1,1,1,1],
            [1,1,1,1,1,0,0,1,1,1,1,1],
            [0,1,1,1,0,0,0,0,1,1,1,0],
            [0,1,0,1,0,1,1,0,1,0,1,0],
            [1,0,1,0,1,0,0,1,0,1,0,1],
            [0,1,0,1,0,1,1,0,1,0,1,0],
            [1,0,1,0,1,0,0,1,0,1,0,1]
        ],
        eyes: [{x: -0.9, y: 3.0}, {x: 0.9, y: 3.0}]
    },
    spider: {
        pattern: [
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,1,0,1,1,0,1,0,1],
            [0,0,1,0,0,0,0,1,0,0],
            [0,1,0,1,0,0,1,0,1,0],
            [1,0,1,0,0,0,0,1,0,1]
        ],
        eyes: [{x: -0.6, y: 2.7}, {x: 0.6, y: 2.7}]
    },
    robot: {
        pattern: [
            [0,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,1,1,1,1,0,0,1],
            [1,1,1,1,0,0,1,1,1,1],
            [1,1,0,1,1,1,1,0,1,1],
            [1,1,0,0,1,1,0,0,1,1],
            [0,1,1,0,0,0,0,1,1,0],
            [0,0,1,1,0,0,1,1,0,0],
            [0,1,0,1,1,1,1,0,1,0]
        ],
        eyes: [{x: -0.9, y: 2.4}, {x: 0.9, y: 2.4}]
    },
    alien: {
        pattern: [
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [0,0,0,1,1,0,1,0,0,0],
            [0,0,1,0,1,0,1,1,0,0],
            [0,1,0,1,0,0,0,1,1,0]
        ],
        eyes: [{x: -0.6, y: 2.1}, {x: 0.6, y: 2.1}]
    },
    demon: {
        pattern: [
            [1,0,0,0,0,0,0,0,0,1],
            [0,1,0,0,1,1,0,0,1,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,1,1,1,1,1,0,1],
            [1,0,0,1,0,0,1,0,0,1],
            [0,1,0,0,1,1,0,0,1,0],
            [1,0,1,0,0,0,0,1,0,1],
            [0,1,0,1,0,0,1,0,1,0]
        ],
        eyes: [{x: -0.6, y: 2.4}, {x: 0.6, y: 2.4}]
    }
};

function createObstacle(z) {
    const enemyGroup = new THREE.Group();
    
    // Seleccionar enemigo aleatorio
    const enemyTypes = Object.keys(enemyPatterns);
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const enemyData = enemyPatterns[randomType];
    
    // Material voxel (rojo sangre)
    const voxelMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x8b0000,
        emissive: 0x8b0000,
        emissiveIntensity: 0.5
    });
    
    const darkVoxelMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x660000,
        emissive: 0x660000,
        emissiveIntensity: 0.3
    });
    
    const voxelSize = 0.3;
    const voxelGeometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    
    // Construir el enemigo con voxels
    const pattern = enemyData.pattern;
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
                const voxel = new THREE.Mesh(voxelGeometry, voxelMaterial);
                voxel.position.set(
                    (col - (pattern[row].length - 1) / 2) * voxelSize,
                    2 + ((pattern.length - 1) / 2 - row) * voxelSize,
                    0
                );
                enemyGroup.add(voxel);
            }
        }
    }
    
    // Ojos brillantes
    const eyeGeometry = new THREE.BoxGeometry(voxelSize * 0.9, voxelSize * 0.9, voxelSize * 0.9);
    const eyeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 1.2
    });
    
    enemyData.eyes.forEach(eyePos => {
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(eyePos.x, eyePos.y, 0.1);
        enemyGroup.add(eye);
        
        // Pupila
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const pupilGeometry = new THREE.BoxGeometry(voxelSize * 0.4, voxelSize * 0.4, voxelSize * 0.4);
        const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil.position.set(eyePos.x, eyePos.y, 0.15);
        enemyGroup.add(pupil);
    });
    
    // Posición en carril aleatorio
    const randomLane = Math.floor(Math.random() * lanes.length);
    const laneX = lanes[randomLane];
    enemyGroup.position.set(laneX, 0, z);
    scene.add(enemyGroup);
    
    return {
        mesh: enemyGroup,
        z: z,
        x: laneX,
        lane: randomLane,
        width: 2.5,
        height: 5,
        type: randomType
    };
}

// Controles
document.addEventListener('keydown', (e) => {
    if (gameRunning) {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
            e.preventDefault();
            moveLeft();
        }
        if (e.code === 'KeyD' || e.code === 'ArrowRight') {
            e.preventDefault();
            moveRight();
        }
        if (e.code === 'Space') {
            e.preventDefault();
            isBoosting = true;
            boostMultiplier = 4.0;
            boostIndicator.classList.add('active');
        }
    }
    if ((e.code === 'Space' || e.code === 'Enter') && !gameRunning) {
        e.preventDefault();
        if (Date.now() - gameEndTime > 1000) {
            restartGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && gameRunning) {
        isBoosting = false;
        boostMultiplier = 1;
        boostIndicator.classList.remove('active');
    }
});

function moveLeft() {
    if (currentLane > 0) {
        currentLane--;
        playerX = lanes[currentLane];
    }
}

function moveRight() {
    if (currentLane < lanes.length - 1) {
        currentLane++;
        playerX = lanes[currentLane];
    }
}

function updatePlayer() {
    // Movimiento suave de cámara hacia el carril objetivo
    const targetX = playerX;
    camera.position.x += (targetX - camera.position.x) * 0.15;
    
    // Actualizar movimiento del suelo
    updateGround();
}

function updateGround() {
    if (gameRunning && gridHelper) {
        // Mover el grid de forma continua con boost
        groundOffset += gameSpeed * boostMultiplier;
        gridHelper.position.z = groundOffset % 4;
    }
}

function updateObstacles() {
    obstacleTimer++;
    if (obstacleTimer > 120) {
        const obstacle = createObstacle(-60);
        obstacles3D.push(obstacle);
        obstacleTimer = 0;
    }
    
    for (let i = obstacles3D.length - 1; i >= 0; i--) {
        const obstacle = obstacles3D[i];
        obstacle.z += gameSpeed * boostMultiplier;
        obstacle.mesh.position.z = obstacle.z;
        
        if (obstacle.z > 5) {
            scene.remove(obstacle.mesh);
            obstacles3D.splice(i, 1);
            score += 10;
            scoreElement.textContent = `SCORE: ${score}`;
            
            if (score % 20 === 0 && gameSpeed < 0.5) {
                gameSpeed += 0.03;
            }
            
            if (score >= 100) {
                gameWin();
            }
        }
    }
}

function checkCollisions() {
    for (let obstacle of obstacles3D) {
        // Rango de colisión más amplio y preciso
        if (obstacle.z > -1.0 && obstacle.z < 1.0) {
            if (obstacle.lane === currentLane) {
                gameOver();
                return;
            }
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
    gameSpeed = 0.3;
    obstacleTimer = 0;
    currentLane = 1;
    playerX = lanes[currentLane];
    groundOffset = 0;
    isBoosting = false;
    boostMultiplier = 1;
    boostIndicator.classList.remove('active');
    scoreElement.textContent = 'SCORE: 0';
    gameOverElement.querySelector('h2').textContent = 'CONNECTION LOST';
    gameOverElement.classList.remove('show');
    
    // Limpiar obstáculos
    obstacles3D.forEach(obstacle => scene.remove(obstacle.mesh));
    obstacles3D = [];
    
    // Resetear cámara y grid
    camera.position.set(playerX, playerY, 0);
    camera.rotation.set(0, 0, 0);
    
    if (gridHelper) {
        gridHelper.position.z = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        updatePlayer();
        updateObstacles();
        checkCollisions();
    }
    
    // Efectos de movimiento en primera persona
    const time = Date.now() * 0.001;
    
    // Balanceo sutil al caminar (más intenso con boost)
    if (gameRunning) {
        const intensity = isBoosting ? 0.05 : 0.02;
        const speed = isBoosting ? 12 : 8;
        camera.position.y = playerY + Math.sin(time * speed) * intensity;
        camera.rotation.z = Math.sin(time * speed) * (intensity * 0.15);
    }
    
    // Animación de LEDs
    obstacles3D.forEach(obstacle => {
        const leds = obstacle.mesh.children.filter(child => 
            child.material && child.material.emissive
        );
        leds.forEach((led, index) => {
            led.material.emissiveIntensity = 0.5 + Math.sin(time * 5 + index) * 0.3;
        });
    });
    
    // Efecto de niebla dinámica
    scene.fog.near = 5 + Math.sin(time * 0.5) * 2;
    
    renderer.render(scene, camera);
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicializar
initThreeJS();
animate();