/**
 * Three.js WebGL Generative Background Engine
 * Creates a real-time undulating 3D parametric terrain mesh with interactive mouse distortion,
 * dynamic vertex shading, floating ambient embers, and light-beige warm champagne aesthetics.
 */

class WebGLTerrainBackground {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'webgl-canvas-container';
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.zIndex = '0';
    this.container.style.pointerEvents = 'none';
    this.container.style.opacity = '0.85';
    document.body.prepend(this.container);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mesh = null;
    this.particles = null;
    this.clock = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet, fallback to canvas.');
      return;
    }

    // 1. Scene & Clock
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 45, 75);
    this.camera.lookAt(0, 0, -10);

    // 3. Renderer with Antialiasing and Alpha
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xea580c, 1.5);
    dirLight.position.set(50, 80, 50);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xb45309, 2, 120);
    pointLight.position.set(-30, 20, 20);
    this.scene.add(pointLight);

    // 5. 3D Generative Parametric Wireframe Mesh
    const planeGeo = new THREE.PlaneGeometry(160, 140, 70, 70);
    planeGeo.rotateX(-Math.PI / 2.3);

    // Custom material with wireframe & vertex displacement look
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      roughness: 0.3,
      metalness: 0.4
    });

    this.mesh = new THREE.Mesh(planeGeo, planeMat);
    this.mesh.position.set(0, -15, -20);
    this.scene.add(this.mesh);

    // Store original geometry positions for wave calculations
    this.posAttribute = planeGeo.attributes.position;
    this.origPositions = new Float32Array(this.posAttribute.array);

    // 6. Floating Luminescent Embers (Particle System)
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0xc2410c);
    const colorB = new THREE.Color(0xb45309);
    const colorC = new THREE.Color(0x047857);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 160;
      pPositions[i * 3 + 1] = Math.random() * 60 - 10;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 140 - 20;

      const chosenColor = i % 3 === 0 ? colorA : (i % 3 === 1 ? colorB : colorC);
      pColors[i * 3] = chosenColor.r;
      pColors[i * 3 + 1] = chosenColor.g;
      pColors[i * 3 + 2] = chosenColor.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.particles);

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    this.animate();
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth camera / mouse sway
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 12;
    this.camera.position.y = 45 + this.mouse.y * 6;
    this.camera.lookAt(0, 0, -10);

    // Wave Displacement on Mesh Vertices
    if (this.posAttribute) {
      const positions = this.posAttribute.array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const ox = this.origPositions[i * 3];
        const oy = this.origPositions[i * 3 + 1];
        const oz = this.origPositions[i * 3 + 2];

        // Complex organic multi-frequency waves
        const wave = Math.sin(ox * 0.08 + elapsedTime * 1.4) * Math.cos(oz * 0.08 + elapsedTime * 1.2) * 5.5
                   + Math.sin(ox * 0.15 - elapsedTime * 0.8) * 2.2;

        // Interactive mouse crater repulsion
        const dx = ox - this.mouse.x * 50;
        const dz = oz - this.mouse.y * 50;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const mouseLift = Math.max(0, (40 - dist) / 40) * 8.0;

        positions[i * 3 + 1] = oy + wave + mouseLift;
      }

      this.posAttribute.needsUpdate = true;
    }

    // Slowly rotate particle field
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.03;
      this.particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-initialize when DOM and Three.js are ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    new WebGLTerrainBackground();
  } else {
    // Retry shortly if CDN is slightly delayed
    setTimeout(() => {
      if (typeof THREE !== 'undefined') new WebGLTerrainBackground();
    }, 200);
  }
});
