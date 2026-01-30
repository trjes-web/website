import { useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
}

const ENVELOPE_SVG = `
<svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="12" height="10" fill="#FF00FF"/>
  <rect x="1" y="1" width="10" height="8" fill="white"/>
  <rect x="2" y="2" width="1" height="1" fill="#FF00FF"/>
  <rect x="3" y="3" width="1" height="1" fill="#FF00FF"/>
  <rect x="4" y="4" width="1" height="1" fill="#FF00FF"/>
  <rect x="5" y="5" width="2" height="1" fill="#FF00FF"/>
  <rect x="7" y="4" width="1" height="1" fill="#FF00FF"/>
  <rect x="8" y="3" width="1" height="1" fill="#FF00FF"/>
  <rect x="9" y="2" width="1" height="1" fill="#FF00FF"/>
</svg>
`;

const ENVELOPE_DATA_URL = `data:image/svg+xml,${encodeURIComponent(ENVELOPE_SVG)}`;

export function useEnvelopeParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerParticles = useCallback((centerX: number, centerY: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const newParticles: Particle[] = [];
    const count = 12;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      newParticles.push({
        id: Date.now() + i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        originX: centerX,
        originY: centerY,
      });
    }
    
    setParticles(newParticles);
    
    setTimeout(() => {
      setParticles([]);
      setIsAnimating(false);
    }, 1000);
  }, [isAnimating]);

  return { particles, triggerParticles, isAnimating };
}

interface EnvelopeParticlesProps {
  particles: Particle[];
}

export function EnvelopeParticles({ particles }: EnvelopeParticlesProps) {
  if (particles.length === 0) return null;

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: particle.originX,
            top: particle.originY,
            animation: "envelopeFly 1s ease-out forwards",
            "--vx": `${particle.vx}px`,
            "--vy": `${particle.vy}px`,
          } as React.CSSProperties}
        >
          <img 
            src={ENVELOPE_DATA_URL} 
            alt="" 
            width={12} 
            height={10}
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      ))}
      <style>{`
        @keyframes envelopeFly {
          0% {
            transform: translate(-6px, -5px);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--vx) - 6px), calc(var(--vy) - 5px));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
