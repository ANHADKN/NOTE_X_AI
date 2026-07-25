/* ==========================================
   noteX AI - Premium Animated Educational Background Engine (Light Theme)
   Featuring: Books, Open Book, Notebook, Pencil, Pen, Calculator, Globe, 
              Graduation Cap, Light Bulb, Atom, DNA, Planet, Stars, Microscope,
              Chemistry Flask, Physics Formulas, Math Symbols, AI Neural Nodes,
              Learning Paths & Floating Paper Notes.
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
      canvas.style.opacity = '0.45';
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

    // Educational Items Registry (Types: 'icon', 'text', 'vector')
    const eduItems = [
      { type: 'icon', symbol: '📖', label: 'Open Book' },
      { type: 'icon', symbol: '📚', label: 'Books' },
      { type: 'icon', symbol: '📓', label: 'Notebook' },
      { type: 'icon', symbol: '✏️', label: 'Pencil' },
      { type: 'icon', symbol: '🖋️', label: 'Pen' },
      { type: 'icon', symbol: '🧮', label: 'Calculator' },
      { type: 'icon', symbol: '🌐', label: 'Globe' },
      { type: 'icon', symbol: '🎓', label: 'Graduation Cap' },
      { type: 'icon', symbol: '💡', label: 'Light Bulb' },
      { type: 'icon', symbol: '⚛️', label: 'Atom' },
      { type: 'icon', symbol: '🧬', label: 'DNA' },
      { type: 'icon', symbol: '🪐', label: 'Planet' },
      { type: 'icon', symbol: '✨', label: 'Stars' },
      { type: 'icon', symbol: '🔬', label: 'Microscope' },
      { type: 'icon', symbol: '🧪', label: 'Flask' },
      { type: 'icon', symbol: '📝', label: 'Paper Note' },
      { type: 'icon', symbol: '🤖', label: 'AI Node' },
      { type: 'text', symbol: '∫ f(x)dx', font: 'JetBrains Mono' },
      { type: 'text', symbol: 'E = mc²', font: 'JetBrains Mono' },
      { type: 'text', symbol: '∇ × B = μ₀J', font: 'JetBrains Mono' },
      { type: 'text', symbol: 'd/dx (e^x)', font: 'JetBrains Mono' },
      { type: 'text', symbol: '∑ (x - μ)²', font: 'JetBrains Mono' },
      { type: 'text', symbol: 'f(x) = sin(x)', font: 'JetBrains Mono' }
    ];

    // Subtle Pastel Tint Palette for Premium Light Theme
    const pastelColors = [
      'rgba(14, 165, 233, ',   // Sky Blue
      'rgba(16, 185, 129, ',   // Mint Green
      'rgba(139, 92, 246, ',   // Soft Lavender
      'rgba(245, 158, 11, ',   // Soft Sunshine Yellow
      'rgba(255, 107, 107, '   // Coral Accent
    ];

    class EduParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 40;
        // Ultra smooth slow motion float
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = - (Math.random() * 0.25 + 0.12);
        
        const item = eduItems[Math.floor(Math.random() * eduItems.length)];
        this.type = item.type;
        this.symbol = item.symbol;
        this.font = item.font || 'Inter';

        this.baseSize = this.type === 'icon' ? (Math.random() * 8 + 16) : (Math.random() * 3 + 12);
        this.colorPrefix = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        this.maxAlpha = Math.random() * 0.22 + 0.12;
        this.alpha = 0;
        this.fadeIn = true;
        
        this.rotation = (Math.random() - 0.5) * 0.4;
        this.vRot = (Math.random() - 0.5) * 0.003;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.015 + Math.random() * 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vRot;
        this.pulse += this.pulseSpeed;

        // Smooth Opacity Fade In / Fade Out
        if (this.fadeIn) {
          this.alpha += 0.005;
          if (this.alpha >= this.maxAlpha) {
            this.alpha = this.maxAlpha;
            this.fadeIn = false;
          }
        }

        if (this.y < -50 || this.x < -50 || this.x > width + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const currentAlpha = this.alpha + Math.sin(this.pulse) * 0.04;
        const validAlpha = Math.max(0.04, Math.min(0.35, currentAlpha));

        if (this.type === 'icon') {
          ctx.font = `${this.baseSize}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
          ctx.globalAlpha = validAlpha;
          ctx.fillText(this.symbol, 0, 0);
        } else {
          ctx.font = `600 ${this.baseSize}px '${this.font}', monospace`;
          ctx.fillStyle = `${this.colorPrefix}${validAlpha})`;
          ctx.fillText(this.symbol, 0, 0);
        }

        ctx.restore();
      }
    }

    // Generate balanced particle count based on viewport width
    const particles = [];
    const particleCount = Math.min(42, Math.floor(width / 32));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new EduParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      // Connect nearby AI Neural Nodes & Learning Paths with elegant lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = 0.08 * (1 - dist / 150);
            ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.setLineDash([3, 3]); // Elegant dashed learning paths
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Draw floating education particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  });
})();
