import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCV } from "@/lib/cvContext";

interface NavBall {
  id: string;
  label: string;
  href: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle?: number;
  external?: boolean;
}

const BALL_SIZE = 70;
const SPEED = 0.5;
const EDGE_TOP = 50;
const EDGE_BOTTOM = 50;

const ALL_NAV_ITEMS = [
  { id: "portfolio", label: "portfolio", href: "/portfolio", external: true },
  { id: "cv", label: "cv", href: "/cv" },
  { id: "projects", label: "projects", href: "/projects" },
  { id: "contact", label: "contact", href: "/contact" },
  { id: "archive", label: "archive", href: "/archive" },
];

const DEFAULT_PAGES = ["portfolio", "cv", "projects", "contact", "archive"];

export function FloatingNav() {
  const [, setLocation] = useLocation();
  const { openCV } = useCV();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const ballsRef = useRef<NavBall[]>([]);
  const [balls, setBalls] = useState<NavBall[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const initializedRef = useRef(false);
  const lastPagesKeyRef = useRef("");

  const { data: portfolioData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/portfolioLink"],
    queryFn: async () => {
      const res = await fetch("/api/settings/portfolioLink");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: enabledPagesData } = useQuery<{ value: string | null }>({
    queryKey: ["/api/settings/enabledPages"],
    queryFn: async () => {
      const res = await fetch("/api/settings/enabledPages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const enabledPages = useMemo(() => {
    if (enabledPagesData?.value) {
      try {
        const pages = JSON.parse(enabledPagesData.value) as string[];
        return pages.map(p => p === "exhibitions" ? "archive" : p);
      } catch {
        return DEFAULT_PAGES;
      }
    }
    return DEFAULT_PAGES;
  }, [enabledPagesData?.value]);

  const enabledPagesKey = enabledPages.join(",");

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const isMobile = dimensions.width < 768;

  const getEdges = useCallback(() => {
    if (isMobile) {
      return { left: 10, right: 10 };
    }
    return { left: 150, right: 150 };
  }, [isMobile]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const needsInit = !initializedRef.current || lastPagesKeyRef.current !== enabledPagesKey;
    
    if (needsInit) {
      initializedRef.current = true;
      lastPagesKeyRef.current = enabledPagesKey;
      
      const navItems = ALL_NAV_ITEMS.filter(item => enabledPages.includes(item.id));
      const edges = getEdges();
      
      const newBalls = navItems.map((item, i) => {
        const baseAngle = (i / navItems.length) * Math.PI * 2;
        
        if (isMobile) {
          return {
            ...item,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            angle: baseAngle,
          };
        } else {
          const edge = Math.floor(Math.random() * 2);
          let x, y;
          if (edge === 0) {
            x = Math.random() * edges.left;
            y = EDGE_TOP + Math.random() * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
          } else {
            x = dimensions.width - edges.right + Math.random() * (edges.right - BALL_SIZE);
            y = EDGE_TOP + Math.random() * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
          }
          
          const angle = baseAngle + Math.random() * 0.5;
          return {
            ...item,
            x: Math.max(0, Math.min(x, dimensions.width - BALL_SIZE)),
            y: Math.max(EDGE_TOP, Math.min(y, dimensions.height - EDGE_BOTTOM - BALL_SIZE)),
            vx: Math.cos(angle) * SPEED * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.sin(angle) * SPEED * (Math.random() > 0.5 ? 1 : -1),
          };
        }
      });
      
      ballsRef.current = newBalls;
      setBalls(newBalls);
    }
  }, [dimensions.width, dimensions.height, enabledPagesKey, enabledPages, getEdges, isMobile]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || ballsRef.current.length === 0) return;

    const edges = getEdges();
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const orbitRadiusX = (dimensions.width / 2) - BALL_SIZE / 2 + 10;
    const orbitRadiusY = (dimensions.height / 2) - EDGE_TOP - BALL_SIZE / 2;
    const orbitSpeed = 0.003;

    const animate = () => {
      const updatedBalls = ballsRef.current.map(ball => {
        if (isMobile) {
          const newAngle = (ball.angle || 0) + orbitSpeed;
          const x = centerX + Math.cos(newAngle) * orbitRadiusX - BALL_SIZE / 2;
          const y = centerY + Math.sin(newAngle) * orbitRadiusY - BALL_SIZE / 2;
          
          return {
            ...ball,
            x: Math.max(0, Math.min(x, dimensions.width - BALL_SIZE)),
            y: Math.max(EDGE_TOP, Math.min(y, dimensions.height - EDGE_BOTTOM - BALL_SIZE)),
            angle: newAngle,
          };
        } else {
          let { x, y, vx, vy } = ball;

          x += vx;
          y += vy;

          if (y <= EDGE_TOP) {
            vy = Math.abs(vy);
            y = EDGE_TOP;
          } else if (y >= dimensions.height - EDGE_BOTTOM - BALL_SIZE) {
            vy = -Math.abs(vy);
            y = dimensions.height - EDGE_BOTTOM - BALL_SIZE;
          }

          if (x < 0) {
            vx = Math.abs(vx);
            x = 0;
          } else if (x > edges.left - BALL_SIZE && x < dimensions.width - edges.right) {
            if (vx > 0) {
              vx = -Math.abs(vx);
              x = edges.left - BALL_SIZE;
            } else {
              vx = Math.abs(vx);
              x = dimensions.width - edges.right;
            }
          } else if (x >= dimensions.width - BALL_SIZE) {
            vx = -Math.abs(vx);
            x = dimensions.width - BALL_SIZE;
          }

          return { ...ball, x, y, vx, vy };
        }
      });

      ballsRef.current = updatedBalls;
      setBalls([...updatedBalls]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [dimensions.width, dimensions.height, getEdges, isMobile]);

  const handleClick = (ball: NavBall) => {
    if (ball.id === "portfolio" && portfolioData?.value) {
      window.open(portfolioData.value, "_blank");
    } else if (ball.id === "cv") {
      openCV();
    } else {
      setLocation(ball.href);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
      {balls.map(ball => (
        <a
          key={ball.id}
          onClick={(e) => {
            e.preventDefault();
            handleClick(ball);
          }}
          href={ball.href}
          className="absolute pointer-events-auto cursor-pointer font-mono text-xs lowercase no-underline hover:underline transition-all"
          style={{
            left: ball.x,
            top: ball.y,
            color: "#0000EE",
            width: BALL_SIZE,
            height: BALL_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          data-testid={`nav-link-${ball.id}`}
        >
          {ball.label}
        </a>
      ))}
    </div>
  );
}
