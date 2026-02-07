import { useEffect, useState } from "react";

interface Decoration {
  id: string;
  svg: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  opacity: number;
  speed: number; // parallax multiplier
}

const decorations: Decoration[] = [
  {
    id: "neural-1",
    svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="4" fill="#F59E0B" opacity="0.6"/>
      <circle cx="50" cy="50" r="3" fill="#F59E0B" opacity="0.4"/>
      <circle cx="150" cy="50" r="3" fill="#8B5CF6" opacity="0.4"/>
      <circle cx="50" cy="150" r="3" fill="#8B5CF6" opacity="0.4"/>
      <circle cx="150" cy="150" r="3" fill="#F59E0B" opacity="0.4"/>
      <line x1="100" y1="100" x2="50" y2="50" stroke="#F59E0B" stroke-width="0.5" opacity="0.3"/>
      <line x1="100" y1="100" x2="150" y2="50" stroke="#8B5CF6" stroke-width="0.5" opacity="0.3"/>
      <line x1="100" y1="100" x2="50" y2="150" stroke="#8B5CF6" stroke-width="0.5" opacity="0.3"/>
      <line x1="100" y1="100" x2="150" y2="150" stroke="#F59E0B" stroke-width="0.5" opacity="0.3"/>
      <circle cx="30" cy="100" r="2" fill="#F59E0B" opacity="0.3"/>
      <circle cx="170" cy="100" r="2" fill="#8B5CF6" opacity="0.3"/>
      <line x1="100" y1="100" x2="30" y2="100" stroke="#F59E0B" stroke-width="0.3" opacity="0.2"/>
      <line x1="100" y1="100" x2="170" y2="100" stroke="#8B5CF6" stroke-width="0.3" opacity="0.2"/>
    </svg>`,
    top: "8%",
    left: "3%",
    size: "180px",
    opacity: 0.35,
    speed: 0.08,
  },
  {
    id: "circuit-1",
    svg: `<svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 80 L60 80 L60 40 L100 40 L100 80 L140 80" stroke="#8B5CF6" stroke-width="1" opacity="0.4"/>
      <path d="M80 20 L80 60 L120 60 L120 100 L80 100 L80 140" stroke="#F59E0B" stroke-width="1" opacity="0.3"/>
      <circle cx="60" cy="80" r="3" fill="#8B5CF6" opacity="0.5"/>
      <circle cx="100" cy="40" r="3" fill="#8B5CF6" opacity="0.5"/>
      <circle cx="80" cy="60" r="3" fill="#F59E0B" opacity="0.4"/>
      <circle cx="120" cy="100" r="3" fill="#F59E0B" opacity="0.4"/>
    </svg>`,
    top: "25%",
    right: "5%",
    size: "140px",
    opacity: 0.3,
    speed: 0.12,
  },
  {
    id: "hex-1",
    svg: `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,10 105,35 105,85 60,110 15,85 15,35" stroke="#F59E0B" stroke-width="0.8" fill="none" opacity="0.25"/>
      <polygon points="60,25 90,42 90,78 60,95 30,78 30,42" stroke="#F59E0B" stroke-width="0.5" fill="none" opacity="0.15"/>
      <polygon points="60,40 75,50 75,70 60,80 45,70 45,50" stroke="#F59E0B" stroke-width="0.3" fill="none" opacity="0.1"/>
    </svg>`,
    top: "55%",
    left: "2%",
    size: "120px",
    opacity: 0.25,
    speed: 0.15,
  },
  {
    id: "neural-2",
    svg: `<svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="30" r="3" fill="#8B5CF6" opacity="0.5"/>
      <circle cx="30" cy="90" r="3" fill="#F59E0B" opacity="0.4"/>
      <circle cx="150" cy="90" r="3" fill="#F59E0B" opacity="0.4"/>
      <circle cx="90" cy="150" r="3" fill="#8B5CF6" opacity="0.5"/>
      <circle cx="90" cy="90" r="5" fill="#F59E0B" opacity="0.6"/>
      <line x1="90" y1="90" x2="90" y2="30" stroke="#8B5CF6" stroke-width="0.5" opacity="0.3"/>
      <line x1="90" y1="90" x2="30" y2="90" stroke="#F59E0B" stroke-width="0.5" opacity="0.3"/>
      <line x1="90" y1="90" x2="150" y2="90" stroke="#F59E0B" stroke-width="0.5" opacity="0.3"/>
      <line x1="90" y1="90" x2="90" y2="150" stroke="#8B5CF6" stroke-width="0.5" opacity="0.3"/>
      <circle cx="60" cy="60" r="2" fill="#8B5CF6" opacity="0.3"/>
      <circle cx="120" cy="60" r="2" fill="#F59E0B" opacity="0.3"/>
      <circle cx="60" cy="120" r="2" fill="#F59E0B" opacity="0.3"/>
      <circle cx="120" cy="120" r="2" fill="#8B5CF6" opacity="0.3"/>
    </svg>`,
    top: "70%",
    right: "3%",
    size: "160px",
    opacity: 0.3,
    speed: 0.1,
  },
  {
    id: "dots-1",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({ length: 25 }, (_, i) => {
        const x = (i % 5) * 25 + 12;
        const y = Math.floor(i / 5) * 25 + 12;
        const color = i % 3 === 0 ? "#F59E0B" : "#8B5CF6";
        const op = 0.1 + Math.random() * 0.2;
        return `<circle cx="${x}" cy="${y}" r="1.5" fill="${color}" opacity="${op.toFixed(2)}"/>`;
      }).join("")}
    </svg>`,
    top: "40%",
    left: "8%",
    size: "100px",
    opacity: 0.2,
    speed: 0.05,
  },
  {
    id: "circuit-2",
    svg: `<svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 70 L40 70 L40 30 L70 30" stroke="#F59E0B" stroke-width="0.8" opacity="0.3"/>
      <path d="M70 30 L100 30 L100 70 L130 70" stroke="#8B5CF6" stroke-width="0.8" opacity="0.3"/>
      <path d="M70 110 L70 70" stroke="#F59E0B" stroke-width="0.8" opacity="0.25"/>
      <circle cx="70" cy="70" r="4" fill="#F59E0B" opacity="0.4"/>
      <circle cx="40" cy="70" r="2" fill="#F59E0B" opacity="0.3"/>
      <circle cx="100" cy="70" r="2" fill="#8B5CF6" opacity="0.3"/>
    </svg>`,
    top: "85%",
    left: "15%",
    size: "130px",
    opacity: 0.25,
    speed: 0.13,
  },
];

export function ParallaxDecorations() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {decorations.map((d) => (
        <div
          key={d.id}
          className="absolute"
          style={{
            top: d.top,
            left: d.left,
            right: d.right,
            bottom: d.bottom,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            transform: `translateY(${scrollY * d.speed}px)`,
            willChange: "transform",
          }}
          dangerouslySetInnerHTML={{ __html: d.svg }}
        />
      ))}
    </div>
  );
}
