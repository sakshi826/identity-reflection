import { useMemo } from "react";

const BackgroundStars = () => {
  const bgStars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
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
    </div>
  );
};

export default BackgroundStars;
