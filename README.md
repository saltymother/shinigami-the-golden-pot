# SHINIGAMI: THE GOLDEN POT

> **"I was completely lost... but the light was showing me the way."**

A 3D first-person psychological horror exploration game playable directly in desktop browsers. Built with Three.js and Web Audio API, focusing on isolation, claustrophobia, megalophobia, repetition, uncertainty, and environmental observation.

---

## 💀 Overview

- **No weapons, no combat, no shooting, no enemies attacking.**
- The fear comes entirely from: **being alone + getting lost + enormous spaces + tiny spaces + repetition + uncertainty.**
- Inspired by the Japanese concept of a death spirit (*Shinigami*) and the eerie aesthetic of liminal Backrooms spaces.
- The player awakens in an endless dimension with pale yellow walls, dropped ceilings, fluorescent buzzes, and blue industrial gates.
- Sole Objective: **Find the Golden Pot.**

---

## 🚪 The Core Mechanic: The Brighter Door

There are no GPS markers, arrows, radars, minimaps, or compasses. The **light itself is the navigation system**:
- At major intersections and hubs, multiple blue doors present choices.
- One door is **slightly brighter** than the others:
  - Slightly stronger illumination.
  - Warmer, cleaner yellow-white tint.
  - Subtle glow around its frame and underneath its threshold.
  - Slightly cleaner wallpaper around the door frame.
- The clue is subtle: the player must pause, compare doors, and observe.
- Wrong doors lead into side loops or detour rooms where a return door guides the observant player back to the main path.

---

## 🎮 Controls

| Action | Key / Control |
| :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` |
| **Look Around** | `Mouse Movement` (Pointer Lock) |
| **Open Door / Interact** | `E` or `Left Mouse Button` |
| **Toggle 1st / 3rd Person** | `V` (View complete Shinigami model) |
| **Fast Glide / Sprint** | `Shift` |
| **Pause Menu** | `Esc` |

---

## 👤 The Shinigami Character

- **Design**: Tall, slender supernatural Japanese death spirit.
- **Visuals**: Dark flowing kimono robes, deep shadow hood, pale death mask with sunken features, deep subtly glowing eyes, elongated arms with thin spindly fingers.
- **Motion**: Otherworldly levitation and gliding above the damp carpet with fluttering cloth streamers.
- **Camera**:
  - **First-Person View (Default)**: Immersive perspective with subtle floating bob.
  - **Third-Person View (Press `V`)**: Smooth follow camera allowing the player to view the full Shinigami model gliding through corridors and halls.

---

## 🏛️ Environmental Zones & Phobias

1. **Four-Way Crossroads (Hubs)**: Classic yellow wallpaper rooms with North, South, East, and West blue doors.
2. **Claustrophobia Zones**:
   - **Narrow Corridor**: 1.8m wide, 2.3m low ceiling, walls pressing in on either side.
   - **Tight Passage**: Three consecutive 6m x 6m micro-chambers connected by narrow blue doors.
   - **Tight Maze**: Sharp 90-degree corners, partition walls blocking line of sight, repeating yellow patterns.
3. **Megalophobia Zones**:
   - **Colossal Pillar Hall**: 44m x 44m x 18m tall expanse; colossal concrete pillars, distant fog, blue doors looking microscopic across the room.
   - **Grand Bridge Hall**: 46m x 46m x 22m tall cavern; narrow concrete bridge suspended above an echoing black void.
4. **Impossible Architecture**:
   - Staircases climbing directly into solid ceiling darkness.
   - Inaccessible blue doors floating 3 meters high on sheer walls.
5. **The Golden Pot Sanctum**:
   - Deep cathedral-scale amber chamber.
   - Ancient stone pedestal.
   - The ornate Golden Pot with real-time reflections, radiant illumination, and rising ethereal particles.

---

## 🔊 Procedural Web Audio Engine

No external sound files required! All audio is synthesized in real time via Web Audio API:
- **60Hz Fluorescent Ballast Hum** with 120Hz harmonics and subtle random electrical flickers.
- **Adaptive Acoustic Reverb**:
  - In claustrophobic spaces: footsteps and sounds are dry, compressed, and close.
  - In megalophobia halls: long 3.8s decaying reverberation and cavernous wind.
- **Footstep Synthesis**: Soft fabric and carpet scuffs modulated by speed.
- **Industrial Door Squeal & Latch**: Heavy metal hinge squeaks and solid latch clicks.
- **Distant Horror Atmosphere**: Subtle pipe groans, metal clanks, and deep HVAC sub-bass rumble.
- **The Golden Pot Harmonic**: Warm celestial chord and shimmering chime upon victory.

---

## 🚀 How to Run & Play

### Option 1: Direct Launch (Recommended)
Run the included python server:
```bash
cd shinigami_the_golden_pot
./launch.sh
# or: python3 server.py
```
This automatically starts a local server on port 8092 and opens your desktop browser (Chrome / Safari / Default).

### Option 2: Open HTML Directly
Double-click or run:
```bash
open shinigami_the_golden_pot/index.html
```

---

## ⚙️ Performance & Tech Stack
- **Three.js** (bundled locally in `lib/three.min.js` + CDN fallback).
- **Procedural Canvas Textures** (`js/textures.js`) for instant zero-latency loading.
- **Real-time Web Audio API** (`js/audio.js`).
- **AABB Collision & Sliding Physics** (`js/character.js` and `js/maze.js`).
- **Solid 60 FPS** target with frustum culling and exponential distance fog.
