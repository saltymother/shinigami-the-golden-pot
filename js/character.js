/**
 * Shinigami Character Controller & 3D Model for SHINIGAMI: THE GOLDEN POT
 * 
 * Creates a tall, slender, supernatural Japanese death spirit:
 * - Dark flowing robes with tattered swaying cloth streamers
 * - Deep shadow hood with pale porcelain face
 * - Deep faintly glowing supernatural eyes
 * - Long slender arms and spindly spectral fingers
 * - Supernatural levitating/gliding motion
 * - Seamless First-Person and Third-Person camera toggle
 */

window.ShinigamiController = (function() {

  class Shinigami {
    constructor(scene, camera, domElement) {
      this.scene = scene;
      this.camera = camera;
      this.domElement = domElement;

      // Camera modes: 'first_person' or 'third_person'
      this.cameraMode = 'first_person';
      this.fov = 75;

      // Spatial state
      this.position = new THREE.Vector3(0, 0, 0);
      this.velocity = new THREE.Vector3();
      this.rotation = new THREE.Euler(0, 0, 0, 'YXZ'); // Yaw (Y) then Pitch (X)
      this.moveSpeed = 4.2;
      this.glideSpeed = 6.2; // slight sprint
      this.isMoving = false;
      this.stepTimer = 0;
      this.stepInterval = 0.55;

      // Mouse look controls
      this.pitch = 0;
      this.yaw = 0;
      this.mouseSensitivity = 0.0022;
      this.isPointerLocked = false;

      // Inputs
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false
      };

      // 3D Visual Mesh Components
      this.mesh = new THREE.Group();
      this.clothStreamers = [];
      this.arms = { left: null, right: null };
      this.eyes = [];
      this.eyeLight = null;

      // Third-person camera smoothing
      this.tpTarget = new THREE.Vector3();
      this.tpCurrentCamPos = new THREE.Vector3();

      this.buildModel();
      this.scene.add(this.mesh);
      this.setupInputListeners();
    }

    // Build the 3D Shinigami Model
    buildModel() {
      // Materials
      const robeMaterial = new THREE.MeshStandardMaterial({
        color: 0x121419,
        roughness: 0.92,
        metalness: 0.05
      });

      const innerHoodMaterial = new THREE.MeshBasicMaterial({
        color: 0x040507
      });

      const paleFaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xe6e2da,
        roughness: 0.6,
        metalness: 0.1
      });

      const spectralEyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xaef5ff
      });

      const spectralFleshMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9d5cc,
        roughness: 0.7,
        metalness: 0.05
      });

      // Character height: ~2.4m tall (slender, imposing, otherworldly)
      const baseHeight = 2.4;

      // 1. Lower Robe (Flared tall cone hovering above floor)
      const robeGeo = new THREE.CylinderGeometry(0.35, 0.65, 1.5, 16, 4, true);
      const robe = new THREE.Mesh(robeGeo, robeMaterial);
      robe.position.y = 0.9;
      robe.castShadow = true;
      this.mesh.add(robe);

      // Hanging tattered cloth streamers at bottom of robe
      for (let i = 0; i < 8; i++) {
        const streamerGeo = new THREE.PlaneGeometry(0.12, 0.6, 1, 3);
        const streamer = new THREE.Mesh(streamerGeo, robeMaterial);
        const angle = (i / 8) * Math.PI * 2;
        streamer.position.set(Math.cos(angle) * 0.58, 0.35, Math.sin(angle) * 0.58);
        streamer.rotation.y = -angle + Math.PI / 2;
        this.clothStreamers.push({
          mesh: streamer,
          baseRotX: 0,
          phase: i * 0.8
        });
        this.mesh.add(streamer);
      }

      // 2. Torso & Chest Mantle
      const torsoGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.7, 12);
      const torso = new THREE.Mesh(torsoGeo, robeMaterial);
      torso.position.y = 1.85;
      this.mesh.add(torso);

      // Cowl / Mantle drape over shoulders
      const mantleGeo = new THREE.ConeGeometry(0.55, 0.6, 12, 1, true);
      const mantle = new THREE.Mesh(mantleGeo, robeMaterial);
      mantle.position.y = 1.95;
      this.mesh.add(mantle);

      // 3. Head & Deep Hood
      const headGroup = new THREE.Group();
      headGroup.position.y = 2.22;

      // Deep Shadow Hood
      const hoodGeo = new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.75);
      const hood = new THREE.Mesh(hoodGeo, robeMaterial);
      hood.rotation.x = 0.25;
      headGroup.add(hood);

      // Inner shadow recess
      const hoodRecessGeo = new THREE.SphereGeometry(0.26, 12, 12);
      const hoodRecess = new THREE.Mesh(hoodRecessGeo, innerHoodMaterial);
      hoodRecess.position.set(0, 0, 0.04);
      headGroup.add(hoodRecess);

      // Pale Supernatural Death Face (tilted slightly downward in cowl)
      const faceGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.26, 10);
      const face = new THREE.Mesh(faceGeo, paleFaceMaterial);
      face.position.set(0, -0.04, 0.1);
      face.rotation.x = -0.15;
      headGroup.add(face);

      // Deep, slightly glowing spectral eyes
      const eyeGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const leftEye = new THREE.Mesh(eyeGeo, spectralEyeMaterial);
      leftEye.position.set(-0.048, 0.01, 0.19);
      const rightEye = new THREE.Mesh(eyeGeo, spectralEyeMaterial);
      rightEye.position.set(0.048, 0.01, 0.19);
      headGroup.add(leftEye);
      headGroup.add(rightEye);
      this.eyes.push(leftEye, rightEye);

      // Faint spectral eye glow light
      this.eyeLight = new THREE.PointLight(0xaef5ff, 0.4, 3.5);
      this.eyeLight.position.set(0, 0, 0.3);
      headGroup.add(this.eyeLight);

      this.mesh.add(headGroup);

      // 4. Long Slender Arms & Spindly Hands
      const createArm = (isLeft) => {
        const armGroup = new THREE.Group();
        const side = isLeft ? -1 : 1;
        armGroup.position.set(side * 0.38, 1.95, 0);

        // Sleeves (draped wide Japanese kimono bell sleeves)
        const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.65, 10);
        const sleeve = new THREE.Mesh(sleeveGeo, robeMaterial);
        sleeve.position.set(0, -0.3, 0);
        sleeve.rotation.z = side * 0.15;
        armGroup.add(sleeve);

        // Pale spindly forearm & hand
        const forearmGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.5, 8);
        const forearm = new THREE.Mesh(forearmGeo, spectralFleshMaterial);
        forearm.position.set(0, -0.72, 0.08);
        forearm.rotation.x = 0.3;
        armGroup.add(forearm);

        // Long thin fingers
        const fingersGroup = new THREE.Group();
        fingersGroup.position.set(0, -0.96, 0.16);
        for (let f = -2; f <= 2; f++) {
          const fingerGeo = new THREE.CylinderGeometry(0.008, 0.005, 0.14, 4);
          const finger = new THREE.Mesh(fingerGeo, spectralFleshMaterial);
          finger.position.set(f * 0.015, -0.06, 0);
          finger.rotation.x = 0.2 + Math.abs(f) * 0.05;
          fingersGroup.add(finger);
        }
        armGroup.add(fingersGroup);

        this.mesh.add(armGroup);
        return armGroup;
      };

      this.arms.left = createArm(true);
      this.arms.right = createArm(false);
    }

    // Set position directly (e.g. initial spawn or teleports)
    setPosition(x, y, z) {
      this.position.set(x, y, z);
      this.mesh.position.copy(this.position);
      this.updateCameraTransform(0);
    }

    // Input Listeners
    setupInputListeners() {
      // Keyboard input
      window.addEventListener('keydown', (e) => {
        switch (e.code) {
          case 'KeyW':
          case 'ArrowUp':
            this.keys.forward = true;
            break;
          case 'KeyS':
          case 'ArrowDown':
            this.keys.backward = true;
            break;
          case 'KeyA':
          case 'ArrowLeft':
            this.keys.left = true;
            break;
          case 'KeyD':
          case 'ArrowRight':
            this.keys.right = true;
            break;
          case 'ShiftLeft':
          case 'ShiftRight':
            this.keys.sprint = true;
            break;
          case 'KeyV':
            this.toggleCameraMode();
            break;
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'KeyW':
          case 'ArrowUp':
            this.keys.forward = false;
            break;
          case 'KeyS':
          case 'ArrowDown':
            this.keys.backward = false;
            break;
          case 'KeyA':
          case 'ArrowLeft':
            this.keys.left = false;
            break;
          case 'KeyD':
          case 'ArrowRight':
            this.keys.right = false;
            break;
          case 'ShiftLeft':
          case 'ShiftRight':
            this.keys.sprint = false;
            break;
        }
      });

      // Mouse movement (Pointer Lock)
      document.addEventListener('mousemove', (e) => {
        if (!this.isPointerLocked) return;

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.yaw -= movementX * this.mouseSensitivity;
        this.pitch -= movementY * this.mouseSensitivity;

        // Clamp vertical look pitch to avoid neck flip
        const maxPitch = Math.PI / 2 - 0.05;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
      });

      // Pointer lock state changes
      document.addEventListener('pointerlockchange', () => {
        this.isPointerLocked = (document.pointerLockElement === this.domElement);
      });
    }

    requestPointerLock() {
      if (this.domElement && this.domElement.requestPointerLock) {
        this.domElement.requestPointerLock();
      }
    }

    exitPointerLock() {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    }

    toggleCameraMode() {
      this.cameraMode = (this.cameraMode === 'first_person') ? 'third_person' : 'first_person';
      // Adjust visibility: In first person, hide head/chest to prevent camera clipping
      const isFP = (this.cameraMode === 'first_person');
      this.mesh.visible = !isFP;
    }

    setCameraMode(mode) {
      if (mode === 'first_person' || mode === 'third_person') {
        this.cameraMode = mode;
        this.mesh.visible = (mode === 'third_person');
      }
    }

    // Update Physics, Motion, and Animations
    update(deltaTime, colliderCheckFn) {
      const dt = Math.min(deltaTime, 0.1);
      const time = performance.now() * 0.001;

      // 1. Calculate input motion vector in horizontal plane
      const moveDir = new THREE.Vector3();
      if (this.keys.forward) moveDir.z -= 1;
      if (this.keys.backward) moveDir.z += 1;
      if (this.keys.left) moveDir.x -= 1;
      if (this.keys.right) moveDir.x += 1;

      const isMoving = moveDir.lengthSq() > 0.001;
      this.isMoving = isMoving;

      let speed = this.keys.sprint ? this.glideSpeed : this.moveSpeed;

      if (isMoving) {
        moveDir.normalize();
        // Rotate direction by camera yaw
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        // Desired velocity
        const desiredVel = moveDir.clone().multiplyScalar(speed);
        this.velocity.lerp(desiredVel, dt * 10);
      } else {
        this.velocity.lerp(new THREE.Vector3(0, 0, 0), dt * 12);
      }

      // 2. Perform Collision-Aware Movement (Sliding along walls)
      if (this.velocity.lengthSq() > 0.0001) {
        const step = this.velocity.clone().multiplyScalar(dt);
        const radius = 0.42; // Collision cylinder radius

        // Try moving X first
        const testPosX = this.position.clone();
        testPosX.x += step.x;
        if (!colliderCheckFn || !colliderCheckFn(testPosX, radius)) {
          this.position.x = testPosX.x;
        } else {
          this.velocity.x = 0;
        }

        // Try moving Z
        const testPosZ = this.position.clone();
        testPosZ.z += step.z;
        if (!colliderCheckFn || !colliderCheckFn(testPosZ, radius)) {
          this.position.z = testPosZ.z;
        } else {
          this.velocity.z = 0;
        }
      }

      // 3. Footstep / Sound Cadence
      if (isMoving && this.velocity.length() > 0.5) {
        this.stepTimer += dt * (this.keys.sprint ? 1.3 : 1.0);
        if (this.stepTimer >= this.stepInterval) {
          this.stepTimer = 0;
          if (window.AudioEngine) {
            window.AudioEngine.playFootstep();
          }
        }
      } else {
        this.stepTimer = 0.2; // Ready to step quickly
      }

      // 4. Shinigami Spectral Levitation & Gliding Bob
      // Levitate smoothly above the floor
      const levitationHover = Math.sin(time * 2.2) * 0.05 + 0.12;
      this.mesh.position.set(this.position.x, this.position.y + levitationHover, this.position.z);
      this.mesh.rotation.y = this.yaw + Math.PI; // Face forward direction

      // Subtle body tilt when turning or gliding forward
      const currentSpeed = this.velocity.length();
      const tiltForward = (currentSpeed / this.glideSpeed) * 0.12;
      this.mesh.rotation.x = tiltForward;

      // Cloth streamers flutter
      this.clothStreamers.forEach((s) => {
        const sway = Math.sin(time * 5.0 + s.phase) * (0.1 + tiltForward * 0.4);
        s.mesh.rotation.x = sway;
      });

      // Long arms subtle ethereal floating sway
      if (this.arms.left && this.arms.right) {
        const armSway = Math.sin(time * 2.0) * 0.08;
        this.arms.left.rotation.x = armSway - tiltForward * 0.5;
        this.arms.right.rotation.x = -armSway - tiltForward * 0.5;
      }

      // Eye spectral light pulsation
      if (this.eyeLight) {
        this.eyeLight.intensity = 0.35 + Math.sin(time * 3.5) * 0.15;
      }

      // 5. Update Camera Transform
      this.updateCameraTransform(dt);
    }

    // Camera Positioning
    updateCameraTransform(dt) {
      const eyeHeight = 2.15; // Tall Shinigami eye line

      if (this.cameraMode === 'first_person') {
        // First-Person: Camera sits directly at eye height with subtle head glide bob
        const time = performance.now() * 0.001;
        const bobY = this.isMoving ? Math.sin(time * 8.0) * 0.025 : Math.sin(time * 2.2) * 0.015;
        const bobX = this.isMoving ? Math.cos(time * 4.0) * 0.015 : 0;

        this.camera.position.set(
          this.position.x + bobX,
          this.position.y + eyeHeight + bobY,
          this.position.z
        );

        // Apply pitch and yaw
        const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);

      } else {
        // Third-Person: Smooth follow camera behind the Shinigami
        const targetLookAt = new THREE.Vector3(
          this.position.x,
          this.position.y + 1.9,
          this.position.z
        );

        // Calculate offset vector based on yaw and pitch
        const distance = 3.6;
        const offset = new THREE.Vector3(
          Math.sin(this.yaw) * Math.cos(this.pitch) * distance,
          Math.sin(this.pitch) * distance + 0.5,
          Math.cos(this.yaw) * Math.cos(this.pitch) * distance
        );

        const targetCamPos = this.position.clone().add(offset);
        targetCamPos.y = Math.max(0.6, targetCamPos.y + eyeHeight);

        // Smooth camera lerp
        if (this.tpCurrentCamPos.lengthSq() < 0.1) {
          this.tpCurrentCamPos.copy(targetCamPos);
        } else {
          this.tpCurrentCamPos.lerp(targetCamPos, dt * 14);
        }

        this.camera.position.copy(this.tpCurrentCamPos);
        this.camera.lookAt(targetLookAt);
      }
    }

    // Get current look direction vector
    getLookDirection() {
      const dir = new THREE.Vector3(0, 0, -1);
      dir.applyEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
      return dir;
    }
  }

  return {
    Shinigami
  };
})();
