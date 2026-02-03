// Enhanced Interactive Particle Background with Wave & Parallax Effects
import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ 
  particleCount = 100,
  particleColor = 'rgba(59, 130, 246, 0.6)',
  lineColor = 'rgba(59, 130, 246, 0.15)',
  particleSize = 2,
  speed = 0.5,
  connectionDistance = 140,
  enableWaveEffect = true,
  enableParallax = true,
  enableMouseRepel = true
}) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameRef = useRef(null);
  const mousePos = useRef({ x: null, y: null, vx: 0, vy: 0 });
  const scrollY = useRef(0);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Enhanced Particle class with wave and parallax effects
    class Particle {
      constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = particleSize;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.waveAmplitude = 20 + Math.random() * 30;
        this.waveFrequency = 0.001 + Math.random() * 0.002;
        this.parallaxDepth = 0.2 + Math.random() * 0.8; // 0.2 to 1.0
        this.hue = Math.random() * 30; // Slight color variation
      }

      update() {
        // Base movement
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Bounce off edges
        if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
        if (this.baseY < 0 || this.baseY > height) this.vy *= -1;

        // Keep particles in bounds
        this.baseX = Math.max(0, Math.min(width, this.baseX));
        this.baseY = Math.max(0, Math.min(height, this.baseY));

        // Apply wave effect
        let waveX = 0;
        let waveY = 0;
        if (enableWaveEffect) {
          waveX = Math.sin(time.current * this.waveFrequency + this.baseY * 0.01) * this.waveAmplitude;
          waveY = Math.cos(time.current * this.waveFrequency + this.baseX * 0.01) * this.waveAmplitude * 0.5;
        }

        // Apply parallax scrolling effect
        let parallaxY = 0;
        if (enableParallax) {
          parallaxY = scrollY.current * this.parallaxDepth * 0.3;
        }

        // Mouse repel/attract effect
        let mouseForceX = 0;
        let mouseForceY = 0;
        if (enableMouseRepel && mousePos.current.x !== null) {
          const dx = this.baseX - mousePos.current.x;
          const dy = this.baseY - mousePos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repelDistance = 150;
          
          if (distance < repelDistance) {
            const force = (1 - distance / repelDistance) * 30;
            mouseForceX = (dx / distance) * force;
            mouseForceY = (dy / distance) * force;
          }
        }

        // Combine all effects
        this.x = this.baseX + waveX + mouseForceX;
        this.y = this.baseY + waveY + mouseForceY + parallaxY;

        // Update pulse phase
        this.pulsePhase += 0.05;
      }

      draw() {
        // Calculate pulse size
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
        const currentRadius = this.radius * pulse;
        
        // Dynamic glow based on pulse
        const glowIntensity = (Math.sin(this.pulsePhase) + 1) * 0.5;
        
        // Strong outer glow with color variation
        ctx.shadowBlur = 15 + glowIntensity * 10;
        ctx.shadowColor = `hsla(${210 + this.hue}, 80%, 60%, ${0.6 + glowIntensity * 0.4})`;
        
        // Outer particle ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 1.5, 0, Math.PI * 2);
        const gradient1 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius * 1.5);
        gradient1.addColorStop(0, `hsla(${210 + this.hue}, 80%, 60%, ${0.4 + glowIntensity * 0.3})`);
        gradient1.addColorStop(1, `hsla(${210 + this.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = gradient1;
        ctx.fill();
        
        // Main particle body
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        const gradient2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius);
        gradient2.addColorStop(0, `hsla(${210 + this.hue}, 90%, 70%, 1)`);
        gradient2.addColorStop(1, `hsla(${210 + this.hue}, 80%, 60%, 0.6)`);
        ctx.fillStyle = gradient2;
        ctx.fill();
        
        // Bright white core
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + glowIntensity * 0.1})`;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }

    // Set canvas size (now after Particle class is defined)
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Recreate particles on resize
      particles.current = [];
      for (let i = 0; i < particleCount; i++) {
        particles.current.push(new Particle());
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push(new Particle());
    }

    // Enhanced mouse interaction
    let lastMouseX = null;
    let lastMouseY = null;
    
    const handleMouseMove = (e) => {
      if (lastMouseX !== null) {
        mousePos.current.vx = e.clientX - lastMouseX;
        mousePos.current.vy = e.clientY - lastMouseY;
      }
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mousePos.current.x = null;
      mousePos.current.y = null;
      lastMouseX = null;
      lastMouseY = null;
    };

    // Parallax scroll effect
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    // Click to create wave effect
    const handleClick = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      // Create wave ripple effect
      particles.current.forEach(particle => {
        const dx = particle.baseX - clickX;
        const dy = particle.baseY - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const force = (1 - distance / 200) * 50;
          particle.vx += (dx / distance) * force * 0.1;
          particle.vy += (dy / distance) * force * 0.1;
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    // Enhanced connection drawing with wave patterns
    const drawConnections = () => {
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const dx = particles.current[i].x - particles.current[j].x;
          const dy = particles.current[i].y - particles.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5;
            
            // Animated gradient line
            const gradient = ctx.createLinearGradient(
              particles.current[i].x, particles.current[i].y,
              particles.current[j].x, particles.current[j].y
            );
            
            const hue1 = 210 + particles.current[i].hue;
            const hue2 = 210 + particles.current[j].hue;
            
            gradient.addColorStop(0, `hsla(${hue1}, 80%, 60%, ${opacity})`);
            gradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2}, 85%, 65%, ${opacity * 1.2})`);
            gradient.addColorStop(1, `hsla(${hue2}, 80%, 60%, ${opacity})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.5, 2.5 - distance / connectionDistance * 2);
            ctx.shadowBlur = 3 + opacity * 5;
            ctx.shadowColor = `hsla(210, 80%, 60%, ${opacity * 0.6})`;
            ctx.moveTo(particles.current[i].x, particles.current[i].y);
            ctx.lineTo(particles.current[j].x, particles.current[j].y);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Enhanced mouse connection with flowing animation
        if (mousePos.current.x !== null && mousePos.current.y !== null) {
          const dx = particles.current[i].x - mousePos.current.x;
          const dy = particles.current[i].y - mousePos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = connectionDistance * 2;

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance);
            
            // Create flowing gradient effect
            const gradient = ctx.createLinearGradient(
              particles.current[i].x, particles.current[i].y,
              mousePos.current.x, mousePos.current.y
            );
            
            const flowPhase = (time.current * 0.002 + i * 0.1) % 1;
            gradient.addColorStop(0, `hsla(${210 + particles.current[i].hue}, 80%, 60%, ${opacity * 0.8})`);
            gradient.addColorStop(flowPhase, `hsla(180, 90%, 70%, ${opacity})`);
            gradient.addColorStop(1, `hsla(210, 80%, 60%, ${opacity * 0.3})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(1, 3.5 - distance / maxDistance * 3);
            ctx.shadowBlur = 8 + opacity * 12;
            ctx.shadowColor = `rgba(59, 130, 246, ${opacity * 0.8})`;
            ctx.moveTo(particles.current[i].x, particles.current[i].y);
            ctx.lineTo(mousePos.current.x, mousePos.current.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
      
      // Draw mouse cursor glow
      if (mousePos.current.x !== null && mousePos.current.y !== null) {
        const cursorPulse = Math.sin(time.current * 0.005) * 0.3 + 1;
        const cursorRadius = 8 * cursorPulse;
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        
        const cursorGradient = ctx.createRadialGradient(
          mousePos.current.x, mousePos.current.y, 0,
          mousePos.current.x, mousePos.current.y, cursorRadius * 2
        );
        cursorGradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
        cursorGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        cursorGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(mousePos.current.x, mousePos.current.y, cursorRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = cursorGradient;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    };

    // Enhanced animation loop with time tracking
    const animate = () => {
      time.current++;
      
      // Fade effect for trail (optional, creates motion blur)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      // Clear for sharp rendering
      ctx.clearRect(0, 0, width, height);

      // Draw connections first (background layer)
      drawConnections();

      // Update and draw particles (foreground layer)
      particles.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
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

// Enhanced preset configurations with new effects
export const ParticlePresets = {
  default: {
    particleCount: 100,
    particleColor: 'rgba(59, 130, 246, 0.6)',
    lineColor: 'rgba(59, 130, 246, 0.15)',
    particleSize: 2,
    speed: 0.5,
    connectionDistance: 140,
    enableWaveEffect: true,
    enableParallax: true,
    enableMouseRepel: true
  },
  energetic: {
    particleCount: 150,
    particleColor: 'rgba(16, 185, 129, 0.7)',
    lineColor: 'rgba(16, 185, 129, 0.2)',
    particleSize: 2.5,
    speed: 0.8,
    connectionDistance: 160,
    enableWaveEffect: true,
    enableParallax: true,
    enableMouseRepel: true
  },
  subtle: {
    particleCount: 60,
    particleColor: 'rgba(255, 255, 255, 0.3)',
    lineColor: 'rgba(255, 255, 255, 0.1)',
    particleSize: 1.5,
    speed: 0.3,
    connectionDistance: 100,
    enableWaveEffect: true,
    enableParallax: false,
    enableMouseRepel: false
  },
  calm: {
    particleCount: 80,
    particleColor: 'rgba(139, 92, 246, 0.5)',
    lineColor: 'rgba(139, 92, 246, 0.12)',
    particleSize: 2,
    speed: 0.4,
    connectionDistance: 120,
    enableWaveEffect: true,
    enableParallax: true,
    enableMouseRepel: true
  },
  intense: {
    particleCount: 180,
    particleColor: 'rgba(239, 68, 68, 0.6)',
    lineColor: 'rgba(239, 68, 68, 0.18)',
    particleSize: 3,
    speed: 1.0,
    connectionDistance: 180,
    enableWaveEffect: true,
    enableParallax: true,
    enableMouseRepel: true
  },
  minimal: {
    particleCount: 40,
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
