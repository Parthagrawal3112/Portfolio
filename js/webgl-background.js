/**
 * Living Generative Background Engine
 * Creates a real-time undulating topographic wireframe and dynamic light particle field
 * reacting to mouse position, velocity, and scroll speed.
 */

class GenerativeBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'generative-bg-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    this.canvas.style.opacity = '0.75';
    document.body.prepend(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.time = 0;

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };
    this.particles = [];
    this.contourLines = 14;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

    // Create subtle ambient floating energy particles
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.5 ? '#C2410C' : '#B45309'
      });
    }

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  noise(x, y, t) {
    return Math.sin(x * 0.003 + t) * Math.cos(y * 0.003 + t) + Math.sin(x * 0.006 - t * 0.5) * 0.5;
  }

  animate() {
    this.time += 0.008;

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Generative Kinetic Topographic Waves
    const stepX = 25;
    const lineSpacing = this.height / (this.contourLines + 1);

    for (let i = 1; i <= this.contourLines; i++) {
      const baseY = i * lineSpacing;
      this.ctx.beginPath();

      for (let x = 0; x <= this.width + stepX; x += stepX) {
        // Distance to mouse for interactive magnetic wave bulge
        const dx = x - this.mouse.x;
        const dy = baseY - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, (260 - dist) / 260) * 45;

        // Wave elevation formula
        const n = this.noise(x, baseY, this.time);
        const y = baseY + n * 28 - mouseInfluence * Math.sin(this.time * 2 + x * 0.01);

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      // Elegant gradient stroke for warm luxury feel
      const alpha = 0.06 + (i / this.contourLines) * 0.09;
      if (i % 3 === 0) {
        this.ctx.strokeStyle = `rgba(194, 65, 12, ${alpha * 1.5})`; // Warm Terracotta wireframe
        this.ctx.lineWidth = 1.2;
      } else if (i % 3 === 1) {
        this.ctx.strokeStyle = `rgba(180, 83, 9, ${alpha * 1.3})`; // Ochre Gold wireframe
        this.ctx.lineWidth = 1;
      } else {
        this.ctx.strokeStyle = `rgba(24, 21, 18, ${alpha * 0.9})`; // Deep Espresso wireframe
        this.ctx.lineWidth = 0.8;
      }

      this.ctx.stroke();
    }

    // Draw Floating Light Particles
    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.hue;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GenerativeBackground();
});
