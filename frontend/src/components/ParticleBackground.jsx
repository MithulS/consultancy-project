// Optimized Interactive Particle Background
import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ 
  particleCount = 40,
  particleColor = 'rgba(59, 130, 246, 0.6)',
  lineColor = 'rgba(59, 130, 246, 0.15)',
  particleSize = 2,
  speed = 0.5,
  connectionDistance = 120,
  enableWaveEffect = false,
  enableParallax = false,
  enableMouseRepel = true
}) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameRef = useRef(null);
  const mousePos = useRef({ x: null, y: null });
  const scrollY = useRef(0);
  const time = useRef(0);
  const isVisible = useRef(true);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Reduce count on mobile for better performance
    const effectiveCount = width < 768 ? Math.min(particleCount, 20) : particleCount;

    // Precompute colors to avoid string creation in draw loop
    const particleColors = [];
    for (let i = 0; i < 30; i++) {
      const hue = 210 + i;
      particleColors.push({
        fill: `hsla(${hue}, 80%, 60%, 0.7)`,
        core: 'rgba(255, 255, 255, 0.9)',
      });
    }

    class Particle {
      constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = particleSize;
        this.waveAmplitude = 15 + Math.random() * 20;
        this.waveFrequency = 0.001 + Math.random() * 0.002;
        this.parallaxDepth = 0.2 + Math.random() * 0.8;
        this.hueIdx = Math.floor(Math.random() * 30);
      }

      update() {
        this.baseX += this.vx;
        this.baseY += this.vy;

        if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
        if (this.baseY < 0 || this.baseY > height) this.vy *= -1;

        this.baseX = Math.max(0, Math.min(width, this.baseX));
        this.baseY = Math.max(0, Math.min(height, this.baseY));

        let waveX = 0, waveY = 0;
        if (enableWaveEffect) {
          waveX = Math.sin(time.current * this.waveFrequency + this.baseY * 0.01) * this.waveAmplitude;
          waveY = Math.cos(time.current * this.waveFrequency + this.baseX * 0.01) * this.waveAmplitude * 0.5;
        }

        let parallaxY = 0;
        if (enableParallax) {
          parallaxY = scrollY.current * this.parallaxDepth * 0.3;
        }

        let mouseForceX = 0, mouseForceY = 0;
        if (enableMouseRepel && mousePos.current.x !== null) {
          const dx = this.baseX - mousePos.current.x;
          const dy = this.baseY - mousePos.current.y;
          const distSq = dx * dx + dy * dy;
          const repelDistSq = 22500; // 150^2
          
          if (distSq < repelDistSq) {
            const distance = Math.sqrt(distSq);
            const force = (1 - distance / 150) * 30;
            mouseForceX = (dx / distance) * force;
            mouseForceY = (dy / distance) * force;
          }
        }

        this.x = this.baseX + waveX + mouseForceX;
        this.y = this.baseY + waveY + mouseForceY + parallaxY;
      }

      draw() {
        const colors = particleColors[this.hueIdx];
        
        // Simple circle - no gradients, no shadows for performance
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.fill();
        
        // Small bright core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = colors.core;
        ctx.fill();
      }
    }

    let resizeTimer;
    const resizeCanvas = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const newCount = width < 768 ? Math.min(particleCount, 20) : effectiveCount;
        particles.current = [];
        for (let i = 0; i < newCount; i++) {
          particles.current.push(new Particle());
        }
      }, 200);
    };
    
    // Set initial size immediately
    canvas.width = width;
    canvas.height = height;
    window.addEventListener('resize', resizeCanvas);

    particles.current = [];
    for (let i = 0; i < effectiveCount; i++) {
      particles.current.push(new Particle());
    }

    // Throttled mouse handler
    let lastMouseTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMouseTime < 32) return; // ~30fps mouse updates
      lastMouseTime = now;
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mousePos.current.x = null;
      mousePos.current.y = null;
    };

    // Throttled scroll handler - pause animation during fast scrolling
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      isScrolling.current = true;
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    // Visibility-based pause
    const handleVisibility = () => {
      isVisible.current = !document.hidden;
    };

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    // Simple connection drawing - no gradients, no shadows
    const drawConnections = () => {
      const ps = particles.current;
      const connDistSq = connectionDistance * connectionDistance;
      
      ctx.lineWidth = 1;
      
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const opacity = (1 - Math.sqrt(distSq) / connectionDistance) * 0.4;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // Mouse connections
      if (mousePos.current.x !== null) {
        const maxDist = connectionDistance * 1.5;
        const maxDistSq = maxDist * maxDist;
        for (let i = 0; i < ps.length; i++) {
          const dx = ps[i].x - mousePos.current.x;
          const dy = ps[i].y - mousePos.current.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.5;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(mousePos.current.x, mousePos.current.y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop: skip frames during scroll, pause when hidden
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Don't render when tab is hidden
      if (!isVisible.current) return;
      
      // During scroll, run at reduced framerate (every 3rd frame)
      time.current++;
      if (isScrolling.current && time.current % 3 !== 0) return;

      ctx.clearRect(0, 0, width, height);
      drawConnections();

      particles.current.forEach(particle => {
        particle.update();
        particle.draw();
      });
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimeout.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, particleColor, lineColor, particleSize, speed, connectionDistance, enableWaveEffect, enableParallax, enableMouseRepel]);

  const styles = {
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'auto',
      zIndex: 2,
      cursor: 'crosshair'
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      style={styles.canvas}
      aria-hidden="true"
      title="Interactive particle background - move your mouse to interact"
    />
  );
}

// Performance-optimized preset configurations
export const ParticlePresets = {
  default: {
    particleCount: 40,
    particleColor: 'rgba(59, 130, 246, 0.6)',
    lineColor: 'rgba(59, 130, 246, 0.15)',
    particleSize: 2,
    speed: 0.5,
    connectionDistance: 120,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: true
  },
  energetic: {
    particleCount: 60,
    particleColor: 'rgba(16, 185, 129, 0.7)',
    lineColor: 'rgba(16, 185, 129, 0.2)',
    particleSize: 2.5,
    speed: 0.8,
    connectionDistance: 130,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: true
  },
  subtle: {
    particleCount: 30,
    particleColor: 'rgba(255, 255, 255, 0.3)',
    lineColor: 'rgba(255, 255, 255, 0.1)',
    particleSize: 1.5,
    speed: 0.3,
    connectionDistance: 100,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: false
  },
  calm: {
    particleCount: 35,
    particleColor: 'rgba(139, 92, 246, 0.5)',
    lineColor: 'rgba(139, 92, 246, 0.12)',
    particleSize: 2,
    speed: 0.4,
    connectionDistance: 110,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: true
  },
  intense: {
    particleCount: 70,
    particleColor: 'rgba(239, 68, 68, 0.6)',
    lineColor: 'rgba(239, 68, 68, 0.18)',
    particleSize: 3,
    speed: 1.0,
    connectionDistance: 140,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: true
  },
  minimal: {
    particleCount: 25,
    particleColor: 'rgba(156, 163, 175, 0.4)',
    lineColor: 'rgba(156, 163, 175, 0.08)',
    particleSize: 2,
    speed: 0.4,
    connectionDistance: 100,
    enableWaveEffect: false,
    enableParallax: false,
    enableMouseRepel: false
  }
};
