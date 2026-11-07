import { useEffect, useRef } from 'react';
import { sound, triggerHaptic } from '../utils/audio';

interface CosmicStarfieldProps {
  onBackgroundTapped?: () => void;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
  shape: 'circle' | 'rect';
  rotation: number;
  vRot: number;
}

// Global emitter for canvas effects
export const cosmicFX = {
  confetti: (count = 100) => {
    window.dispatchEvent(new CustomEvent('cosmic:confetti', { detail: { count } }));
  },
  fireworks: (bursts = 4) => {
    window.dispatchEvent(new CustomEvent('cosmic:fireworks', { detail: { bursts } }));
  },
  shootingStarShower: () => {
    window.dispatchEvent(new CustomEvent('cosmic:starshower'));
  },
};

export default function CosmicStarfield({ onBackgroundTapped }: CosmicStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Stars
    let stars: Star[] = [];
    const colors = ['#ffffff', '#e0f2fe', '#38bdf8', '#22d3ee', '#fbbf24', '#fef08a'];

    const initStars = () => {
      const starCount = Math.floor((width * height) / 3600); // Responsive count
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = 0.2 + Math.random() * 0.7;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() < 0.85 ? Math.random() * 1.4 + 0.4 : Math.random() * 2.2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: 0.01 + Math.random() * 0.04,
          vx: (Math.random() - 0.5) * 0.08,
          vy: -0.04 - Math.random() * 0.08, // gentle upward drift
        });
      }
    };

    initStars();

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    const addShootingStar = () => {
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * height * 0.4;
      shootingStars.push({
        x: startX,
        y: startY,
        length: 80 + Math.random() * 120,
        speed: 8 + Math.random() * 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
        alpha: 1,
        color: Math.random() > 0.4 ? '#38bdf8' : '#fbbf24',
      });
    };

    // Periodic shooting star
    let nextShootingStar = Date.now() + 4000 + Math.random() * 5000;

    // Confetti and Firework Particles
    let particles: Particle[] = [];

    const createFireworkBurst = (x: number, y: number, color?: string) => {
      const palette = ['#22d3ee', '#38bdf8', '#00f2fe', '#fbbf24', '#f59e0b', '#ffffff', '#e0e7ff'];
      const chosenColor = color || palette[Math.floor(Math.random() * palette.length)];
      const count = 50 + Math.floor(Math.random() * 30);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 7;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.3 ? chosenColor : '#ffffff',
          size: Math.random() * 3 + 2,
          gravity: 0.06,
          drag: 0.98,
          shape: 'circle',
          rotation: 0,
          vRot: 0,
        });
      }
    };

    const createConfettiShower = (count = 100) => {
      const confettiColors = ['#22d3ee', '#38bdf8', '#fbbf24', '#f59e0b', '#ffffff', '#818cf8', '#67e8f9'];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: -20 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 5,
          vy: 3 + Math.random() * 5,
          alpha: 1,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: Math.random() * 7 + 4,
          gravity: 0.08,
          drag: 0.99,
          shape: Math.random() > 0.3 ? 'rect' : 'circle',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    // Event Listeners for cosmic FX
    const onConfettiEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      createConfettiShower(customEvent.detail?.count || 120);
    };

    const onFireworksEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ bursts: number }>;
      const bursts = customEvent.detail?.bursts || 4;
      for (let i = 0; i < bursts; i++) {
        setTimeout(() => {
          const rx = width * 0.2 + Math.random() * width * 0.6;
          const ry = height * 0.15 + Math.random() * height * 0.45;
          createFireworkBurst(rx, ry);
        }, i * 220);
      }
    };

    const onStarShowerEvent = () => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          addShootingStar();
        }, i * 180);
      }
    };

    window.addEventListener('cosmic:confetti', onConfettiEvent);
    window.addEventListener('cosmic:fireworks', onFireworksEvent);
    window.addEventListener('cosmic:starshower', onStarShowerEvent);

    // Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Deep Navy gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#050B1F');
      bgGrad.addColorStop(0.5, '#071333');
      bgGrad.addColorStop(1, '#0B1F4D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle cyan/gold cosmic nebulas in corners
      const radGrad1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, width * 0.45);
      radGrad1.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      radGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad1;
      ctx.fillRect(0, 0, width, height);

      const radGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.75, 40, width * 0.2, height * 0.75, width * 0.4);
      radGrad2.addColorStop(0, 'rgba(245, 158, 11, 0.05)');
      radGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad2;
      ctx.fillRect(0, 0, width, height);

      // Render Drifting Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.y < 0) s.y = height;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;

        // Twinkle
        s.alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 0.05) * 0.3;
        s.alpha = Math.max(0.08, Math.min(1, s.alpha));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Extra glow for brighter stars
        if (s.radius > 1.8) {
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Check shooting star trigger
      if (Date.now() > nextShootingStar) {
        addShootingStar();
        nextShootingStar = Date.now() + 6000 + Math.random() * 8000;
      }

      // Render Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const cos = Math.cos(ss.angle);
        const sin = Math.sin(ss.angle);

        ss.x += cos * ss.speed;
        ss.y += sin * ss.speed;
        ss.alpha -= 0.014;

        if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.save();
        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - cos * ss.length,
          ss.y - sin * ss.length
        );
        grad.addColorStop(0, ss.color);
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = ss.alpha;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - cos * ss.length, ss.y - sin * ss.length);
        ctx.stroke();

        // Head bright spot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Particles (Fireworks + Confetti)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= dt * 0.45;
        p.rotation += p.vRot;

        if (p.alpha <= 0 || p.y > height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cosmic:confetti', onConfettiEvent);
      window.removeEventListener('cosmic:fireworks', onFireworksEvent);
      window.removeEventListener('cosmic:starshower', onStarShowerEvent);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={() => {
        onBackgroundTapped?.();
      }}
      className="fixed inset-0 pointer-events-auto z-0 touch-none"
      style={{ touchAction: 'manipulation' }}
    />
  );
}
