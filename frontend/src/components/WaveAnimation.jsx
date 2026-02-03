// Animated SVG Wave Background Component
// Creates smooth animated waves using SVG paths
import React from 'react';

export default function WaveAnimation({
  color1 = '#4285F4',
  color2 = '#2563EB',
  opacity = 0.1,
  speed = 10, // seconds
  position = 'bottom' // 'top' or 'bottom'
}) {
  const waveId1 = `wave-${Math.random().toString(36).substr(2, 9)}`;
  const waveId2 = `wave-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{
      position: 'absolute',
      [position]: 0,
      left: 0,
      width: '100%',
      height: '150px',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1,
      transform: position === 'top' ? 'rotate(180deg)' : 'none'
    }}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          <linearGradient id={waveId1} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} stopOpacity={opacity} />
            <stop offset="50%" stopColor={color2} stopOpacity={opacity * 1.3} />
            <stop offset="100%" stopColor={color1} stopOpacity={opacity} />
          </linearGradient>
          <linearGradient id={waveId2} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color2} stopOpacity={opacity * 0.8} />
            <stop offset="50%" stopColor={color1} stopOpacity={opacity * 1.2} />
            <stop offset="100%" stopColor={color2} stopOpacity={opacity * 0.8} />
          </linearGradient>
        </defs>
        
        {/* Wave 1 */}
        <path
          d="M0,60 C300,90 600,30 900,60 C1200,90 1500,60 1800,60 L1800,120 L0,120 Z"
          fill={`url(#${waveId1})`}
          style={{
            animation: `waveMove ${speed}s ease-in-out infinite`
          }}
        />
        
        {/* Wave 2 */}
        <path
          d="M0,80 C300,50 600,100 900,80 C1200,60 1500,90 1800,80 L1800,120 L0,120 Z"
          fill={`url(#${waveId2})`}
          style={{
            animation: `waveMove ${speed * 1.5}s ease-in-out infinite reverse`
          }}
        />
      </svg>
      
      <style>{`
        @keyframes waveMove {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25%);
          }
        }
      `}</style>
    </div>
  );
}

// Preset configurations
export const WavePresets = {
  blue: {
    color1: '#4285F4',
    color2: '#2563EB',
    opacity: 0.1,
    speed: 10
  },
  purple: {
    color1: '#8B5CF6',
    color2: '#7C3AED',
    opacity: 0.12,
    speed: 12
  },
  green: {
    color1: '#10B981',
    color2: '#059669',
    opacity: 0.08,
    speed: 15
  },
  red: {
    color1: '#EF4444',
    color2: '#DC2626',
    opacity: 0.09,
    speed: 11
  },
  subtle: {
    color1: '#94A3B8',
    color2: '#64748B',
    opacity: 0.05,
    speed: 20
  }
};
