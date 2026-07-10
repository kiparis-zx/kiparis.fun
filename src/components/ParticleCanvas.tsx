import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Skip canvas animation on touch devices and when user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const mouse = { x: -1000, y: -1000 };

    // Get colors from CSS vars
    const getColors = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        accent: styles.getPropertyValue('--accent').trim() || '#7c5cff',
        accent2: styles.getPropertyValue('--accent-2').trim() || '#22d3ee',
      };
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseX: number;
      baseY: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          this.x -= (dx / distance) * force * 5;
          this.y -= (dy / distance) * force * 5;
        } else {
          // Slowly return to base, but they also drift so we update base occasionally
          this.baseX += this.vx * 0.1;
          this.baseY += this.vy * 0.1;
          this.x += (this.baseX - this.x) * 0.01;
          this.y += (this.baseY - this.y) * 0.01;
        }
      }

      draw(ctx: CanvasRenderingContext2D, colors: { accent: string, accent2: string }) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      const numParticles = Math.min(Math.floor((width * height) / 15000), 90);
      for (let i = 0; i < numParticles; i++) {
        particles.push(
          new Particle(Math.random() * width, Math.random() * height)
        );
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      particles.forEach((p) => {
        p.update();
        p.draw(ctx, colors);
      });

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = colors.accent;
            ctx.globalAlpha = 1 - dist / 150;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40 z-0"
    />
  );
}