import { useState, useEffect } from "react";

const PixelBrush = ({ isHovering }: { isHovering: boolean }) => {
  const baseSize = 44;
  const hoverSize = 55;
  const size = isHovering ? hoverSize : baseSize;
  
  return (
    <svg 
      width={size} 
      height={size * 0.8} 
      viewBox="0 0 44 36" 
      fill="none"
      style={{ 
        imageRendering: "pixelated",
        transition: "all 0.15s ease-out",
        transform: "rotate(100deg)"
      }}
    >
      {/* Bristles - rectangular flat tip, beige/cream */}
      <rect x="0" y="10" width="2" height="16" fill="#E8DCC8" />
      <rect x="2" y="10" width="2" height="16" fill="#D4C8B4" />
      <rect x="4" y="10" width="2" height="16" fill="#E8DCC8" />
      <rect x="6" y="10" width="2" height="16" fill="#D4C8B4" />
      <rect x="8" y="10" width="2" height="16" fill="#E8DCC8" />
      <rect x="10" y="10" width="2" height="16" fill="#D4C8B4" />
      
      {/* Ferrule - silver/metal band */}
      <rect x="12" y="10" width="2" height="16" fill="#A0A0A0" />
      <rect x="14" y="10" width="2" height="16" fill="#C8C8C8" />
      <rect x="16" y="10" width="2" height="16" fill="#888888" />
      
      {/* Handle - black, longer with curve */}
      <rect x="18" y="12" width="2" height="12" fill="#1a1a1a" />
      <rect x="20" y="11" width="2" height="14" fill="#2a2a2a" />
      <rect x="22" y="10" width="2" height="16" fill="#1a1a1a" />
      <rect x="24" y="10" width="2" height="16" fill="#2a2a2a" />
      <rect x="26" y="10" width="2" height="16" fill="#1a1a1a" />
      <rect x="28" y="10" width="2" height="16" fill="#2a2a2a" />
      <rect x="30" y="11" width="2" height="14" fill="#1a1a1a" />
      <rect x="32" y="11" width="2" height="14" fill="#2a2a2a" />
      <rect x="34" y="12" width="2" height="12" fill="#1a1a1a" />
      
      {/* Round end with hole */}
      <rect x="36" y="13" width="2" height="10" fill="#1a1a1a" />
      <rect x="38" y="14" width="2" height="8" fill="#1a1a1a" />
      <rect x="40" y="15" width="2" height="6" fill="#1a1a1a" />
      <rect x="42" y="16" width="2" height="4" fill="#1a1a1a" />
      {/* Hole in the end */}
      <rect x="38" y="16" width="2" height="4" fill="#ffffff" />
    </svg>
  );
};

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const checkHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") ||
        target.style.cursor === "pointer" ||
        window.getComputedStyle(target).cursor === "pointer";
      setIsHovering(!!isClickable);
    };

    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("mousemove", checkHoverState);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mousemove", checkHoverState);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <style>{`
        body, a, button, [role="button"] {
          cursor: none !important;
        }
      `}</style>
      <div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.1s ease-out",
        }}
      >
        <PixelBrush isHovering={isHovering} />
      </div>
    </>
  );
}
