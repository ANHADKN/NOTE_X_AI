/* ==========================================
   noteX AI - Scientific & Mathematical Animated Background Engine
   ========================================== */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('scienceCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'scienceCanvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      canvas.style.opacity = '0.22';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const symbols = [
      '∫ f(x)dx', 'E = mc²', 'Δx · Δp ≥ ℏ/2', 'H₂O', 'C₆H₁₂O₆',
      'f(x) = sin(x)', '∇ × B = μ₀J', 'DNA 🧬', 'λ = h/p', 'πr²',
      'e^(iπ) + 1 = 0', 'Atom ⚛', '∑ (x - μ)²', 'd/dx (e^x)', 'F = ma'
    ];

    class ScienceParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.text = symbols[Math.floor(Math.random() * symbols.length)];
        this.size = Math.random() * 4 + 11;
        this.alpha = Math.random() * 0.35 + 0.15;
        this.rotation = Math.random() * Math.PI * 2;
        this.vRot = (Math.random() - 0.5) * 0.005;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vRot;

        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `500 ${this.size}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(6, 182, 212, ${this.alpha})`;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      }
    }

    const particles = [];
    const particleCount = Math.min(35, Math.floor(width / 35));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new ScienceParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      // Connect nearby particles with subtle neural/constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  });
})();
