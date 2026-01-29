import { useState, useEffect, useRef, useMemo } from "react";
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
  external?: boolean;
}

const BALL_SIZE = 70;
const SPEED = 0.4;
const EDGE_TOP = 50;
const EDGE_BOTTOM = 50;
const EDGE_LEFT = 150;
const EDGE_RIGHT = 150;

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

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const needsInit = !initializedRef.current || lastPagesKeyRef.current !== enabledPagesKey;
    
    if (needsInit) {
      initializedRef.current = true;
      lastPagesKeyRef.current = enabledPagesKey;
      
      const navItems = ALL_NAV_ITEMS.filter(item => enabledPages.includes(item.id));
      
      const newBalls = navItems.map((item, i) => {
        const angle = (i / navItems.length) * Math.PI * 2;
        const edge = Math.floor(Math.random() * 2);
        let x, y;
        
        if (edge === 0) {
          x = Math.random() * EDGE_LEFT;
          y = EDGE_TOP + Math.random() * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
        } else {
          x = dimensions.width - EDGE_RIGHT + Math.random() * (EDGE_RIGHT - BALL_SIZE);
          y = EDGE_TOP + Math.random() * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
        }
        
        return {
          ...item,
          x,
          y,
          vx: Math.cos(angle) * SPEED,
          vy: Math.sin(angle) * SPEED,
        };
      });
      
      setBalls(newBalls);
    }
  }, [dimensions.width, dimensions.height, enabledPagesKey, enabledPages]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || balls.length === 0) return;

    const animate = () => {
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          let { x, y, vx, vy } = ball;

          x += vx;
          y += vy;

          if (y <= EDGE_TOP || y >= dimensions.height - EDGE_BOTTOM - BALL_SIZE) {
            vy = -vy;
            y = Math.max(EDGE_TOP, Math.min(y, dimensions.height - EDGE_BOTTOM - BALL_SIZE));
          }

          if (x < 0) {
            vx = Math.abs(vx);
            x = 0;
          } else if (x > EDGE_LEFT - BALL_SIZE && x < dimensions.width - EDGE_RIGHT) {
            if (vx > 0) {
              vx = -vx;
              x = EDGE_LEFT - BALL_SIZE;
            } else {
              vx = -vx;
              x = dimensions.width - EDGE_RIGHT;
            }
          } else if (x >= dimensions.width - BALL_SIZE) {
            vx = -Math.abs(vx);
            x = dimensions.width - BALL_SIZE;
          }

          return { ...ball, x, y, vx, vy };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, balls.length]);

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
