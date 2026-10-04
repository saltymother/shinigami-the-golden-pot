/**
 * Main Game Controller for SHINIGAMI: THE GOLDEN POT
 * 
 * Orchestrates:
 * - Three.js WebGL scene, renderer, camera, and atmospheric fog
 * - Game states: MENU, PLAYING, PAUSED, VICTORY
 * - Menu camera cinematic animation
 * - Shinigami player controller & 1st/3rd person camera
 * - Procedural maze and door interaction handling
 * - UI HUD prompts, modals, and settings
 * - Victory discovery sequence and restart flow
 */

window.GameEngine = (function() {
  let scene, camera, renderer;
  let maze, player;
  let gameState = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY'
  let currentInteractable = null;
  let objectiveTimeout = null;

  // Clock
  let lastTime = performance.now();

  // Menu camera cinematic state
  let menuCamPos = new THREE.Vector3(0, 1.8, 14);
  let menuCamTarget = new THREE.Vector3(0, 1.6, 0);

  // Settings
  const settings = {
    mouseSensitivity: 1.0,
    masterVolume: 0.8,
    ambientVolume: 0.7,
    fov: 75,
    cameraMode: 'first_person'
  };

  // DOM Elements
  const dom = {};

  function init() {
    cacheDomElements();
    setupThree();
    setupMaze();
    setupPlayer();
    setupEventListeners();
    setupSettings();

    // Start render loop
    lastTime = performance.now();
    requestAnimationFrame(renderLoop);
  }

  function cacheDomElements() {
    dom.canvas = document.getElementById('webgl-canvas');
    dom.mainMenu = document.getElementById('main-menu');
    dom.pauseMenu = document.getElementById('pause-menu');
    dom.controlsModal = document.getElementById('controls-modal');
    dom.settingsModal = document.getElementById('settings-modal');
    dom.victoryScreen = document.getElementById('victory-screen');
    dom.hud = document.getElementById('hud');
    dom.objective = document.getElementById('hud-objective');
    dom.crosshair = document.getElementById('hud-crosshair');
    dom.prompt = document.getElementById('hud-prompt');
    dom.fadeOverlay = document.getElementById('fade-overlay');

    // Buttons
    dom.btnPlay = document.getElementById('btn-play');
    dom.btnControls = document.getElementById('btn-controls');
    dom.btnSettings = document.getElementById('btn-settings');
    dom.btnCloseControls = document.getElementById('btn-close-controls');
    dom.btnCloseSettings = document.getElementById('btn-close-settings');
    dom.btnResume = document.getElementById('btn-resume');
    dom.btnPauseControls = document.getElementById('btn-pause-controls');
    dom.btnPauseSettings = document.getElementById('btn-pause-settings');
    dom.btnRestart = document.getElementById('btn-restart');
    dom.btnQuit = document.getElementById('btn-quit');
    dom.btnPlayAgain = document.getElementById('btn-play-again');

    // Settings inputs
    dom.sliderSens = document.getElementById('slider-sens');
    dom.sliderMaster = document.getElementById('slider-master');
    dom.sliderAmbient = document.getElementById('slider-ambient');
    dom.sliderFov = document.getElementById('slider-fov');
    dom.valSens = document.getElementById('val-sens');
    dom.valMaster = document.getElementById('val-master');
    dom.valAmbient = document.getElementById('val-ambient');
    dom.valFov = document.getElementById('val-fov');
    dom.selectCamMode = document.getElementById('select-cam-mode');
  }

  function setupThree() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a160a); // Deep yellow-black void

    // Heavy atmospheric Backrooms fog
    scene.fog = new THREE.FogExp2(0x231d0b, 0.038);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(settings.fov, aspect, 0.1, 120);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: dom.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Ambient fill light (very subtle so point lights dominate)
    const ambientLight = new THREE.AmbientLight(0x403618, 0.45);
    scene.add(ambientLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function setupMaze() {
    maze = new window.MazeSystem.Maze(scene);
    const genResult = maze.generate(Math.floor(Math.random() * 999999));
    return genResult;
  }

  function setupPlayer() {
    player = new window.ShinigamiController.Shinigami(scene, camera, dom.canvas);
    player.setPosition(0, 0, 3);
    player.setCameraMode(settings.cameraMode);
  }

  function setupEventListeners() {
    // Menu Buttons
    dom.btnPlay.addEventListener('click', startGame);
    dom.btnControls.addEventListener('click', () => showModal(dom.controlsModal));
    dom.btnSettings.addEventListener('click', () => showModal(dom.settingsModal));
    dom.btnCloseControls.addEventListener('click', () => hideModal(dom.controlsModal));
    dom.btnCloseSettings.addEventListener('click', () => hideModal(dom.settingsModal));

    // Pause Buttons
    dom.btnResume.addEventListener('click', resumeGame);
    dom.btnPauseControls.addEventListener('click', () => showModal(dom.controlsModal));
    dom.btnPauseSettings.addEventListener('click', () => showModal(dom.settingsModal));
    dom.btnRestart.addEventListener('click', restartGame);
    dom.btnQuit.addEventListener('click', returnToMenu);

    // Victory Button
    dom.btnPlayAgain.addEventListener('click', restartGame);

    // Canvas click: request pointer lock or interact
    dom.canvas.addEventListener('click', () => {
      if (gameState === 'PLAYING') {
        const isTouch = ('ontouchstart' in window) && window.innerWidth <= 900;
        if (!isTouch && !player.isPointerLocked) {
          player.requestPointerLock();
        } else {
          // Left click or tap acts as interaction alternative
          handleInteraction();
        }
      }
    });

    // Keyboard interact (E) and Pause (Esc)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (gameState === 'PLAYING') {
          handleInteraction();
        }
      } else if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          pauseGame();
        } else if (gameState === 'PAUSED') {
          resumeGame();
        }
      }
    });
  }

  function setupSettings() {
    // Sensitivity
    dom.sliderSens.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.mouseSensitivity = val;
      dom.valSens.textContent = `${val.toFixed(1)}x`;
      player.mouseSensitivity = 0.0022 * val;
    });

    // Master Volume
    dom.sliderMaster.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.masterVolume = val;
      dom.valMaster.textContent = `${Math.round(val * 100)}%`;
      if (window.AudioEngine) window.AudioEngine.setMasterVolume(val);
    });

    // Ambient Volume
    dom.sliderAmbient.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      settings.ambientVolume = val;
      dom.valAmbient.textContent = `${Math.round(val * 100)}%`;
      if (window.AudioEngine) window.AudioEngine.setAmbientVolume(val);
    });

    // FOV
    dom.sliderFov.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      settings.fov = val;
      dom.valFov.textContent = `${val}°`;
      camera.fov = val;
      camera.updateProjectionMatrix();
    });

    // Camera Mode Select
    dom.selectCamMode.addEventListener('change', (e) => {
      const mode = e.target.value;
      settings.cameraMode = mode;
      player.setCameraMode(mode);
    });
  }

  function showModal(modal) {
    modal.classList.add('visible');
  }

  function hideModal(modal) {
    modal.classList.remove('visible');
  }

  // Start Playing
  function startGame() {
    gameState = 'PLAYING';
    dom.mainMenu.classList.add('hidden');
    dom.hud.classList.remove('hidden');

    // Initialize Audio Engine on user gesture
    if (window.AudioEngine) {
      window.AudioEngine.init();
      window.AudioEngine.resume();
    }

    // Reset player position at start
    player.setPosition(0, 0, 3);
    player.yaw = 0;
    player.pitch = 0;
    const isTouch = ('ontouchstart' in window) && window.innerWidth <= 900;
    if (!isTouch) {
      try { player.requestPointerLock(); } catch (e) {}
    }

    // Show initial objective and fade it after 16s
    dom.objective.classList.remove('fade-out');
    if (objectiveTimeout) clearTimeout(objectiveTimeout);
    objectiveTimeout = setTimeout(() => {
      dom.objective.classList.add('fade-out');
    }, 16000);
  }

  // Pause Game
  function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    player.exitPointerLock();
    dom.pauseMenu.classList.remove('hidden');
  }

  // Resume Game
  function resumeGame() {
    if (gameState !== 'PAUSED') return;
    gameState = 'PLAYING';
    dom.pauseMenu.classList.add('hidden');
    hideModal(dom.controlsModal);
    hideModal(dom.settingsModal);
    player.requestPointerLock();
  }

  // Restart Run (generates fresh procedural maze with new route)
  function restartGame() {
    // Hide menus & victory
    dom.pauseMenu.classList.add('hidden');
    dom.victoryScreen.classList.add('hidden');
    dom.fadeOverlay.classList.remove('fade-to-black');
    hideModal(dom.controlsModal);
    hideModal(dom.settingsModal);

    // Re-generate maze with fresh seed
    maze.generate(Math.floor(Math.random() * 999999));
    player.setPosition(0, 0, 3);
    player.yaw = 0;
    player.pitch = 0;

    gameState = 'PLAYING';
    dom.hud.classList.remove('hidden');
    player.requestPointerLock();

    dom.objective.classList.remove('fade-out');
    if (objectiveTimeout) clearTimeout(objectiveTimeout);
    objectiveTimeout = setTimeout(() => {
      dom.objective.classList.add('fade-out');
    }, 16000);
  }

  // Return to Menu
  function returnToMenu() {
    gameState = 'MENU';
    player.exitPointerLock();
    dom.pauseMenu.classList.add('hidden');
    dom.victoryScreen.classList.add('hidden');
    dom.hud.classList.add('hidden');
    dom.mainMenu.classList.remove('hidden');
    hideModal(dom.controlsModal);
    hideModal(dom.settingsModal);
  }

  // Handle Player Interaction (E or Left Click)
  function handleInteraction() {
    if (!currentInteractable) return;

    if (currentInteractable.type === 'door') {
      maze.openDoor(currentInteractable.object);
      dom.prompt.classList.add('hidden');

      // Dismiss objective early once player starts opening doors
      if (dom.objective) dom.objective.classList.add('fade-out');

    } else if (currentInteractable.type === 'golden_pot') {
      triggerVictory();
    }
  }

  // Victory Sequence
  function triggerVictory() {
    if (gameState === 'VICTORY') return;
    gameState = 'VICTORY';
    player.exitPointerLock();

    // Sound: Resonant celestial discovery harmonic chord
    if (window.AudioEngine) {
      window.AudioEngine.playGoldenPotDiscovery();
    }

    // Hide HUD
    dom.hud.classList.add('hidden');

    // Display "You found it." in cinematic text, then slow fade
    const foundText = document.getElementById('found-text');
    foundText.classList.remove('hidden');
    foundText.classList.add('fade-in');

    // Smooth camera pan to look closely at the Golden Pot
    const potPos = new THREE.Vector3();
    maze.goldenPot.getWorldPosition(potPos);

    let progress = 0;
    const startCamPos = camera.position.clone();
    const targetCamPos = potPos.clone().add(new THREE.Vector3(0, 0.4, 2.2));

    const panInterval = setInterval(() => {
      progress += 0.015;
      camera.position.lerpVectors(startCamPos, targetCamPos, Math.min(1.0, progress));
      camera.lookAt(potPos);

      if (progress >= 1.0) {
        clearInterval(panInterval);

        // Fade overlay
        setTimeout(() => {
          dom.fadeOverlay.classList.add('fade-to-black');

          setTimeout(() => {
            foundText.classList.add('hidden');
            dom.victoryScreen.classList.remove('hidden');
          }, 1800);
        }, 1200);
      }
    }, 16);
  }

  // Main Render Loop
  function renderLoop(currentTime) {
    requestAnimationFrame(renderLoop);

    const deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;

    if (gameState === 'MENU') {
      // Cinematic slow drifting camera through the corridor
      const t = currentTime * 0.0003;
      menuCamPos.x = Math.sin(t) * 1.5;
      menuCamPos.y = 1.9 + Math.cos(t * 1.5) * 0.1;
      menuCamPos.z = 8 - (currentTime * 0.0005) % 12;

      camera.position.copy(menuCamPos);
      menuCamTarget.set(0, 1.6, menuCamPos.z - 10);
      camera.lookAt(menuCamTarget);

      // Keep lights and environment updating
      maze.update(deltaTime);

    } else if (gameState === 'PLAYING') {
      // Update player movement and physics
      player.update(deltaTime, (pos, radius) => maze.checkCollision(pos, radius));

      // Update room acoustics based on location
      maze.updatePlayerRoomAcoustics(player.position);

      // Update maze animations (light flickers, golden pot particles)
      maze.update(deltaTime);

      // Check for nearby interactable door or pot
      const lookDir = player.getLookDirection();
      const interactable = maze.getNearbyInteractable(player.position, lookDir);
      currentInteractable = interactable;

      if (interactable) {
        dom.prompt.textContent = interactable.prompt;
        dom.prompt.classList.remove('hidden');
      } else {
        dom.prompt.classList.add('hidden');
      }

    } else if (gameState === 'PAUSED') {
      // Ambient animation remains alive while paused
      maze.update(deltaTime);

    } else if (gameState === 'VICTORY') {
      maze.update(deltaTime);
    }

    renderer.render(scene, camera);
  }

  return {
    init,
    settings,
    handleInteraction,
    pauseGame,
    resumeGame
  };
})();

// Initialize once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.GameEngine.init();
});
