/**
 * Procedural Maze & Architectural System for SHINIGAMI: THE GOLDEN POT
 * 
 * Seamless spatial dimension with zero gaps:
 * - 4-Way Crossroads and intersections
 * - Claustrophobic narrow halls and tight multi-chamber passages
 * - Megalophobia colossal chambers with massive echoing pillars
 * - Impossible architectural anomalies (doors high on walls, staircases to ceiling, solitary gates)
 * - The Brighter Door Mechanic: the correct door has slightly stronger, warmer illumination and cleaner frame
 * - The Golden Pot Sanctum with ornate golden urn, divine pedestal, and floating celestial motes
 */

window.MazeSystem = (function() {

  class Maze {
    constructor(scene) {
      this.scene = scene;
      this.rootGroup = new THREE.Group();
      this.scene.add(this.rootGroup);

      this.rooms = new Map();
      this.doors = [];
      this.colliders = []; // Array of THREE.Box3
      this.flickeringLights = [];
      this.goldenPot = null;
      this.goldenPotParticles = null;
      this.currentRoom = null;

      // Shared Materials
      this.materials = this.initMaterials();
    }

    initMaterials() {
      const tex = window.TextureGenerator;
      return {
        wall: new THREE.MeshStandardMaterial({
          map: tex.getYellowWall(),
          roughness: 0.88,
          metalness: 0.05
        }),
        cleanWall: new THREE.MeshStandardMaterial({
          map: tex.getCleanYellowWall(),
          roughness: 0.85,
          metalness: 0.05
        }),
        carpet: new THREE.MeshStandardMaterial({
          map: tex.getCarpet(),
          roughness: 0.95,
          metalness: 0.02
        }),
        ceiling: new THREE.MeshStandardMaterial({
          map: tex.getCeiling(),
          roughness: 0.9,
          metalness: 0.05
        }),
        concrete: new THREE.MeshStandardMaterial({
          map: tex.getConcrete(),
          roughness: 0.9,
          metalness: 0.1
        }),
        lightCover: new THREE.MeshBasicMaterial({
          map: tex.getLightCover()
        }),
        darkMetal: new THREE.MeshStandardMaterial({
          color: 0x22262c,
          roughness: 0.7,
          metalness: 0.6
        }),
        gold: new THREE.MeshStandardMaterial({
          map: tex.getGold(),
          roughness: 0.25,
          metalness: 0.92,
          emissive: 0x443000,
          emissiveIntensity: 0.3
        })
      };
    }

    // Clear previous dimension
    clear() {
      while (this.rootGroup.children.length > 0) {
        const obj = this.rootGroup.children[0];
        this.rootGroup.remove(obj);
      }
      this.rooms.clear();
      this.doors = [];
      this.colliders = [];
      this.flickeringLights = [];
      this.goldenPot = null;
      this.goldenPotParticles = null;
      this.currentRoom = null;
    }

    // Helper: Add Floor/Ceiling Box
    createBox(w, h, d, mat, pos, parent = null) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      if (pos) mesh.position.copy(pos);
      (parent || this.rootGroup).add(mesh);
      return mesh;
    }

    // Add Solid Collider Box
    addCollider(minX, minY, minZ, maxX, maxY, maxZ) {
      const box = new THREE.Box3(
        new THREE.Vector3(minX, minY, minZ),
        new THREE.Vector3(maxX, maxY, maxZ)
      );
      this.colliders.push(box);
    }

    // Add Fluorescent Ceiling Light Fixture
    addCeilingLight(pos, intensity = 1.0, isFlickering = false) {
      const cover = this.createBox(1.4, 0.08, 0.6, this.materials.lightCover, pos);

      const light = new THREE.PointLight(0xfff5c0, intensity * 0.9, 14, 1.4);
      light.position.set(pos.x, pos.y - 0.2, pos.z);
      this.rootGroup.add(light);

      if (isFlickering) {
        this.flickeringLights.push({
          light,
          cover,
          baseIntensity: intensity * 0.9,
          timer: Math.random() * 5
        });
      }
      return light;
    }

    // ==========================================
    // THE BLUE DOOR & BRIGHTER DOOR MECHANIC
    // ==========================================
    addBlueDoor(id, pos, rotationY, targetRoomId, isCorrectPath, label = "B-04") {
      const isBrighter = isCorrectPath;
      const doorWidth = 1.6;
      const doorHeight = 2.6;
      const doorDepth = 0.12;

      const group = new THREE.Group();
      group.position.copy(pos);
      group.rotation.y = rotationY;

      // Frame
      const frameMat = this.materials.darkMetal;
      this.createBox(doorWidth + 0.3, 0.15, 0.2, frameMat, new THREE.Vector3(0, doorHeight + 0.075, 0), group);
      this.createBox(0.15, doorHeight, 0.2, frameMat, new THREE.Vector3(-(doorWidth / 2 + 0.075), doorHeight / 2, 0), group);
      this.createBox(0.15, doorHeight, 0.2, frameMat, new THREE.Vector3((doorWidth / 2 + 0.075), doorHeight / 2, 0), group);

      // Door Leaf (anchored on left hinge)
      const hingeGroup = new THREE.Group();
      hingeGroup.position.set(-doorWidth / 2, 0, 0);

      const doorTex = window.TextureGenerator.getBlueDoor(label, isBrighter);
      const doorMat = new THREE.MeshStandardMaterial({
        map: doorTex,
        roughness: isBrighter ? 0.62 : 0.78,
        metalness: 0.3
      });

      const leafMesh = this.createBox(doorWidth, doorHeight, doorDepth, doorMat, new THREE.Vector3(doorWidth / 2, doorHeight / 2, 0), hingeGroup);

      // Brass Handle
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x998033, roughness: 0.3, metalness: 0.8 });
      const handleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06), handleMat);
      handleBase.position.set(doorWidth - 0.18, 1.1, 0.08);
      handleBase.rotation.x = Math.PI / 2;
      hingeGroup.add(handleBase);

      const handleLever = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.025), handleMat);
      handleLever.position.set(doorWidth - 0.12, 1.1, 0.11);
      hingeGroup.add(handleLever);

      group.add(hingeGroup);

      // ==============================================
      // SUBTLE BRIGHTER DOOR ILLUMINATION
      // ==============================================
      const lightColor = isBrighter ? 0xfff4d2 : 0xd8bd65; // warmer, cleaner vs dingy yellow
      const lightIntensity = isBrighter ? 1.6 : 0.88;     // perceptible upon observation
      const lightDistance = isBrighter ? 10 : 6.5;

      const doorLight = new THREE.PointLight(lightColor, lightIntensity, lightDistance, 1.5);
      doorLight.position.set(0, doorHeight + 0.35, 0.55);
      group.add(doorLight);

      if (isBrighter) {
        // Subtle warm glow under threshold
        const thresholdGlow = new THREE.PointLight(0xffecc0, 0.6, 2.8);
        thresholdGlow.position.set(0, 0.08, 0.35);
        group.add(thresholdGlow);
      }

      this.rootGroup.add(group);

      // Collider
      const colliderBox = new THREE.Box3();
      const doorObj = {
        id,
        position: pos.clone(),
        rotationY,
        targetRoomId,
        isCorrectPath,
        isBrighter,
        label,
        isOpen: false,
        hingeGroup,
        group,
        light: doorLight,
        colliderBox
      };

      this.updateDoorCollider(doorObj);
      this.doors.push(doorObj);
      return doorObj;
    }

    updateDoorCollider(doorObj) {
      if (doorObj.isOpen) {
        doorObj.colliderBox.makeEmpty();
      } else {
        const cos = Math.cos(doorObj.rotationY);
        const sin = Math.sin(doorObj.rotationY);
        const sizeX = Math.abs(cos * 1.8) + Math.abs(sin * 0.4);
        const sizeZ = Math.abs(sin * 1.8) + Math.abs(cos * 0.4);
        doorObj.colliderBox.setFromCenterAndSize(
          new THREE.Vector3(doorObj.position.x, doorObj.position.y + 1.3, doorObj.position.z),
          new THREE.Vector3(sizeX, 2.6, sizeZ)
        );
      }
    }

    openDoor(doorObj) {
      if (doorObj.isOpen) return;
      doorObj.isOpen = true;
      this.updateDoorCollider(doorObj);

      if (window.AudioEngine) {
        window.AudioEngine.playDoorOpen();
      }

      const startRot = 0;
      const targetRot = Math.PI * 0.48;
      const startTime = performance.now();
      const duration = 750;

      const animateHinge = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1.0, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        doorObj.hingeGroup.rotation.y = startRot + targetRot * ease;

        if (progress < 1.0) {
          requestAnimationFrame(animateHinge);
        }
      };
      requestAnimationFrame(animateHinge);
    }

    // Helper: Solid Wall Segment
    createSolidWall(wx, wz, length, height, rotationY) {
      const wallThickness = 0.4;
      const group = new THREE.Group();
      group.position.set(wx, 0, wz);
      group.rotation.y = rotationY;

      this.createBox(length, height, wallThickness, this.materials.wall, new THREE.Vector3(0, height / 2, 0), group);
      this.rootGroup.add(group);

      const cos = Math.cos(rotationY);
      const sin = Math.sin(rotationY);
      const bw = Math.abs(cos * length) + Math.abs(sin * wallThickness);
      const bd = Math.abs(sin * length) + Math.abs(cos * wallThickness);
      this.addCollider(wx - bw / 2, 0, wz - bd / 2, wx + bw / 2, height, wz + bd / 2);
    }

    // Helper: Wall with Doorway Opening
    buildWallWithDoorway(wx, wz, length, height, rotationY, doorCallback) {
      const doorW = 1.9;
      const doorH = 2.7;
      const wallThickness = 0.4;
      const segW = (length - doorW) / 2;

      const group = new THREE.Group();
      group.position.set(wx, 0, wz);
      group.rotation.y = rotationY;

      // Left segment
      this.createBox(segW, height, wallThickness, this.materials.wall, new THREE.Vector3(-(doorW / 2 + segW / 2), height / 2, 0), group);
      // Right segment
      this.createBox(segW, height, wallThickness, this.materials.wall, new THREE.Vector3((doorW / 2 + segW / 2), height / 2, 0), group);
      // Lintel over door
      const lintelH = height - doorH;
      if (lintelH > 0) {
        this.createBox(doorW, lintelH, wallThickness, this.materials.wall, new THREE.Vector3(0, doorH + lintelH / 2, 0), group);
      }

      this.rootGroup.add(group);

      // Colliders for the 2 side segments
      const cos = Math.cos(rotationY);
      const sin = Math.sin(rotationY);
      [- (doorW / 2 + segW / 2), (doorW / 2 + segW / 2)].forEach(offsetX => {
        const cx = wx + cos * offsetX;
        const cz = wz - sin * offsetX;
        const bw = Math.abs(cos * segW) + Math.abs(sin * wallThickness);
        const bd = Math.abs(sin * segW) + Math.abs(cos * wallThickness);
        this.addCollider(cx - bw / 2, 0, cz - bd / 2, cx + bw / 2, height, cz + bd / 2);
      });

      if (doorCallback) {
        doorCallback(new THREE.Vector3(wx, 0, wz));
      }
    }

    // Helper: Open Doorway (no door leaf, allows walk-through connecting adjacent rooms)
    buildOpenDoorway(wx, wz, length, height, rotationY) {
      const doorW = 1.9;
      const doorH = 2.7;
      const wallThickness = 0.4;
      const segW = (length - doorW) / 2;

      const group = new THREE.Group();
      group.position.set(wx, 0, wz);
      group.rotation.y = rotationY;

      this.createBox(segW, height, wallThickness, this.materials.wall, new THREE.Vector3(-(doorW / 2 + segW / 2), height / 2, 0), group);
      this.createBox(segW, height, wallThickness, this.materials.wall, new THREE.Vector3((doorW / 2 + segW / 2), height / 2, 0), group);

      const lintelH = height - doorH;
      if (lintelH > 0) {
        this.createBox(doorW, lintelH, wallThickness, this.materials.wall, new THREE.Vector3(0, doorH + lintelH / 2, 0), group);
      }
      this.rootGroup.add(group);

      const cos = Math.cos(rotationY);
      const sin = Math.sin(rotationY);
      [- (doorW / 2 + segW / 2), (doorW / 2 + segW / 2)].forEach(offsetX => {
        const cx = wx + cos * offsetX;
        const cz = wz - sin * offsetX;
        const bw = Math.abs(cos * segW) + Math.abs(sin * wallThickness);
        const bd = Math.abs(sin * segW) + Math.abs(cos * wallThickness);
        this.addCollider(cx - bw / 2, 0, cz - bd / 2, cx + bw / 2, height, cz + bd / 2);
      });
    }

    // =========================================================================
    // SEAMLESS DIMENSION GENERATION (ZERO GAPS, PERFECT ALIGNMENT)
    // =========================================================================
    generate(seed = Date.now()) {
      this.clear();

      // Seed helper
      let s = seed % 2147483647;
      if (s <= 0) s += 2147483646;
      const rng = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };

      // -------------------------------------------------------------
      // 1. Room 0: Awakening Four-Way Hub
      // Center: (0, 0, 0), Size: 14 x 3.2 x 14. Z range: [+7, -7]
      // -------------------------------------------------------------
      const r0 = { id: 'room_0', center: new THREE.Vector3(0, 0, 0), w: 14, h: 3.2, d: 14, scale: 'normal' };
      this.rooms.set('room_0', r0);

      this.createBox(14, 0.2, 14, this.materials.carpet, new THREE.Vector3(0, -0.1, 0));
      this.createBox(14, 0.2, 14, this.materials.ceiling, new THREE.Vector3(0, 3.3, 0));

      // South wall: Solid wall behind spawn
      this.createSolidWall(0, 7, 14, 3.2, Math.PI);

      // North wall (Z = -7): Shared doorway leading to Room 1 (CORRECT PATH - BRIGHTER!)
      this.buildWallWithDoorway(0, -7, 14, 3.2, 0, (pos) => {
        this.addBlueDoor('door_0_1', pos, 0, 'room_1', true, 'B-101');
      });

      // East wall (X = +7): Doorway to Detour 0E (WRONG PATH - NORMAL)
      this.buildWallWithDoorway(7, 0, 14, 3.2, Math.PI / 2, (pos) => {
        this.addBlueDoor('door_0_0e', pos, Math.PI / 2, 'detour_0e', false, 'B-102');
      });

      // West wall (X = -7): Doorway to Detour 0W (WRONG PATH - NORMAL)
      this.buildWallWithDoorway(-7, 0, 14, 3.2, -Math.PI / 2, (pos) => {
        this.addBlueDoor('door_0_0w', pos, -Math.PI / 2, 'detour_0w', false, 'B-103');
      });

      this.addCeilingLight(new THREE.Vector3(-3, 3.15, -3), 1.0, true);
      this.addCeilingLight(new THREE.Vector3(3, 3.15, 3), 1.0, false);

      // Detour 0E: Center (13, 0, 0), 12x12. X: [+7, +19], Z: [-6, +6]
      this.buildSideDetour('detour_0e', new THREE.Vector3(13, 0, 0), 12, 3.2, 12, 'west', 'room_0');
      // Detour 0W: Center (-13, 0, 0), 12x12. X: [-19, -7], Z: [-6, +6]
      this.buildSideDetour('detour_0w', new THREE.Vector3(-13, 0, 0), 12, 3.2, 12, 'east', 'room_0');

      // -------------------------------------------------------------
      // 2. Room 1: Yellow Corridor T-Junction
      // Starts right at Z = -7!
      // Center: (0, 0, -14), Size: 16 x 3.2 x 14. Z range: [-7, -21]
      // -------------------------------------------------------------
      const r1 = { id: 'room_1', center: new THREE.Vector3(0, 0, -14), w: 16, h: 3.2, d: 14, scale: 'normal' };
      this.rooms.set('room_1', r1);

      this.createBox(16, 0.2, 14, this.materials.carpet, new THREE.Vector3(0, -0.1, -14));
      this.createBox(16, 0.2, 14, this.materials.ceiling, new THREE.Vector3(0, 3.3, -14));

      // South wall (Z = -7): Already built by Room 0! Just add open doorway frame for walk-through
      // West wall (X = -8): Solid wall
      this.createSolidWall(-8, -14, 14, 3.2, -Math.PI / 2);

      // East wall (X = +8): Door to Detour 1E
      this.buildWallWithDoorway(8, -14, 14, 3.2, Math.PI / 2, (pos) => {
        this.addBlueDoor('door_1_1e', pos, Math.PI / 2, 'detour_1e', false, 'B-202');
      });

      // North wall (Z = -21): Door to Room 2 (Claustrophobia Corridor) - BRIGHTER!
      this.buildWallWithDoorway(0, -21, 16, 3.2, 0, (pos) => {
        this.addBlueDoor('door_1_2', pos, 0, 'room_2', true, 'T-01');
      });

      this.addCeilingLight(new THREE.Vector3(0, 3.15, -14), 1.0, false);
      // Detour 1E: Center (14, 0, -14), 12x12
      this.buildSideDetour('detour_1e', new THREE.Vector3(14, 0, -14), 12, 3.2, 12, 'west', 'room_1');

      // -------------------------------------------------------------
      // 3. Room 2: Claustrophobia Narrow Hall
      // Starts right at Z = -21!
      // Center: (0, 0, -31), Width: 1.8, Height: 2.3, Depth: 20. Z range: [-21, -41]
      // -------------------------------------------------------------
      const r2 = { id: 'room_2', center: new THREE.Vector3(0, 0, -31), w: 1.8, h: 2.3, d: 20, scale: 'tight' };
      this.rooms.set('room_2', r2);

      this.createBox(1.8, 0.2, 20, this.materials.carpet, new THREE.Vector3(0, -0.1, -31));
      this.createBox(1.8, 0.2, 20, this.materials.ceiling, new THREE.Vector3(0, 2.4, -31));

      // Tight side walls
      this.createSolidWall(-0.9, -31, 20, 2.3, -Math.PI / 2);
      this.createSolidWall(0.9, -31, 20, 2.3, Math.PI / 2);

      // North wall (Z = -41): Door to Room 3 - BRIGHTER!
      this.buildWallWithDoorway(0, -41, 1.8, 2.3, 0, (pos) => {
        this.addBlueDoor('door_2_3', pos, 0, 'room_3', true, 'T-02');
      });

      // Low buzzing flickering lights
      this.addCeilingLight(new THREE.Vector3(0, 2.25, -26), 0.7, true);
      this.addCeilingLight(new THREE.Vector3(0, 2.25, -36), 0.7, true);

      // -------------------------------------------------------------
      // 4. Room 3: Claustrophobic 3-Chamber Tight Passage
      // Starts right at Z = -41!
      // 3 small identical sequential chambers:
      // Chamber 1: [-41, -47], Center: (0, 0, -44)
      // Chamber 2: [-47, -53], Center: (0, 0, -50)
      // Chamber 3: [-53, -59], Center: (0, 0, -56)
      // -------------------------------------------------------------
      const r3 = { id: 'room_3', center: new THREE.Vector3(0, 0, -50), w: 6.0, h: 2.4, d: 18, scale: 'tight' };
      this.rooms.set('room_3', r3);

      const chamberSize = 6.0;
      const chHeight = 2.4;
      for (let i = 0; i < 3; i++) {
        const cz = -44 - i * 6.0;
        this.createBox(chamberSize, 0.2, chamberSize, this.materials.carpet, new THREE.Vector3(0, -0.1, cz));
        this.createBox(chamberSize, 0.2, chamberSize, this.materials.ceiling, new THREE.Vector3(0, chHeight + 0.1, cz));

        this.createSolidWall(-chamberSize / 2, cz, chamberSize, chHeight, -Math.PI / 2);
        this.createSolidWall(chamberSize / 2, cz, chamberSize, chHeight, Math.PI / 2);

        // North partition wall & door
        const pz = cz - chamberSize / 2;
        const targetNext = (i === 2) ? 'room_4' : `room_3_sub${i + 1}`;
        this.buildWallWithDoorway(0, pz, chamberSize, chHeight, 0, (pos) => {
          this.addBlueDoor(`door_3_step${i}`, pos, 0, targetNext, true, `P-0${i + 1}`);
        });

        this.addCeilingLight(new THREE.Vector3(0, chHeight - 0.05, cz), 0.8, i === 1);
      }

      // -------------------------------------------------------------
      // 5. Room 4: Four-Way Hub with Impossible Architecture
      // Starts right at Z = -59!
      // Center: (0, 0, -68), Size: 18 x 4.0 x 18. Z range: [-59, -77]
      // -------------------------------------------------------------
      const r4 = { id: 'room_4', center: new THREE.Vector3(0, 0, -68), w: 18, h: 4.0, d: 18, scale: 'normal' };
      this.rooms.set('room_4', r4);

      this.createBox(18, 0.2, 18, this.materials.carpet, new THREE.Vector3(0, -0.1, -68));
      this.createBox(18, 0.2, 18, this.materials.ceiling, new THREE.Vector3(0, 4.1, -68));

      // East wall (X = +9): Door to Detour 4E
      this.buildWallWithDoorway(9, -68, 18, 4.0, Math.PI / 2, (pos) => {
        this.addBlueDoor('door_4_4e', pos, Math.PI / 2, 'detour_4e', false, 'B-401');
      });

      // West wall (X = -9): Door to Detour 4W
      this.buildWallWithDoorway(-9, -68, 18, 4.0, -Math.PI / 2, (pos) => {
        this.addBlueDoor('door_4_4w', pos, -Math.PI / 2, 'detour_4w', false, 'B-402');
      });

      // North wall (Z = -77): Door to Room 5 (Megalophobia Hall) - BRIGHTER!
      this.buildWallWithDoorway(0, -77, 18, 4.0, 0, (pos) => {
        this.addBlueDoor('door_4_5', pos, 0, 'room_5', true, 'B-500');
      });

      // IMPOSSIBLE ARCHITECTURE 1: Staircase ascending into the ceiling
      for (let stepIdx = 0; stepIdx < 12; stepIdx++) {
        const stepPos = new THREE.Vector3(-4, stepIdx * 0.25 + 0.125, -63 - stepIdx * 0.45);
        this.createBox(2.2, 0.25, 0.5, this.materials.concrete, stepPos);
        this.addCollider(-5.1, 0, stepPos.z - 0.25, -2.9, stepIdx * 0.25 + 0.25, stepPos.z + 0.25);
      }

      // IMPOSSIBLE ARCHITECTURE 2: Inaccessibly high door on East wall (2.8m above floor)
      const highDoorPos = new THREE.Vector3(8.9, 2.8, -63);
      this.createBox(1.6, 2.5, 0.1, this.materials.wall, highDoorPos);
      const highLight = new THREE.PointLight(0x7fb9ff, 0.9, 6);
      highLight.position.set(8.2, 4.0, -63);
      this.rootGroup.add(highLight);

      this.addCeilingLight(new THREE.Vector3(0, 3.95, -68), 1.2, true);

      // Detours
      this.buildSideDetour('detour_4e', new THREE.Vector3(15, 0, -68), 12, 3.5, 12, 'west', 'room_4');
      this.buildSideDetour('detour_4w', new THREE.Vector3(-15, 0, -68), 12, 3.5, 12, 'east', 'room_4');

      // -------------------------------------------------------------
      // 6. Room 5: Megalophobia Colossal Pillar Hall
      // Starts right at Z = -77!
      // Colossal space! Width: 44, Height: 18.0, Depth: 44. Z range: [-77, -121]
      // Center: (0, 0, -99)
      // -------------------------------------------------------------
      const r5 = { id: 'room_5', center: new THREE.Vector3(0, 0, -99), w: 44, h: 18.0, d: 44, scale: 'enormous' };
      this.rooms.set('room_5', r5);

      this.createBox(44, 0.4, 44, this.materials.carpet, new THREE.Vector3(0, -0.2, -99));
      this.createBox(44, 0.4, 44, this.materials.ceiling, new THREE.Vector3(0, 18.2, -99));

      // Colossal East & West outer walls
      this.createSolidWall(22, -99, 44, 18.0, Math.PI / 2);
      this.createSolidWall(-22, -99, 44, 18.0, -Math.PI / 2);

      // North wall (Z = -121): Tiny blue door in the colossal expanse - BRIGHTER!
      this.buildWallWithDoorway(0, -121, 44, 18.0, 0, (pos) => {
        this.addBlueDoor('door_5_6', pos, 0, 'room_6', true, 'VOID-01');
      });

      // Massive Columns (2.6m thick, 18m tall)
      const pillars = [
        new THREE.Vector3(-12, 9, -87),
        new THREE.Vector3(12, 9, -87),
        new THREE.Vector3(-12, 9, -99),
        new THREE.Vector3(12, 9, -99),
        new THREE.Vector3(-12, 9, -111),
        new THREE.Vector3(12, 9, -111)
      ];

      pillars.forEach(p => {
        this.createBox(2.6, 18, 2.6, this.materials.concrete, p);
        this.addCollider(p.x - 1.3, 0, p.z - 1.3, p.x + 1.3, 18, p.z + 1.3);
      });

      // High distant lighting casting long eerie shadows
      this.addCeilingLight(new THREE.Vector3(0, 17.8, -99), 1.8, true);
      this.addCeilingLight(new THREE.Vector3(-14, 17.8, -111), 1.4, false);
      this.addCeilingLight(new THREE.Vector3(14, 17.8, -111), 1.4, false);

      // -------------------------------------------------------------
      // 7. Room 6: Tight Disorienting Maze Hub
      // Starts right at Z = -121!
      // Center: (0, 0, -130), Size: 18 x 2.6 x 18. Z range: [-121, -139]
      // -------------------------------------------------------------
      const r6 = { id: 'room_6', center: new THREE.Vector3(0, 0, -130), w: 18, h: 2.6, d: 18, scale: 'tight' };
      this.rooms.set('room_6', r6);

      this.createBox(18, 0.2, 18, this.materials.carpet, new THREE.Vector3(0, -0.1, -130));
      this.createBox(18, 0.2, 18, this.materials.ceiling, new THREE.Vector3(0, 2.7, -130));

      // East & West walls with doors
      this.buildWallWithDoorway(9, -130, 18, 2.6, Math.PI / 2, (pos) => {
        this.addBlueDoor('door_6_6e', pos, Math.PI / 2, 'detour_6e', false, 'M-03');
      });
      this.buildWallWithDoorway(-9, -130, 18, 2.6, -Math.PI / 2, (pos) => {
        this.addBlueDoor('door_6_6w', pos, -Math.PI / 2, 'detour_6w', false, 'M-04');
      });

      // North wall (Z = -139): Door to Room 7 (Grand Bridge) - BRIGHTER!
      this.buildWallWithDoorway(0, -139, 18, 2.6, 0, (pos) => {
        this.addBlueDoor('door_6_7', pos, 0, 'room_7', true, 'M-02');
      });

      // Internal maze barrier walls to disorient player
      this.createSolidWall(-3, -127, 7, 2.6, 0);
      this.createSolidWall(3, -133, 7, 2.6, 0);
      this.createSolidWall(0, -130, 6, 2.6, Math.PI / 2);

      this.addCeilingLight(new THREE.Vector3(-4, 2.55, -126), 0.9, true);
      this.addCeilingLight(new THREE.Vector3(4, 2.55, -134), 0.9, false);

      this.buildSideDetour('detour_6e', new THREE.Vector3(15, 0, -130), 12, 2.6, 12, 'west', 'room_6');
      this.buildSideDetour('detour_6w', new THREE.Vector3(-15, 0, -130), 12, 2.6, 12, 'east', 'room_6');

      // -------------------------------------------------------------
      // 8. Room 7: Megalophobia Grand Bridge Hall
      // Starts right at Z = -139!
      // Width: 46, Height: 22.0, Depth: 46. Z range: [-139, -185]
      // Center: (0, 0, -162)
      // -------------------------------------------------------------
      const r7 = { id: 'room_7', center: new THREE.Vector3(0, 0, -162), w: 46, h: 22.0, d: 46, scale: 'enormous' };
      this.rooms.set('room_7', r7);

      this.createSolidWall(23, -162, 46, 22.0, Math.PI / 2);
      this.createSolidWall(-23, -162, 46, 22.0, -Math.PI / 2);
      this.createBox(46, 0.4, 46, this.materials.ceiling, new THREE.Vector3(0, 22.2, -162));

      // Deep Lower Void (10m below)
      this.createBox(46, 0.4, 46, this.materials.concrete, new THREE.Vector3(0, -10.0, -162));

      // Central Bridge Walkway (4.6m wide, spanning Z = -139 to -185)
      this.createBox(4.6, 0.5, 46, this.materials.carpet, new THREE.Vector3(0, -0.25, -162));

      // Bridge Railings
      this.createBox(0.2, 1.1, 46, this.materials.darkMetal, new THREE.Vector3(-2.2, 0.55, -162));
      this.createBox(0.2, 1.1, 46, this.materials.darkMetal, new THREE.Vector3(2.2, 0.55, -162));
      this.addCollider(-2.3, 0, -185, -2.1, 1.2, -139);
      this.addCollider(2.1, 0, -185, 2.3, 1.2, -139);

      // North wall (Z = -185): Door to Room 8 (Final Crossroads) - BRIGHTER!
      this.buildWallWithDoorway(0, -185, 46, 22.0, 0, (pos) => {
        this.addBlueDoor('door_7_8', pos, 0, 'room_8', true, 'GATE-VII');
      });

      this.addCeilingLight(new THREE.Vector3(0, 21.5, -162), 2.0, false);

      // -------------------------------------------------------------
      // 9. Room 8: Final Crossroads of Gates
      // Starts right at Z = -185!
      // Center: (0, 0, -195), Size: 20 x 4.5 x 20. Z range: [-185, -205]
      // -------------------------------------------------------------
      const r8 = { id: 'room_8', center: new THREE.Vector3(0, 0, -195), w: 20, h: 4.5, d: 20, scale: 'normal' };
      this.rooms.set('room_8', r8);

      this.createBox(20, 0.2, 20, this.materials.carpet, new THREE.Vector3(0, -0.1, -195));
      this.createBox(20, 0.2, 20, this.materials.ceiling, new THREE.Vector3(0, 4.6, -195));

      // East & West Doors
      this.buildWallWithDoorway(10, -195, 20, 4.5, Math.PI / 2, (pos) => {
        this.addBlueDoor('door_8_8e', pos, Math.PI / 2, 'detour_8e', false, 'GATE-0');
      });
      this.buildWallWithDoorway(-10, -195, 20, 4.5, -Math.PI / 2, (pos) => {
        this.addBlueDoor('door_8_8w', pos, -Math.PI / 2, 'detour_8w', false, 'GATE-X');
      });

      // North Door (Z = -205): THE SANCTUM GATE!
      // Warmer golden-amber illumination, leading to the Golden Pot!
      this.buildWallWithDoorway(0, -205, 20, 4.5, 0, (pos) => {
        this.addBlueDoor('door_8_9', pos, 0, 'room_9', true, 'SANCTUM');
      });

      this.addCeilingLight(new THREE.Vector3(0, 4.45, -195), 1.2, true);

      this.buildSideDetour('detour_8e', new THREE.Vector3(16, 0, -195), 12, 4.0, 12, 'west', 'room_8');
      this.buildSideDetour('detour_8w', new THREE.Vector3(-16, 0, -195), 12, 4.0, 12, 'east', 'room_8');

      // -------------------------------------------------------------
      // 10. Room 9: THE GOLDEN POT SANCTUM (FINAL OBJECTIVE)
      // Starts right at Z = -205!
      // Center: (0, 0, -222), Size: 34 x 14.0 x 34. Z range: [-205, -239]
      // -------------------------------------------------------------
      const r9 = { id: 'room_9', center: new THREE.Vector3(0, 0, -222), w: 34, h: 14.0, d: 34, scale: 'enormous' };
      this.rooms.set('room_9', r9);

      this.createBox(34, 0.4, 34, this.materials.carpet, new THREE.Vector3(0, -0.2, -222));
      this.createBox(34, 0.4, 34, this.materials.ceiling, new THREE.Vector3(0, 14.2, -222));

      // Perimeter walls
      this.createSolidWall(17, -222, 34, 14.0, Math.PI / 2);
      this.createSolidWall(-17, -222, 34, 14.0, -Math.PI / 2);
      this.createSolidWall(0, -239, 34, 14.0, 0);

      // In Center (0, 0, -222): Ancient Stone Pedestal
      const pedestalGroup = new THREE.Group();
      pedestalGroup.position.set(0, 0, -222);

      this.createBox(2.2, 0.25, 2.2, this.materials.concrete, new THREE.Vector3(0, 0.125, 0), pedestalGroup);
      this.createBox(1.6, 0.85, 1.6, this.materials.concrete, new THREE.Vector3(0, 0.65, 0), pedestalGroup);
      this.createBox(1.8, 0.15, 1.8, this.materials.concrete, new THREE.Vector3(0, 1.15, 0), pedestalGroup);
      this.addCollider(-1.1, 0, -223.1, 1.1, 1.3, -220.9);

      // THE GOLDEN POT (3D Ornate Golden Urn)
      const potGroup = new THREE.Group();
      potGroup.position.set(0, 1.25, 0);

      const potBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.15, 16), this.materials.gold);
      potBase.position.y = 0.08;
      potGroup.add(potBase);

      const potBelly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), this.materials.gold);
      potBelly.position.y = 0.42;
      potBelly.scale.set(1.0, 1.15, 1.0);
      potGroup.add(potBelly);

      const potNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.25, 16), this.materials.gold);
      potNeck.position.y = 0.8;
      potGroup.add(potNeck);

      const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 20), this.materials.gold);
      potRim.position.y = 0.92;
      potRim.rotation.x = Math.PI / 2;
      potGroup.add(potRim);

      // Ornate Handles
      for (let side of [-1, 1]) {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI), this.materials.gold);
        handle.position.set(side * 0.38, 0.52, 0);
        handle.rotation.z = side * Math.PI / 2;
        potGroup.add(handle);
      }

      pedestalGroup.add(potGroup);
      this.rootGroup.add(pedestalGroup);
      this.goldenPot = potGroup;

      // Radiant Golden Illumination
      const goldLight = new THREE.PointLight(0xffdf6d, 2.8, 20, 1.2);
      goldLight.position.set(0, 2.2, -222);
      this.rootGroup.add(goldLight);

      const potSpot = new THREE.SpotLight(0xffea88, 3.5, 18, Math.PI / 4, 0.3, 1.2);
      potSpot.position.set(0, 9.0, -222);
      potSpot.target = potGroup;
      this.rootGroup.add(potSpot);
      this.rootGroup.add(potSpot.target);

      // Ethereal Floating Particles
      const particleCount = 80;
      const partGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 3.5;
        posArray[i + 1] = 1.2 + Math.random() * 3.2;
        posArray[i + 2] = -222 + (Math.random() - 0.5) * 3.5;
      }
      partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const partMat = new THREE.PointsMaterial({
        color: 0xffe873,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      this.goldenPotParticles = new THREE.Points(partGeo, partMat);
      this.rootGroup.add(this.goldenPotParticles);

      this.currentRoom = r0;
      return {
        spawnPos: new THREE.Vector3(0, 0, 3)
      };
    }

    // Helper: Side Detour Room (returns player back to main path)
    buildSideDetour(id, center, w, h, d, returnDoorDir, returnTargetRoomId) {
      const room = { id, center, w, h, d, scale: 'normal' };
      const hw = w / 2;
      const hd = d / 2;

      this.createBox(w, 0.2, d, this.materials.carpet, new THREE.Vector3(center.x, -0.1, center.z));
      this.createBox(w, 0.2, d, this.materials.ceiling, new THREE.Vector3(center.x, h + 0.1, center.z));

      // Perimeter walls with return door
      if (returnDoorDir === 'west') {
        this.buildWallWithDoorway(center.x - hw, center.z, d, h, -Math.PI / 2, (pos) => {
          this.addBlueDoor(`${id}_return`, pos, -Math.PI / 2, returnTargetRoomId, true, 'RETURN');
        });
        this.createSolidWall(center.x + hw, center.z, d, h, Math.PI / 2);
        this.createSolidWall(center.x, center.z - hd, w, h, 0);
        this.createSolidWall(center.x, center.z + hd, w, h, Math.PI);
      } else {
        this.buildWallWithDoorway(center.x + hw, center.z, d, h, Math.PI / 2, (pos) => {
          this.addBlueDoor(`${id}_return`, pos, Math.PI / 2, returnTargetRoomId, true, 'RETURN');
        });
        this.createSolidWall(center.x - hw, center.z, d, h, -Math.PI / 2);
        this.createSolidWall(center.x, center.z - hd, w, h, 0);
        this.createSolidWall(center.x, center.z + hd, w, h, Math.PI);
      }

      this.addCeilingLight(new THREE.Vector3(center.x, h - 0.05, center.z), 0.9, true);
      this.rooms.set(id, room);
      return room;
    }

    // Collision Check: Returns true if player sphere/cylinder intersects any solid box
    checkCollision(pos, radius = 0.42) {
      const minX = pos.x - radius;
      const maxX = pos.x + radius;
      const minZ = pos.z - radius;
      const maxZ = pos.z + radius;
      const playerBox = new THREE.Box3(
        new THREE.Vector3(minX, 0.1, minZ),
        new THREE.Vector3(maxX, 2.2, maxZ)
      );

      for (let i = 0; i < this.colliders.length; i++) {
        if (playerBox.intersectsBox(this.colliders[i])) {
          return true;
        }
      }

      for (let i = 0; i < this.doors.length; i++) {
        const d = this.doors[i];
        if (!d.isOpen && playerBox.intersectsBox(d.colliderBox)) {
          return true;
        }
      }

      return false;
    }

    // Nearby interactable query
    getNearbyInteractable(playerPos, lookDir, maxDist = 3.2) {
      // 1. Doors
      for (let i = 0; i < this.doors.length; i++) {
        const door = this.doors[i];
        if (door.isOpen) continue;

        const toDoor = door.position.clone().sub(playerPos);
        toDoor.y = 0;
        const dist = toDoor.length();

        if (dist <= maxDist) {
          toDoor.normalize();
          const dot = lookDir.dot(toDoor);
          if (dot > 0.4) {
            return {
              type: 'door',
              object: door,
              prompt: `[E] Open Door (${door.label})`
            };
          }
        }
      }

      // 2. Golden Pot
      if (this.goldenPot) {
        const potWorldPos = new THREE.Vector3();
        this.goldenPot.getWorldPosition(potWorldPos);
        const toPot = potWorldPos.clone().sub(playerPos);
        toPot.y = 0;
        const dist = toPot.length();

        if (dist <= 3.8) {
          return {
            type: 'golden_pot',
            object: this.goldenPot,
            prompt: `[E] Approach The Golden Pot`
          };
        }
      }

      return null;
    }

    // Room acoustics query
    updatePlayerRoomAcoustics(playerPos) {
      let matchedRoom = null;
      for (let [id, room] of this.rooms) {
        const hw = (room.w || 10) / 2 + 0.5;
        const hd = (room.d || 10) / 2 + 0.5;
        if (
          Math.abs(playerPos.x - room.center.x) <= hw &&
          Math.abs(playerPos.z - room.center.z) <= hd
        ) {
          matchedRoom = room;
          break;
        }
      }

      if (matchedRoom && matchedRoom !== this.currentRoom) {
        this.currentRoom = matchedRoom;
        if (window.AudioEngine) {
          window.AudioEngine.setAcousticSpace(matchedRoom.scale || 'normal');
        }
      }
    }

    // Animation updates
    update(deltaTime) {
      const dt = Math.min(deltaTime, 0.1);
      const time = performance.now() * 0.001;

      // Lights flicker
      this.flickeringLights.forEach(item => {
        item.timer += dt;
        if (item.timer > 3.0) {
          const rand = Math.random();
          if (rand < 0.25) {
            item.light.intensity = item.baseIntensity * (0.2 + Math.random() * 0.3);
            if (window.AudioEngine && Math.random() < 0.15) {
              window.AudioEngine.playLightFlicker();
            }
          } else {
            item.light.intensity = item.baseIntensity;
          }
          if (item.timer > 4.5) item.timer = Math.random();
        }
      });

      // Golden Pot rotation & levitation
      if (this.goldenPot) {
        this.goldenPot.rotation.y = time * 0.5;
        this.goldenPot.position.y = 1.25 + Math.sin(time * 1.8) * 0.05;
      }

      // Golden Particles drift
      if (this.goldenPotParticles) {
        const positions = this.goldenPotParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += dt * 0.35;
          if (positions[i] > 4.2) {
            positions[i] = 1.2;
          }
        }
        this.goldenPotParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  return {
    Maze
  };
})();
