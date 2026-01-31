import { useState, useEffect, useRef } from "react";
import flyBody from "../assets/fly-body.png";
import flyLeftWing from "../assets/fly-leftwing.png";
import flyRightWing from "../assets/fly-rightwing.png";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [frame, setFrame] = useState(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let animationInterval: NodeJS.Timeout | null = null;
    
    if (isHovering) {
      animationInterval = setInterval(() => {
        setFrame(f => (f + 1) % 2);
      }, 50);
    } else if (isMoving) {
      animationInterval = setInterval(() => {
        setFrame(f => (f + 1) % 3);
      }, 70);
    } else {
      setFrame(0);
    }
    
    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [isHovering, isMoving]);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        setRotation(angle);
      }
      
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      setIsMoving(true);
      
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 120);
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
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  const size = isHovering ? 32 : 25;
  
  // Wing animation for hover (flapping)
  const leftWingRotation = isHovering ? (frame === 0 ? -20 : 20) : 0;
  const rightWingRotation = isHovering ? (frame === 0 ? 20 : -20) : 0;
  
  // Leg animation for moving (slight body tilt)
  const bodySkew = isMoving && !isHovering 
    ? (frame === 0 ? 0 : frame === 1 ? 1.5 : -1.5) 
    : 0;

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
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
            transform: `rotate(${rotation}deg)`,
            transition: "width 0.15s, height 0.15s",
          }}
        >
          {/* Left Wing - animates independently */}
          <img
            src={flyLeftWing}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              transformOrigin: "60% 40%",
              transform: `rotate(${leftWingRotation}deg)`,
              transition: isHovering ? "none" : "transform 0.1s",
              opacity: isHovering || !isMoving ? 1 : (frame === 1 ? 0.9 : 1),
            }}
          />
          
          {/* Right Wing - animates independently */}
          <img
            src={flyRightWing}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              transformOrigin: "40% 40%",
              transform: `rotate(${rightWingRotation}deg)`,
              transition: isHovering ? "none" : "transform 0.1s",
              opacity: isHovering || !isMoving ? 1 : (frame === 2 ? 0.9 : 1),
            }}
          />
          
          {/* Body - on top, with leg animation */}
          <img
            src={flyBody}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              transform: `skewX(${bodySkew}deg)`,
              transition: "transform 0.05s",
            }}
          />
        </div>
      </div>
    </>
  );
}
