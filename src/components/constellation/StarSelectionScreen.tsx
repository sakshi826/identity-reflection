import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StarData } from "@/pages/Index";

interface StarSelectionScreenProps {
  onComplete: (stars: StarData[]) => void;
}

const PROMPTS = [
  "What part of you shines here?",
  "Add a word that represents you.",
  "What strength lives in this star?",
  "Name something that makes you you.",
  "What quality lights up your sky?",
  "What part of your story belongs here?",
  "What strength has carried you forward?",
  "What word describes a piece of your identity?",
  "What part of yourself are you proud of?",
  "What inner light does this star hold?",
];

const SUGGESTIONS = [
  "courage", "creative", "soft", "queer", "survivor",
  "resilient", "friend", "kind", "dreamer", "curious",
];

const ACCENT_COLORS = [
  "fill-accent-pink",
  "fill-accent-blue",
  "fill-accent-lavender",
  "fill-accent-mint",
];

const StarSelectionScreen = ({ onComplete }: StarSelectionScreenProps) => {
  const starPositions = useMemo(() => {
    const positions: { id: number; x: number; y: number }[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radius = 120 + Math.random() * 80;
      positions.push({
        id: i,
        x: 200 + Math.cos(angle) * radius,
        y: 200 + Math.sin(angle) * radius,
      });
    }
    return positions;
  }, []);

  const [labeledStars, setLabeledStars] = useState<StarData[]>([]);
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);

  const handleStarTap = useCallback((id: number) => {
    if (labeledStars.length >= 6 && !labeledStars.find((s) => s.id === id)) return;
    if (labeledStars.find((s) => s.id === id)) return;
    setActiveStar(id);
    setInputValue("");
    setPromptIndex(Math.floor(Math.random() * PROMPTS.length));
  }, [labeledStars]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || activeStar === null) return;
    const pos = starPositions.find((s) => s.id === activeStar)!;
    const newStar: StarData = { id: activeStar, x: pos.x, y: pos.y, label: inputValue.trim() };
    setLabeledStars((prev) => [...prev, newStar]);
    setActiveStar(null);
    setInputValue("");
  }, [inputValue, activeStar, starPositions]);

  const handleChip = useCallback((word: string) => {
    setInputValue(word);
  }, []);

  const isLabeled = (id: number) => labeledStars.some((s) => s.id === id);
  const canComplete = labeledStars.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center w-full max-w-lg mx-auto px-4"
    >
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-reflection text-base text-foreground/80 mb-6 text-justified"
      >
        Tap stars to add parts of who you are.
      </motion.p>

      {/* Star field */}
      <div className="relative w-[400px] h-[400px] mx-auto">
        <svg width="400" height="400" className="absolute inset-0">
          {/* Constellation lines */}
          {labeledStars.length > 1 &&
            labeledStars.map((star, i) => {
              if (i === 0) return null;
              const prev = labeledStars[i - 1];
              return (
                <motion.line
                  key={`line-${prev.id}-${star.id}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={star.x}
                  y2={star.y}
                  className="stroke-constellation"
                  strokeWidth="1.5"
                  opacity="0.6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              );
            })}
        </svg>

        {starPositions.map((star) => {
          const labeled = isLabeled(star.id);
          const isActive = activeStar === star.id;
          const labelData = labeledStars.find((s) => s.id === star.id);

          return (
            <motion.div
              key={star.id}
              className="absolute cursor-pointer"
              style={{ left: star.x - 16, top: star.y - 16 }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleStarTap(star.id)}
            >
              <motion.div
                animate={labeled ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r={labeled ? 8 : 5}
                    className={`${
                      labeled
                        ? "fill-star-selected glow-star"
                        : isActive
                        ? "fill-star-selected"
                        : `fill-star glow-star-default`
                    }`}
                  />
                  {labeled && (
                    <>
                      <circle cx="16" cy="16" r="12" fill="none" className="stroke-star-selected" strokeWidth="0.5" opacity="0.3" />
                    </>
                  )}
                </svg>
              </motion.div>
              {labeled && labelData && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-star-selected whitespace-nowrap font-reflection"
                >
                  {labelData.label}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input area */}
      <AnimatePresence>
        {activeStar !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 w-full max-w-sm"
          >
            <p className="text-sm text-accent-lavender mb-2 text-justified font-reflection">
              {PROMPTS[promptIndex]}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type a word…"
                maxLength={20}
                className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="bg-gradient-primary px-5 py-2.5 rounded-lg text-primary-foreground text-sm font-semibold disabled:opacity-40"
              >
                Add
              </motion.button>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTIONS.map((word) => (
                <button
                  key={word}
                  onClick={() => handleChip(word)}
                  className="px-3 py-1 rounded-full text-xs bg-muted/60 text-foreground/70 hover:bg-secondary/30 hover:text-foreground transition-colors border border-border/50"
                >
                  {word}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete button */}
      {canComplete && activeStar === null && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(labeledStars)}
          className="mt-8 bg-gradient-primary px-8 py-3 rounded-full text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30"
        >
          View My Constellation
        </motion.button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {labeledStars.length}/6 stars labeled
      </p>
    </motion.div>
  );
};

export default StarSelectionScreen;
