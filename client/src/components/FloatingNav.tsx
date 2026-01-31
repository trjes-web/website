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
  angle: number;
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
  { id: "recent", label: "recent", href: "/recent" },
];

const DEFAULT_PAGES = ["portfolio", "cv", "projects", "contact", "archive", "recent"];

export function FloatingNav() {
  const [, setLocation] = useLocation();
  const { openCV } = useCV();
  const ballsRef = useRef<NavBall[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Get dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const isMobile = dimensions.width > 0 && dimensions.width < 768;

  // Initialize balls
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (ballsRef.current.length > 0) return;
    
    const navItems = ALL_NAV_ITEMS.filter(item => enabledPages.includes(item.id));
    const edges = isMobile ? { left: 10, right: 10 } : { left: 150, right: 150 };
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const orbitRadiusX = (dimensions.width / 2) - BALL_SIZE;
    const orbitRadiusY = Math.min((dimensions.height / 2) - EDGE_TOP - BALL_SIZE, dimensions.height * 0.35);
    
    ballsRef.current = navItems.map((item, i) => {
      const baseAngle = (i / navItems.length) * Math.PI * 2;
      
      if (isMobile) {
        const x = centerX + Math.cos(baseAngle) * orbitRadiusX - BALL_SIZE / 2;
        const y = centerY + Math.sin(baseAngle) * orbitRadiusY - BALL_SIZE / 2;
        
        return {
          ...item,
          x: Math.max(0, Math.min(x, dimensions.width - BALL_SIZE)),
          y: Math.max(EDGE_TOP, Math.min(y, dimensions.height - EDGE_BOTTOM - BALL_SIZE)),
          vx: 0,
          vy: 0,
          angle: baseAngle,
        };
      } else {
        const edge = i % 2;
        let x, y;
        if (edge === 0) {
          x = Math.random() * (edges.left - BALL_SIZE);
          y = EDGE_TOP + (i / navItems.length) * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
        } else {
          x = dimensions.width - edges.right + Math.random() * (edges.right - BALL_SIZE);
          y = EDGE_TOP + (i / navItems.length) * (dimensions.height - EDGE_TOP - EDGE_BOTTOM - BALL_SIZE);
        }
        
        return {
          ...item,
          x: Math.max(0, Math.min(x, dimensions.width - BALL_SIZE)),
          y: Math.max(EDGE_TOP, Math.min(y, dimensions.height - EDGE_BOTTOM - BALL_SIZE)),
          vx: (Math.random() - 0.5) * SPEED * 2,
          vy: (Math.random() - 0.5) * SPEED * 2,
          angle: baseAngle,
        };
      }
    });
    
    setRenderTrigger(1);
  }, [dimensions.width, dimensions.height, enabledPages, isMobile]);

  // Animation with setInterval (more reliable on mobile)
  useEffect(() => {
    if (ballsRef.current.length === 0 || dimensions.width === 0) return;

    const edges = isMobile ? { left: 10, right: 10 } : { left: 150, right: 150 };
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const orbitRadiusX = (dimensions.width / 2) - BALL_SIZE;
    const orbitRadiusY = Math.min((dimensions.height / 2) - EDGE_TOP - BALL_SIZE, dimensions.height * 0.35);
    const orbitSpeed = 0.02;
    const mobile = isMobile;

    const tick = () => {
      ballsRef.current = ballsRef.current.map(ball => {
        if (mobile) {
          const newAngle = ball.angle + orbitSpeed;
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

      setRenderTrigger(t => t + 1);
    };

    intervalRef.current = setInterval(tick, 50);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ballsRef.current.length > 0, isMobile, dimensions.width, dimensions.height]);

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
    <div className="fixed inset-0 pointer-events-none z-40">
      {ballsRef.current.map(ball => (
        <a
          key={ball.id}
          onClick={(e) => {
            e.preventDefault();
            handleClick(ball);
          }}
          href={ball.href}
          className="absolute pointer-events-auto cursor-pointer font-mono text-xs lowercase no-underline hover:underline"
          style={{
            left: ball.x,
            top: ball.y,
            color: "#0000EE",
            width: BALL_SIZE,
            height: BALL_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform",
          }}
          data-testid={`nav-link-${ball.id}`}
        >
          {ball.label}
        </a>
      ))}
    </div>
  );
}
