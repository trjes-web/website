import { useState, useEffect, useRef } from "react";

const PixelFly = ({ isHovering, isMoving, rotation }: { isHovering: boolean; isMoving: boolean; rotation: number }) => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    if (isHovering) {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 2);
      }, 40);
      return () => clearInterval(interval);
    } else if (isMoving) {
      const interval = setInterval(() => {
        setFrame(f => (f + 1) % 3);
      }, 60);
      return () => clearInterval(interval);
    } else {
      setFrame(0);
    }
  }, [isHovering, isMoving]);

  const size = isHovering ? 52 : 44;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 36" 
      fill="none"
      style={{ 
        imageRendering: "pixelated",
        transition: "width 0.15s, height 0.15s",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* === WINGS === */}
      {isHovering ? (
        frame === 0 ? (
          <>
            {/* Left wing up */}
            <rect x="2" y="10" width="2" height="1" fill="#8a9aaa" />
            <rect x="1" y="11" width="4" height="1" fill="#9aaabb" />
            <rect x="0" y="12" width="5" height="2" fill="#aabbcc90" />
            <rect x="1" y="14" width="5" height="2" fill="#9aaabb80" />
            <rect x="2" y="16" width="5" height="2" fill="#8a9aaa70" />
            <rect x="3" y="18" width="4" height="1" fill="#8a9aaa60" />
            {/* wing veins */}
            <rect x="3" y="12" width="1" height="5" fill="#66778850" />
            <rect x="1" y="14" width="3" height="1" fill="#66778840" />
            
            {/* Right wing up */}
            <rect x="28" y="10" width="2" height="1" fill="#8a9aaa" />
            <rect x="27" y="11" width="4" height="1" fill="#9aaabb" />
            <rect x="27" y="12" width="5" height="2" fill="#aabbcc90" />
            <rect x="26" y="14" width="5" height="2" fill="#9aaabb80" />
            <rect x="25" y="16" width="5" height="2" fill="#8a9aaa70" />
            <rect x="25" y="18" width="4" height="1" fill="#8a9aaa60" />
            <rect x="28" y="12" width="1" height="5" fill="#66778850" />
            <rect x="28" y="14" width="3" height="1" fill="#66778840" />
          </>
        ) : (
          <>
            {/* Left wing down */}
            <rect x="2" y="16" width="2" height="1" fill="#8a9aaa" />
            <rect x="1" y="17" width="4" height="1" fill="#9aaabb" />
            <rect x="0" y="18" width="5" height="2" fill="#aabbcc90" />
            <rect x="1" y="20" width="5" height="2" fill="#9aaabb80" />
            <rect x="2" y="22" width="5" height="2" fill="#8a9aaa70" />
            <rect x="3" y="24" width="4" height="1" fill="#8a9aaa60" />
            <rect x="3" y="18" width="1" height="5" fill="#66778850" />
            
            {/* Right wing down */}
            <rect x="28" y="16" width="2" height="1" fill="#8a9aaa" />
            <rect x="27" y="17" width="4" height="1" fill="#9aaabb" />
            <rect x="27" y="18" width="5" height="2" fill="#aabbcc90" />
            <rect x="26" y="20" width="5" height="2" fill="#9aaabb80" />
            <rect x="25" y="22" width="5" height="2" fill="#8a9aaa70" />
            <rect x="25" y="24" width="4" height="1" fill="#8a9aaa60" />
            <rect x="28" y="18" width="1" height="5" fill="#66778850" />
          </>
        )
      ) : (
        <>
          {/* Left wing resting - folded down */}
          <rect x="4" y="14" width="3" height="1" fill="#7a8a9a" />
          <rect x="3" y="15" width="5" height="2" fill="#8a9aaa90" />
          <rect x="2" y="17" width="6" height="3" fill="#9aaabb80" />
          <rect x="2" y="20" width="6" height="3" fill="#aabbcc70" />
          <rect x="3" y="23" width="5" height="3" fill="#9aaabb60" />
          <rect x="4" y="26" width="4" height="2" fill="#8a9aaa50" />
          <rect x="5" y="28" width="3" height="2" fill="#8a9aaa40" />
          {/* veins */}
          <rect x="5" y="16" width="1" height="10" fill="#66778840" />
          <rect x="3" y="20" width="4" height="1" fill="#66778830" />
          
          {/* Right wing resting */}
          <rect x="25" y="14" width="3" height="1" fill="#7a8a9a" />
          <rect x="24" y="15" width="5" height="2" fill="#8a9aaa90" />
          <rect x="24" y="17" width="6" height="3" fill="#9aaabb80" />
          <rect x="24" y="20" width="6" height="3" fill="#aabbcc70" />
          <rect x="24" y="23" width="5" height="3" fill="#9aaabb60" />
          <rect x="24" y="26" width="4" height="2" fill="#8a9aaa50" />
          <rect x="24" y="28" width="3" height="2" fill="#8a9aaa40" />
          <rect x="26" y="16" width="1" height="10" fill="#66778840" />
          <rect x="25" y="20" width="4" height="1" fill="#66778830" />
        </>
      )}

      {/* === HEAD === */}
      <rect x="13" y="4" width="6" height="4" fill="#4a5a6a" />
      <rect x="14" y="3" width="4" height="1" fill="#4a5a6a" />
      <rect x="14" y="8" width="4" height="1" fill="#4a5a6a" />
      
      {/* === EYES === */}
      {/* Left eye */}
      <rect x="9" y="3" width="4" height="5" fill="#5a3030" />
      <rect x="10" y="4" width="2" height="3" fill="#7a4040" />
      <rect x="10" y="4" width="1" height="2" fill="#9a5a5a" />
      {/* Right eye */}
      <rect x="19" y="3" width="4" height="5" fill="#5a3030" />
      <rect x="20" y="4" width="2" height="3" fill="#7a4040" />
      <rect x="21" y="4" width="1" height="2" fill="#9a5a5a" />
      
      {/* === ANTENNAE === */}
      <rect x="11" y="2" width="1" height="2" fill="#3a3a3a" />
      <rect x="10" y="1" width="1" height="2" fill="#3a3a3a" />
      <rect x="9" y="0" width="1" height="2" fill="#3a3a3a" />
      <rect x="20" y="2" width="1" height="2" fill="#3a3a3a" />
      <rect x="21" y="1" width="1" height="2" fill="#3a3a3a" />
      <rect x="22" y="0" width="1" height="2" fill="#3a3a3a" />
      
      {/* === THORAX === */}
      <rect x="12" y="9" width="8" height="2" fill="#5a6a7a" />
      <rect x="11" y="11" width="10" height="2" fill="#6a7a8a" />
      <rect x="11" y="13" width="10" height="2" fill="#5a6a7a" />
      {/* thorax center stripe */}
      <rect x="15" y="9" width="2" height="6" fill="#7a8a9a" />
      
      {/* === ABDOMEN === */}
      <rect x="11" y="15" width="10" height="2" fill="#4a5a6a" />
      <rect x="12" y="17" width="8" height="2" fill="#5a6a7a" />
      <rect x="12" y="19" width="8" height="2" fill="#4a5a6a" />
      <rect x="13" y="21" width="6" height="2" fill="#5a6a7a" />
      <rect x="13" y="23" width="6" height="2" fill="#4a5a6a" />
      <rect x="14" y="25" width="4" height="2" fill="#5a6a7a" />
      <rect x="15" y="27" width="2" height="1" fill="#4a5a6a" />
      {/* abdomen center stripe */}
      <rect x="15" y="15" width="2" height="12" fill="#6a7a8a" />
      {/* abdomen side shading */}
      <rect x="11" y="15" width="1" height="6" fill="#3a4a5a" />
      <rect x="20" y="15" width="1" height="6" fill="#3a4a5a" />
      
      {/* === LEGS === */}
      {!isHovering && isMoving ? (
        frame === 0 ? (
          <>
            {/* Front legs - forward */}
            <rect x="9" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="7" y="9" width="3" height="1" fill="#2a2a2a" />
            <rect x="5" y="7" width="3" height="2" fill="#2a2a2a" />
            <rect x="3" y="5" width="3" height="2" fill="#2a2a2a" />
            <rect x="21" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="9" width="3" height="1" fill="#2a2a2a" />
            <rect x="24" y="7" width="3" height="2" fill="#2a2a2a" />
            <rect x="26" y="5" width="3" height="2" fill="#2a2a2a" />
            {/* Middle legs */}
            <rect x="9" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="6" y="12" width="4" height="1" fill="#2a2a2a" />
            <rect x="3" y="11" width="4" height="1" fill="#2a2a2a" />
            <rect x="1" y="10" width="3" height="1" fill="#2a2a2a" />
            <rect x="21" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="12" width="4" height="1" fill="#2a2a2a" />
            <rect x="25" y="11" width="4" height="1" fill="#2a2a2a" />
            <rect x="28" y="10" width="3" height="1" fill="#2a2a2a" />
            {/* Back legs */}
            <rect x="10" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="7" y="18" width="4" height="1" fill="#2a2a2a" />
            <rect x="5" y="19" width="3" height="1" fill="#2a2a2a" />
            <rect x="3" y="20" width="3" height="1" fill="#2a2a2a" />
            <rect x="20" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="21" y="18" width="4" height="1" fill="#2a2a2a" />
            <rect x="24" y="19" width="3" height="1" fill="#2a2a2a" />
            <rect x="26" y="20" width="3" height="1" fill="#2a2a2a" />
          </>
        ) : frame === 1 ? (
          <>
            {/* Front legs - mid */}
            <rect x="9" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="6" y="8" width="4" height="2" fill="#2a2a2a" />
            <rect x="4" y="6" width="3" height="2" fill="#2a2a2a" />
            <rect x="2" y="4" width="3" height="2" fill="#2a2a2a" />
            <rect x="21" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="8" width="4" height="2" fill="#2a2a2a" />
            <rect x="25" y="6" width="3" height="2" fill="#2a2a2a" />
            <rect x="27" y="4" width="3" height="2" fill="#2a2a2a" />
            {/* Middle legs */}
            <rect x="9" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="5" y="13" width="5" height="1" fill="#2a2a2a" />
            <rect x="2" y="12" width="4" height="1" fill="#2a2a2a" />
            <rect x="0" y="11" width="3" height="1" fill="#2a2a2a" />
            <rect x="21" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="13" width="5" height="1" fill="#2a2a2a" />
            <rect x="26" y="12" width="4" height="1" fill="#2a2a2a" />
            <rect x="29" y="11" width="3" height="1" fill="#2a2a2a" />
            {/* Back legs */}
            <rect x="10" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="6" y="19" width="5" height="1" fill="#2a2a2a" />
            <rect x="4" y="20" width="3" height="1" fill="#2a2a2a" />
            <rect x="2" y="21" width="3" height="1" fill="#2a2a2a" />
            <rect x="20" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="21" y="19" width="5" height="1" fill="#2a2a2a" />
            <rect x="25" y="20" width="3" height="1" fill="#2a2a2a" />
            <rect x="27" y="21" width="3" height="1" fill="#2a2a2a" />
          </>
        ) : (
          <>
            {/* Front legs - back */}
            <rect x="9" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="8" y="8" width="2" height="2" fill="#2a2a2a" />
            <rect x="6" y="5" width="3" height="3" fill="#2a2a2a" />
            <rect x="4" y="3" width="3" height="3" fill="#2a2a2a" />
            <rect x="21" y="10" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="8" width="2" height="2" fill="#2a2a2a" />
            <rect x="23" y="5" width="3" height="3" fill="#2a2a2a" />
            <rect x="25" y="3" width="3" height="3" fill="#2a2a2a" />
            {/* Middle legs */}
            <rect x="9" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="7" y="11" width="3" height="2" fill="#2a2a2a" />
            <rect x="4" y="10" width="4" height="1" fill="#2a2a2a" />
            <rect x="2" y="9" width="3" height="1" fill="#2a2a2a" />
            <rect x="21" y="13" width="2" height="1" fill="#2a2a2a" />
            <rect x="22" y="11" width="3" height="2" fill="#2a2a2a" />
            <rect x="24" y="10" width="4" height="1" fill="#2a2a2a" />
            <rect x="27" y="9" width="3" height="1" fill="#2a2a2a" />
            {/* Back legs */}
            <rect x="10" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="8" y="17" width="3" height="1" fill="#2a2a2a" />
            <rect x="6" y="18" width="3" height="1" fill="#2a2a2a" />
            <rect x="4" y="19" width="3" height="1" fill="#2a2a2a" />
            <rect x="20" y="17" width="2" height="1" fill="#2a2a2a" />
            <rect x="21" y="17" width="3" height="1" fill="#2a2a2a" />
            <rect x="23" y="18" width="3" height="1" fill="#2a2a2a" />
            <rect x="25" y="19" width="3" height="1" fill="#2a2a2a" />
          </>
        )
      ) : (
        <>
          {/* Resting legs */}
          {/* Front legs - up and forward */}
          <rect x="9" y="10" width="2" height="1" fill="#2a2a2a" />
          <rect x="7" y="8" width="3" height="2" fill="#2a2a2a" />
          <rect x="5" y="5" width="3" height="3" fill="#2a2a2a" />
          <rect x="3" y="2" width="3" height="4" fill="#2a2a2a" />
          <rect x="21" y="10" width="2" height="1" fill="#2a2a2a" />
          <rect x="22" y="8" width="3" height="2" fill="#2a2a2a" />
          <rect x="24" y="5" width="3" height="3" fill="#2a2a2a" />
          <rect x="26" y="2" width="3" height="4" fill="#2a2a2a" />
          {/* Middle legs - out to sides */}
          <rect x="9" y="13" width="2" height="1" fill="#2a2a2a" />
          <rect x="5" y="12" width="5" height="1" fill="#2a2a2a" />
          <rect x="2" y="11" width="4" height="1" fill="#2a2a2a" />
          <rect x="0" y="10" width="3" height="1" fill="#2a2a2a" />
          <rect x="21" y="13" width="2" height="1" fill="#2a2a2a" />
          <rect x="22" y="12" width="5" height="1" fill="#2a2a2a" />
          <rect x="26" y="11" width="4" height="1" fill="#2a2a2a" />
          <rect x="29" y="10" width="3" height="1" fill="#2a2a2a" />
          {/* Back legs - down and back */}
          <rect x="10" y="17" width="2" height="1" fill="#2a2a2a" />
          <rect x="7" y="18" width="4" height="1" fill="#2a2a2a" />
          <rect x="4" y="20" width="4" height="1" fill="#2a2a2a" />
          <rect x="2" y="22" width="3" height="1" fill="#2a2a2a" />
          <rect x="20" y="17" width="2" height="1" fill="#2a2a2a" />
          <rect x="21" y="18" width="4" height="1" fill="#2a2a2a" />
          <rect x="24" y="20" width="4" height="1" fill="#2a2a2a" />
          <rect x="27" y="22" width="3" height="1" fill="#2a2a2a" />
        </>
      )}
    </svg>
  );
};

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        <PixelFly isHovering={isHovering} isMoving={isMoving} rotation={rotation} />
      </div>
    </>
  );
}
