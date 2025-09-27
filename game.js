// Three.js setup para primera persona
let scene, camera, renderer, obstacles3D = [], ground3D, gridHelper;
let psychedelicLights = [], particles = [];
const gameContainer = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const hiScoreElement = document.getElementById('hiScore');
const progressFillElement = document.getElementById('progressFill');
const progressTextElement = document.getElementById('progressText');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Variables del juego
let gameStarted = false;
let gameRunning = true;
let score = 0;
let hiScore = parseInt(localStorage.getItem('cyberRunnerHiScore') || '0');
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

// Sistema de sonidos
let audioContext;
let soundEnabled = true;
let boostSound = null;
let backgroundMusic = null;
let musicStarted = false;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        soundEnabled = false;
    }
}

function createBackgroundMusic() {
    if (!soundEnabled || !audioContext) return null;
    
    const masterGain = audioContext.createGain();
    const distortion = audioContext.createWaveShaper();
    const compressor = audioContext.createDynamicsCompressor();
    const delay = audioContext.createDelay();
    const delayGain = audioContext.createGain();
    
    // Crear distorsión heavy para sonido industrial
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + 50) * x * 57 * Math.PI / 180) / (Math.PI + 50 * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = '4x';
    
    // Compresor para sonido más agresivo
    compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);
    
    // Setup delay industrial
    delay.delayTime.setValueAtTime(0.125, audioContext.currentTime); // 1/8 note delay
    delayGain.gain.setValueAtTime(0.4, audioContext.currentTime);
    
    masterGain.connect(distortion);
    distortion.connect(compressor);
    compressor.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(compressor);
    compressor.connect(audioContext.destination);
    masterGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    
    // Kick industrial pesado
    const kickOsc = audioContext.createOscillator();
    const kickOsc2 = audioContext.createOscillator();
    const kickGain = audioContext.createGain();
    const kickFilter = audioContext.createBiquadFilter();
    
    kickOsc.connect(kickFilter);
    kickOsc2.connect(kickFilter);
    kickFilter.connect(kickGain);
    kickGain.connect(masterGain);
    
    kickOsc.frequency.setValueAtTime(45, audioContext.currentTime);
    kickOsc2.frequency.setValueAtTime(90, audioContext.currentTime);
    kickOsc.type = 'sine';
    kickOsc2.type = 'square';
    kickFilter.type = 'lowpass';
    kickFilter.frequency.setValueAtTime(80, audioContext.currentTime);
    kickGain.gain.setValueAtTime(0, audioContext.currentTime);
    

    
    // Synth lead dark y agresivo
    const synthOsc = audioContext.createOscillator();
    const synthOsc2 = audioContext.createOscillator();
    const synthGain = audioContext.createGain();
    const synthFilter = audioContext.createBiquadFilter();
    const synthDistortion = audioContext.createWaveShaper();
    
    // Distorsión para synth
    const synthCurve = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) {
        const x = (i / 1024) - 1;
        synthCurve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.7);
    }
    synthDistortion.curve = synthCurve;
    
    synthOsc.connect(synthDistortion);
    synthOsc2.connect(synthDistortion);
    synthDistortion.connect(synthFilter);
    synthFilter.connect(synthGain);
    synthGain.connect(masterGain);
    
    synthOsc.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
    synthOsc2.frequency.setValueAtTime(277.18, audioContext.currentTime); // C#4 (disonancia)
    synthOsc.type = 'sawtooth';
    synthOsc2.type = 'square';
    synthFilter.type = 'bandpass';
    synthFilter.frequency.setValueAtTime(1500, audioContext.currentTime);
    synthFilter.Q.setValueAtTime(10, audioContext.currentTime);
    synthGain.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Drone dark atmosférico
    const droneOsc1 = audioContext.createOscillator();
    const droneOsc2 = audioContext.createOscillator();
    const droneOsc3 = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    const droneFilter = audioContext.createBiquadFilter();
    
    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneOsc3.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    
    droneOsc1.frequency.setValueAtTime(130.81, audioContext.currentTime); // C3
    droneOsc2.frequency.setValueAtTime(155.56, audioContext.currentTime); // D#3
    droneOsc3.frequency.setValueAtTime(196.00, audioContext.currentTime); // G3
    droneOsc1.type = 'sawtooth';
    droneOsc2.type = 'sawtooth';
    droneOsc3.type = 'triangle';
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(400, audioContext.currentTime);
    droneFilter.Q.setValueAtTime(8, audioContext.currentTime);
    droneGain.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Percussion industrial
    const percOsc = audioContext.createOscillator();
    const percGain = audioContext.createGain();
    const percFilter = audioContext.createBiquadFilter();
    
    percOsc.connect(percFilter);
    percFilter.connect(percGain);
    percGain.connect(masterGain);
    
    percOsc.frequency.setValueAtTime(12000, audioContext.currentTime);
    percOsc.type = 'square';
    percFilter.type = 'bandpass';
    percFilter.frequency.setValueAtTime(8000, audioContext.currentTime);
    percFilter.Q.setValueAtTime(20, audioContext.currentTime);
    percGain.gain.setValueAtTime(0, audioContext.currentTime);
    
    return {
        masterGain, distortion, compressor, delay, delayGain,
        kickOsc, kickOsc2, kickGain, kickFilter,

        synthOsc, synthOsc2, synthGain, synthFilter, synthDistortion,
        droneOsc1, droneOsc2, droneOsc3, droneGain, droneFilter,
        percOsc, percGain, percFilter
    };
}

function startBackgroundMusic() {
    if (backgroundMusic || !soundEnabled) return;
    
    backgroundMusic = createBackgroundMusic();
    if (!backgroundMusic) return;
    
    const { kickOsc, kickOsc2, kickGain, synthOsc, synthOsc2, synthGain, synthFilter, droneOsc1, droneOsc2, droneOsc3, droneGain, droneFilter, percOsc, percGain } = backgroundMusic;
    
    kickOsc.start();
    kickOsc2.start();

    synthOsc.start();
    synthOsc2.start();
    droneOsc1.start();
    droneOsc2.start();
    droneOsc3.start();
    percOsc.start();
    
    // Tempo dinámico que aumenta con el score (150-200 BPM)
    let beatCount = 0;
    
    function playBeat() {
        if (!gameRunning || !backgroundMusic) return;
        
        const time = audioContext.currentTime;
        const intensity = Math.min(1.0, score / 200);
        
        // Acelerar música con el score: 150 BPM base + hasta 80 BPM extra
        const baseBPM = 150;
        const maxExtraBPM = 80;
        const currentBPM = baseBPM + (intensity * maxExtraBPM);
        const beatInterval = 60 / currentBPM;
        
        // Kick industrial brutal cada beat
        if (beatCount % 2 === 0) {
            kickGain.gain.setValueAtTime(0.8 + intensity * 0.4, time);
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        }
        

        
        // Synth lead industrial rápido
        if (beatCount % 2 === 0) {
            const synthNotes = [329.63, 369.99, 440, 493.88, 440, 369.99]; // E4, F#4, A4, B4, A4, F#4
            const noteIndex = Math.floor(beatCount / 2) % synthNotes.length;
            synthOsc.frequency.setValueAtTime(synthNotes[noteIndex], time);
            synthOsc2.frequency.setValueAtTime(synthNotes[noteIndex] + 3, time); // Detuning sutil
            synthFilter.frequency.setValueAtTime(1800 + Math.sin(time * 2.5) * 600 + intensity * 800, time);
            synthGain.gain.setValueAtTime(0.4 + intensity * 0.3, time);
            synthGain.gain.exponentialRampToValueAtTime(0.1, time + 0.6);
        }
        
        // Drone atmosférico constante
        if (beatCount % 16 === 0) {
            droneFilter.frequency.setValueAtTime(400 + Math.sin(time * 0.3) * 200 + intensity * 150, time);
            droneGain.gain.setValueAtTime(0.2 + intensity * 0.2, time);
            droneGain.gain.exponentialRampToValueAtTime(0.15, time + 4);
        }
        
        // Percussion industrial rítmica
        if (beatCount % 4 === 1 || beatCount % 4 === 3) { // Ritmo más regular
            percGain.gain.setValueAtTime(0.35 + intensity * 0.25, time);
            percGain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
        }
        
        beatCount++;
        
        if (gameRunning && backgroundMusic) {
            setTimeout(playBeat, beatInterval * 1000);
        }
    }
    
    playBeat();
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.masterGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        setTimeout(() => {
            if (backgroundMusic) {
                backgroundMusic.kickOsc.stop();
                backgroundMusic.kickOsc2.stop();

                backgroundMusic.synthOsc.stop();
                backgroundMusic.synthOsc2.stop();
                backgroundMusic.droneOsc1.stop();
                backgroundMusic.droneOsc2.stop();
                backgroundMusic.droneOsc3.stop();
                backgroundMusic.percOsc.stop();
                backgroundMusic = null;
            }
        }, 800);
    }
}

function createBoostSound() {
    if (!soundEnabled || !audioContext) return null;
    
    const oscillator = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const distortion = audioContext.createWaveShaper();
    const filter = audioContext.createBiquadFilter();
    
    // Crear curva de distorsión dark
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = '4x';
    
    oscillator.connect(distortion);
    oscillator2.connect(distortion);
    distortion.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(90, audioContext.currentTime);
    oscillator.type = 'sawtooth';
    oscillator2.type = 'square';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    
    return { oscillator, oscillator2, gainNode, filter, distortion };
}

function startBoostSound() {
    if (boostSound) stopBoostSound();
    boostSound = createBoostSound();
    if (boostSound) {
        boostSound.oscillator.start();
        boostSound.oscillator2.start();
        // Modulación dark y agresiva
        const time = audioContext.currentTime;
        boostSound.oscillator.frequency.setValueAtTime(60, time);
        boostSound.oscillator.frequency.linearRampToValueAtTime(80, time + 0.3);
        boostSound.oscillator.frequency.linearRampToValueAtTime(60, time + 0.6);
        boostSound.oscillator2.frequency.setValueAtTime(90, time);
        boostSound.oscillator2.frequency.linearRampToValueAtTime(120, time + 0.4);
        boostSound.oscillator2.frequency.linearRampToValueAtTime(90, time + 0.8);
    }
}

function stopBoostSound() {
    if (boostSound) {
        boostSound.gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        boostSound.oscillator.stop(audioContext.currentTime + 0.15);
        boostSound.oscillator2.stop(audioContext.currentTime + 0.15);
        boostSound = null;
    }
}

function playSound(type) {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'move':
            // Sonido industrial limpio
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.type = 'square';
            break;
            
        case 'boost':
            // Sonido de activación industrial
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.type = 'square';
            break;
            
        case 'dodge':
            // Sonido industrial al esquivar
            oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.type = 'square';
            break;
            
        case 'click':
            // Click industrial
            oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.type = 'square';
            break;
            
        case 'score':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.type = 'sine';
            break;
            
        case 'collision':
            // Impacto industrial
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.type = 'square';
            break;
            
        case 'win':
            // Victoria industrial
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.4);
            oscillator.frequency.setValueAtTime(1600, audioContext.currentTime + 0.6);
            gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            oscillator.type = 'square';
            break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + (type === 'collision' ? 0.5 : type === 'win' ? 0.8 : type === 'boost' ? 0.3 : type === 'dodge' ? 0.15 : type === 'click' ? 0.05 : type === 'move' ? 0.1 : 0.1));
}

function initThreeJS() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 120);
    scene.psychedelicFog = scene.fog;
    
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
    
    // Psychedelic point lights
    for (let i = 0; i < 6; i++) {
        const light = new THREE.PointLight(0xff0080, 0.5, 20);
        light.position.set(
            (Math.random() - 0.5) * 20,
            Math.random() * 10 + 2,
            (Math.random() - 0.5) * 30
        );
        psychedelicLights.push(light);
        scene.add(light);
    }
    
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
    
    // Grid cyberpunk
    gridHelper = new THREE.GridHelper(100, 50, 0x00ff41, 0x00aa22);
    gridHelper.position.y = 0.01;
    gridHelper.position.x = 0.5;
    gridHelper.material.opacity = 0.8;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    

}

function createDistantBackground() {
    // Pirámides cyberpunk con bordes neón
    const pyramidGeometry = new THREE.ConeGeometry(20, 25, 4); // 4 lados para pirámide
    const pyramidMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.9
    });
    
    // Pirámide principal
    const mainPyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    mainPyramid.position.set(0, 10, -60);
    scene.add(mainPyramid);
    
    // Bordes neón de la pirámide principal
    const edgeGeometry = new THREE.EdgesGeometry(pyramidGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff41,
        transparent: true,
        opacity: 0.6
    });
    const pyramidEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    pyramidEdges.position.copy(mainPyramid.position);
    scene.add(pyramidEdges);
    
    // Pirámides laterales con bordes
    const smallPyramid1 = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    smallPyramid1.position.set(-30, 8, -55);
    smallPyramid1.scale.set(0.7, 0.8, 0.7);
    scene.add(smallPyramid1);
    
    const smallEdges1 = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    smallEdges1.position.copy(smallPyramid1.position);
    smallEdges1.scale.copy(smallPyramid1.scale);
    scene.add(smallEdges1);
    
    const smallPyramid2 = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    smallPyramid2.position.set(25, 6, -58);
    smallPyramid2.scale.set(0.6, 0.9, 0.6);
    scene.add(smallPyramid2);
    
    const smallEdges2 = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    smallEdges2.position.copy(smallPyramid2.position);
    smallEdges2.scale.copy(smallPyramid2.scale);
    scene.add(smallEdges2);
    
    // Sol cyberpunk con anillos múltiples
    const sunGeometry = new THREE.SphereGeometry(5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 1.0
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-15, 28, -50);
    scene.add(sun);
    
    // Anillos concéntricos del sol
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.RingGeometry(6 + i * 2, 7 + i * 2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff41,
            transparent: true,
            opacity: 0.4 - i * 0.1,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(sun.position);
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = i * 0.3;
        scene.add(ring);
    }
    
    // Psychedelic particles
    const particleGeometry = new THREE.SphereGeometry(0.2, 6, 6);
    
    // Crear campo de partículas psicodélicas
    for (let i = 0; i < 30; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff41
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 100,
            Math.random() * 40 + 20,
            -40 - Math.random() * 30
        );
        particles.push(particle);
        scene.add(particle);
    }
    
    // Estrellas geométricas
    const starGeometry = new THREE.OctahedronGeometry(0.5, 0);
    const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 1.2,
        wireframe: true
    });
    
    const starPositions = [
        {x: -35, y: 35, z: -55},
        {x: 10, y: 32, z: -52},
        {x: 35, y: 38, z: -58},
        {x: -10, y: 40, z: -50},
        {x: 25, y: 28, z: -54}
    ];
    
    starPositions.forEach(pos => {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(pos.x, pos.y, pos.z);
        scene.add(star);
    });
    
    // Rascacielos cyberpunk
    const buildingPositions = [
        {x: -25, z: -48, h: 12, w: 2},
        {x: 15, z: -52, h: 18, w: 1.5},
        {x: -8, z: -46, h: 15, w: 2.5},
        {x: 30, z: -55, h: 10, w: 1.8},
        {x: -35, z: -50, h: 20, w: 2.2}
    ];
    
    buildingPositions.forEach(building => {
        // Estructura principal
        const buildingGeometry = new THREE.BoxGeometry(building.w, building.h, building.w);
        const buildingMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0a0a0a,
            transparent: true,
            opacity: 0.8
        });
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.set(building.x, building.h/2, building.z);
        scene.add(buildingMesh);
        
        // Bordes neón del edificio
        const buildingEdges = new THREE.EdgesGeometry(buildingGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5
        });
        const buildingWireframe = new THREE.LineSegments(buildingEdges, edgeMaterial);
        buildingWireframe.position.copy(buildingMesh.position);
        scene.add(buildingWireframe);
        
        // Ventanas iluminadas
        for (let i = 0; i < 3; i++) {
            const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
            const windowMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0x00ff41 : 0xff0040,
                emissive: Math.random() > 0.5 ? 0x00ff41 : 0xff0040,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.9
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(
                building.x + (Math.random() - 0.5) * building.w * 0.8,
                building.h * 0.3 + i * (building.h * 0.2),
                building.z + building.w/2 + 0.01
            );
            scene.add(window);
        }
    });
    
    // Líneas de energía en el cielo
    const lineGeometry = new THREE.BufferGeometry();
    const linePoints = [];
    for (let i = 0; i < 50; i++) {
        linePoints.push(
            (Math.random() - 0.5) * 80,
            20 + Math.random() * 20,
            -40 - Math.random() * 20
        );
    }
    lineGeometry.setFromPoints(linePoints.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff41,
        transparent: true,
        opacity: 0.3
    });
    const energyLines = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(energyLines);
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
    
    // Colores específicos por tipo de enemigo
    const enemyColors = {
        skull: { main: 0x8b0000, dark: 0x660000 }, // Rojo sangre (original)
        spider: { main: 0x800080, dark: 0x4b0082 }, // Púrpura oscuro
        robot: { main: 0x4169e1, dark: 0x191970 }, // Azul metálico
        alien: { main: 0x32cd32, dark: 0x228b22 }, // Verde alienígena
        demon: { main: 0xff4500, dark: 0xb22222 }  // Naranja fuego
    };
    
    const colors = enemyColors[randomType];
    const voxelMaterial = new THREE.MeshBasicMaterial({ 
        color: colors.main
    });
    
    const darkVoxelMaterial = new THREE.MeshBasicMaterial({ 
        color: colors.dark
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
        color: 0x00ff41
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
    // Iniciar juego desde pantalla de inicio
    if (!gameStarted) {
        e.preventDefault();
        startGame();
        return;
    }
    
    if (gameRunning) {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
            e.preventDefault();
            moveLeft();
            playSound('move');
        }
        if (e.code === 'KeyD' || e.code === 'ArrowRight') {
            e.preventDefault();
            moveRight();
            playSound('move');
        }
        if (e.code === 'Space') {
            e.preventDefault();
            isBoosting = true;
            boostMultiplier = 4.0;
            boostIndicator.classList.add('active');
            playSound('boost');
            startBoostSound();
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
        stopBoostSound();
    }
});

// Sonido de click en botones
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        playSound('click');
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
            scoreElement.textContent = score.toString().padStart(3, '0');
            
            // Update progress bar
            const progress = Math.min((score / 200) * 100, 100);
            progressFillElement.style.width = progress + '%';
            progressTextElement.textContent = Math.floor(progress) + '%';
            
            if (score > hiScore) {
                hiScore = score;
                hiScoreElement.textContent = hiScore.toString().padStart(3, '0');
                localStorage.setItem('cyberRunnerHiScore', hiScore.toString());
            }
            playSound('dodge');
            playSound('score');
            
            if (score % 10 === 0 && gameSpeed < 1.5) {
                // Aumento exponencial: velocidad base * (1 + score/100)^2
                gameSpeed = 0.3 * Math.pow(1 + score / 100, 2);
            }
            
            if (score >= 200) {
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
    playSound('collision');
    stopBackgroundMusic();
}

function gameWin() {
    gameRunning = false;
    gameEndTime = Date.now();
    finalScoreElement.textContent = score;
    
    // Cambiar estilos para victoria
    const modalContent = gameOverElement.querySelector('.modal-content');
    const modalTitle = gameOverElement.querySelector('h2');
    const modalIcon = gameOverElement.querySelector('.modal-icon');
    
    modalContent.classList.add('victory');
    modalTitle.classList.add('victory');
    modalIcon.classList.add('victory');
    
    modalTitle.textContent = '💻 SYSTEM BREACHED 💻';
    modalIcon.textContent = '🔓';
    
    const btnText = gameOverElement.querySelector('#btnText');
    if (btnText) btnText.textContent = 'HACK AGAIN';
    
    gameOverElement.classList.add('show');
    playSound('win');
    stopBackgroundMusic();
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
    stopBoostSound();
    scoreElement.textContent = '000';
    progressFillElement.style.width = '0%';
    progressTextElement.textContent = '0%';
    
    // Resetear modal a estado de derrota
    const modalContent = gameOverElement.querySelector('.modal-content');
    const modalTitle = gameOverElement.querySelector('h2');
    const modalIcon = gameOverElement.querySelector('.modal-icon');
    
    modalContent.classList.remove('victory');
    modalTitle.classList.remove('victory');
    modalIcon.classList.remove('victory');
    
    modalTitle.textContent = 'CONNECTION LOST';
    modalIcon.textContent = '⚠️';
    
    const btnText = gameOverElement.querySelector('#btnText');
    if (btnText) btnText.textContent = 'RECONNECT';
    
    gameOverElement.classList.remove('show');
    
    // Reiniciar música
    if (musicStarted) {
        stopBackgroundMusic();
        setTimeout(() => startBackgroundMusic(), 100);
    }
    
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
    
    // Animación de enemigos
    obstacles3D.forEach(obstacle => {
        obstacle.mesh.rotation.y = Math.sin(time * 2) * 0.1;
    });
    
    // Efecto de niebla dinámica
    scene.fog.near = 5 + Math.sin(time * 0.5) * 2;
    
    // Update particles
    particles.forEach(particle => {
        particle.position.z += gameSpeed * 2;
        particle.rotation.x += 0.02;
        particle.rotation.y += 0.02;
        
        if (particle.position.z > 5) {
            particle.position.z = -50;
            particle.position.x = (Math.random() - 0.5) * 20;
            particle.position.y = Math.random() * 15;
        }
    });
    
    renderer.render(scene, camera);
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicializar audio automáticamente
function tryStartMusic() {
    if (!musicStarted && audioContext) {
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                if (gameRunning) {
                    startBackgroundMusic();
                    musicStarted = true;
                }
            });
        } else if (gameRunning) {
            startBackgroundMusic();
            musicStarted = true;
        }
    }
}

// Intentar iniciar música inmediatamente y con múltiples eventos
document.addEventListener('click', tryStartMusic);
document.addEventListener('keydown', tryStartMusic);
document.addEventListener('DOMContentLoaded', tryStartMusic);
window.addEventListener('load', tryStartMusic);

// Intentar iniciar música múltiples veces
setTimeout(tryStartMusic, 100);
setTimeout(tryStartMusic, 500);
setTimeout(tryStartMusic, 1000);
setTimeout(tryStartMusic, 2000);

function startGame() {
    gameStarted = true;
    document.getElementById('startScreen').classList.add('hidden');
    tryStartMusic();
}

// Inicializar
hiScoreElement.textContent = hiScore.toString().padStart(3, '0');
initAudio();
initThreeJS();
animate();