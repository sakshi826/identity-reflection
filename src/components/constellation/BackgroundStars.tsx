import { useMemo, useState, useEffect } from "react";

const BackgroundStars = () => {
  const bgStars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  // Sparkle bursts - random stars that briefly flash bright
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; key: number }[]>([]);

  useEffect(() => {
    let keyCounter = 0;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const newSparkles = Array.from({ length: count }, () => ({
        id: Math.floor(Math.random() * 1000),
        x: Math.random() * 100,
        y: Math.random() * 100,
        key: keyCounter++,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 800);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {bgStars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-star animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration + 2}s`,
          }}
        />
      ))}
      {sparkles.map((s) => (
        <div
          key={s.key}
          className="absolute animate-sparkle-burst"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="6" y1="0" x2="6" y2="12" className="stroke-star-selected" strokeWidth="1" />
            <line x1="0" y1="6" x2="12" y2="6" className="stroke-star-selected" strokeWidth="1" />
            <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" className="stroke-star-selected" strokeWidth="0.5" />
            <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" className="stroke-star-selected" strokeWidth="0.5" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default BackgroundStars;
