// Floating Dots UI Animation Component
// Adds animated SVG dots that float across the screen
import React from 'react';

export default function FloatingDots({
  dotCount = 20,
  dotSize = 4,
  color = '#4285F4',
  opacity = 0.3,
  speed = 20 // seconds per animation cycle
}) {
  // Generate random positions and animations for dots
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    id: i,
    size: dotSize + Math.random() * dotSize,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * speed,
    duration: speed + Math.random() * speed,
    opacity: opacity + Math.random() * 0.3
  }));

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {dots.map(dot => (
        <div
          key={dot.id}
          style={{
            position: 'absolute',
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: dot.opacity,
            animation: `floatDot ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
            boxShadow: `0 0 ${dot.size * 2}px ${color}`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes floatDot {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.2);
          }
          50% {
            transform: translate(-15px, -60px) scale(0.8);
          }
          75% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

// Preset configurations
export const FloatingDotsPresets = {
  subtle: {
    dotCount: 15,
    dotSize: 3,
    color: '#94A3B8',
    opacity: 0.2,
    speed: 25
  },
  vibrant: {
    dotCount: 30,
    dotSize: 5,
    color: '#4285F4',
    opacity: 0.4,
    speed: 15
  },
  energetic: {
    dotCount: 40,
    dotSize: 6,
    color: '#10B981',
    opacity: 0.35,
    speed: 12
  },
  calm: {
    dotCount: 10,
    dotSize: 4,
    color: '#8B5CF6',
    opacity: 0.25,
    speed: 30
  }
};
