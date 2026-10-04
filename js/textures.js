/**
 * Procedural Texture Generator for SHINIGAMI: THE GOLDEN POT
 * Generates authentic Backrooms-style materials, wallpapers, carpets, ceiling tiles,
 * and industrial blue doors entirely via HTML5 Canvas.
 */

window.TextureGenerator = (function() {
  const cache = {};

  // Utility to create a canvas
  function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // Generate Yellow Backrooms Wallpaper
  function createYellowWallTexture() {
    if (cache.yellowWall) return cache.yellowWall;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base pale damp yellow
    ctx.fillStyle = '#cfbe76';
    ctx.fillRect(0, 0, size, size);

    // Subtle wallpaper vertical ribbed pattern
    ctx.fillStyle = 'rgba(165, 145, 75, 0.18)';
    for (let x = 0; x < size; x += 8) {
      ctx.fillRect(x, 0, 3, size);
    }

    // Secondary delicate vertical pinstripes
    ctx.fillStyle = 'rgba(235, 225, 170, 0.12)';
    for (let x = 4; x < size; x += 8) {
      ctx.fillRect(x, 0, 1.5, size);
    }

    // Vintage wallpaper repeating motif (faint fleur-de-lis / diamond damask)
    ctx.fillStyle = 'rgba(140, 120, 60, 0.08)';
    for (let y = 16; y < size; y += 32) {
      for (let x = 16; x < size; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 5, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 5, y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Dirt, moisture stains & grime patches
    const numStains = 16;
    for (let i = 0; i < numStains; i++) {
      const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * size;
      const sy = (Math.cos(i * 321.45) * 0.5 + 0.5) * size;
      const radius = 25 + (i % 7) * 15;
      
      const grad = ctx.createRadialGradient(sx, sy, 5, sx, sy, radius);
      grad.addColorStop(0, 'rgba(110, 95, 45, 0.22)');
      grad.addColorStop(0.6, 'rgba(125, 108, 55, 0.10)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Noise and paper grain
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cache.yellowWall = texture;
    return texture;
  }

  // Slightly cleaner yellow wallpaper for the "correct" door area
  function createCleanYellowWallTexture() {
    if (cache.cleanYellowWall) return cache.cleanYellowWall;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Slightly warmer and cleaner
    ctx.fillStyle = '#ddcc86';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(175, 155, 85, 0.14)';
    for (let x = 0; x < size; x += 8) {
      ctx.fillRect(x, 0, 3, size);
    }
    ctx.fillStyle = 'rgba(250, 240, 190, 0.15)';
    for (let x = 4; x < size; x += 8) {
      ctx.fillRect(x, 0, 1.5, size);
    }

    // Subtle grain, fewer stains
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cache.cleanYellowWall = texture;
    return texture;
  }

  // Damp Stained Beige/Brown Carpet Texture
  function createCarpetTexture() {
    if (cache.carpet) return cache.carpet;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base damp dirty carpet brown-beige
    ctx.fillStyle = '#8a7852';
    ctx.fillRect(0, 0, size, size);

    // Carpet pile fiber loop texture
    ctx.fillStyle = 'rgba(75, 62, 38, 0.28)';
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    // Heavy water stains / damp patches
    for (let i = 0; i < 14; i++) {
      const sx = (Math.sin(i * 91.2) * 0.5 + 0.5) * size;
      const sy = (Math.cos(i * 47.8) * 0.5 + 0.5) * size;
      const r = 30 + (i % 6) * 20;

      const grad = ctx.createRadialGradient(sx, sy, 4, sx, sy, r);
      grad.addColorStop(0, 'rgba(48, 38, 22, 0.45)');
      grad.addColorStop(0.7, 'rgba(65, 52, 32, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // High frequency noise for carpet weave
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cache.carpet = texture;
    return texture;
  }

  // Dropped Acoustic Ceiling Tiles
  function createCeilingTexture() {
    if (cache.ceiling) return cache.ceiling;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base off-white / yellowish aged tile
    ctx.fillStyle = '#d5ceb8';
    ctx.fillRect(0, 0, size, size);

    // Stippled acoustic pinholes
    ctx.fillStyle = 'rgba(70, 65, 55, 0.4)';
    for (let i = 0; i < 1800; i++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const pr = 0.8 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tile grid borders (T-bar suspended grid)
    ctx.strokeStyle = '#605845';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, size, size);
    ctx.strokeStyle = '#9e947d';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, size - 6, size - 6);

    // Slight water leak rings
    const grad = ctx.createRadialGradient(size * 0.7, size * 0.4, 10, size * 0.7, size * 0.4, 70);
    grad.addColorStop(0, 'rgba(140, 115, 60, 0.28)');
    grad.addColorStop(0.8, 'rgba(160, 135, 75, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.4, 70, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cache.ceiling = texture;
    return texture;
  }

  // Fluorescent Light Fixture Diffuser Texture
  function createLightCoverTexture() {
    if (cache.lightCover) return cache.lightCover;

    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    // Glow background
    ctx.fillStyle = '#fffce0';
    ctx.fillRect(0, 0, 256, 256);

    // Prismatic grid diffuser pattern
    ctx.strokeStyle = 'rgba(200, 190, 140, 0.45)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 256; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Outer metal frame
    ctx.strokeStyle = '#403828';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    cache.lightCover = texture;
    return texture;
  }

  // Blue Industrial Metal Door Texture
  function createBlueDoorTexture(label = "B-04", isBrighter = false) {
    const key = `door_${label}_${isBrighter}`;
    if (cache[key]) return cache[key];

    const w = 512;
    const h = 1024;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Base Blue metal coat (industrial cobalt/slate blue)
    // Brighter door is subtly cleaner and slightly more saturated
    const baseColor = isBrighter ? '#1f5385' : '#193f66';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle vertical metal grain/brushing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < w; x += 4) {
      ctx.fillRect(x, 0, 2, h);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 2; x < w; x += 4) {
      ctx.fillRect(x, 0, 2, h);
    }

    // Heavy Industrial Beveled Edge / Outer Door Frame Recess
    ctx.strokeStyle = '#0e2338';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Two recessed metal panels
    const drawPanel = (y1, y2) => {
      ctx.fillStyle = isBrighter ? '#1b4875' : '#143454';
      ctx.fillRect(40, y1, w - 80, y2 - y1);
      
      // Panel bevel highlight & shadow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, y1, w - 80, y2 - y1);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(40, y2);
      ctx.lineTo(w - 40, y2);
      ctx.lineTo(w - 40, y1);
      ctx.stroke();
    };

    // Upper and lower indented panels
    drawPanel(60, 440);
    drawPanel(480, 880);

    // Rivets / Bolts along panels
    ctx.fillStyle = '#6b8299';
    const drawBolts = (y1, y2) => {
      for (let y = y1 + 20; y < y2; y += 70) {
        ctx.beginPath();
        ctx.arc(52, y, 4, 0, Math.PI * 2);
        ctx.arc(w - 52, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawBolts(60, 440);
    drawBolts(480, 880);

    // Steel Kickplate at bottom
    ctx.fillStyle = '#44515c';
    ctx.fillRect(30, 890, w - 60, 110);
    ctx.strokeStyle = '#7c8e9c';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 890, w - 60, 110);

    // Industrial Stencil Sign / Number Plate
    ctx.fillStyle = '#111b24';
    ctx.fillRect(w / 2 - 110, 160, 220, 70);
    ctx.strokeStyle = '#5a738a';
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 110, 160, 220, 70);

    ctx.fillStyle = isBrighter ? '#e3f2fd' : '#b0bec5';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, 195);

    // Small warning or door latch plate
    ctx.fillStyle = '#8d7b38'; // Brass lock plate
    ctx.fillRect(w - 75, 500, 45, 110);
    ctx.strokeStyle = '#4e421c';
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 75, 500, 45, 110);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(w - 53, 535, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w - 55, 535, 4, 16);

    // Subtle scratches and distress
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < (isBrighter ? 8 : 18); i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + Math.random() * 25);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    cache[key] = texture;
    return texture;
  }

  // Mega Concrete Texture for Megalophobia Rooms & Giant Pillars
  function createConcreteTexture() {
    if (cache.concrete) return cache.concrete;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Dingy yellowed concrete
    ctx.fillStyle = '#a69976';
    ctx.fillRect(0, 0, size, size);

    // Horizontal concrete form casting seams
    ctx.strokeStyle = 'rgba(60, 50, 35, 0.4)';
    ctx.lineWidth = 3;
    for (let y = 0; y < size; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Heavy speckling / aggregate
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 45;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.95));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.75));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    cache.concrete = texture;
    return texture;
  }

  // Golden Pot Ornate Texture
  function createGoldTexture() {
    if (cache.gold) return cache.gold;

    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Rich metallic gold gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#ffd700');
    grad.addColorStop(0.3, '#f5c518');
    grad.addColorStop(0.5, '#fff3a8');
    grad.addColorStop(0.7, '#d4af37');
    grad.addColorStop(1, '#aa820a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Ornate sacred etched filigree / supernatural spirals
    ctx.strokeStyle = 'rgba(120, 80, 5, 0.35)';
    ctx.lineWidth = 3;
    for (let y = 30; y < size; y += 64) {
      ctx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const py = y + Math.sin(x * 0.08) * 12;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    // Kanji/sacred symbols of death/immortality
    ctx.fillStyle = 'rgba(90, 60, 0, 0.4)';
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    const kanjis = ['死', '神', '壺', '金', '霊', '命', '界'];
    for (let i = 0; i < kanjis.length; i++) {
      ctx.fillText(kanjis[i], 40 + i * 70, size / 2);
    }

    // Fine brushed metal streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < size; y += 2) {
      ctx.fillRect(0, y, size, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    cache.gold = texture;
    return texture;
  }

  return {
    getYellowWall: createYellowWallTexture,
    getCleanYellowWall: createCleanYellowWallTexture,
    getCarpet: createCarpetTexture,
    getCeiling: createCeilingTexture,
    getLightCover: createLightCoverTexture,
    getBlueDoor: createBlueDoorTexture,
    getConcrete: createConcreteTexture,
    getGold: createGoldTexture
  };
})();
