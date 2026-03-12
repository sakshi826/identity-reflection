import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/constellation/WelcomeScreen";
import StarSelectionScreen from "@/components/constellation/StarSelectionScreen";
import ReflectionScreen from "@/components/constellation/ReflectionScreen";
import HistoryScreen from "@/components/constellation/HistoryScreen";
import type { SavedConstellation } from "@/components/constellation/HistoryScreen";
import BackgroundStars from "@/components/constellation/BackgroundStars";

export interface StarData {
  id: number;
  x: number;
  y: number;
  label: string;
}

const STORAGE_KEY = "identity-constellations";

const loadConstellations = (): SavedConstellation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveConstellations = (data: SavedConstellation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "selection" | "reflection" | "history">("welcome");
  const [stars, setStars] = useState<StarData[]>([]);
  const [savedConstellations, setSavedConstellations] = useState<SavedConstellation[]>(loadConstellations);

  useEffect(() => {
    saveConstellations(savedConstellations);
  }, [savedConstellations]);

  const handleStart = useCallback(() => setScreen("selection"), []);
  const handleHistory = useCallback(() => setScreen("history"), []);

  const handleComplete = useCallback((completedStars: StarData[]) => {
    setStars(completedStars);
    setScreen("reflection");
  }, []);

  const handleSave = useCallback(() => {
    const newConstellation: SavedConstellation = {
      id: crypto.randomUUID(),
      stars,
      createdAt: new Date().toISOString(),
    };
    setSavedConstellations((prev) => [newConstellation, ...prev]);
    setScreen("welcome");
  }, [stars]);

  const handleDelete = useCallback((id: string) => {
    setSavedConstellations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleViewSaved = useCallback((c: SavedConstellation) => {
    setStars(c.stars);
    setScreen("reflection");
  }, []);

  const handleReset = useCallback(() => {
    setStars([]);
    setScreen("welcome");
  }, []);

  const handleBack = useCallback(() => setScreen("welcome"), []);

  return (
    <div className="relative min-h-screen bg-night-sky overflow-hidden">
      <BackgroundStars />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-6 px-2">
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <WelcomeScreen key="welcome" onStart={handleStart} onHistory={handleHistory} hasHistory={savedConstellations.length > 0} />
          )}
          {screen === "selection" && (
            <StarSelectionScreen key="selection" onComplete={handleComplete} onBack={handleBack} />
          )}
          {screen === "reflection" && (
            <ReflectionScreen
              key="reflection"
              stars={stars}
              onSave={handleSave}
              onCreateAnother={handleReset}
            />
          )}
          {screen === "history" && (
            <HistoryScreen
              key="history"
              constellations={savedConstellations}
              onBack={handleBack}
              onDelete={handleDelete}
              onView={handleViewSaved}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
