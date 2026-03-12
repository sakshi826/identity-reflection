import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/constellation/WelcomeScreen";
import StarSelectionScreen from "@/components/constellation/StarSelectionScreen";
import ReflectionScreen from "@/components/constellation/ReflectionScreen";
import BackgroundStars from "@/components/constellation/BackgroundStars";

export interface StarData {
  id: number;
  x: number;
  y: number;
  label: string;
}

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "selection" | "reflection">("welcome");
  const [stars, setStars] = useState<StarData[]>([]);

  const handleStart = useCallback(() => setScreen("selection"), []);

  const handleComplete = useCallback((completedStars: StarData[]) => {
    setStars(completedStars);
    setScreen("reflection");
  }, []);

  const handleReset = useCallback(() => {
    setStars([]);
    setScreen("welcome");
  }, []);

  return (
    <div className="relative min-h-screen bg-night-sky overflow-hidden">
      <BackgroundStars />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {screen === "welcome" && <WelcomeScreen key="welcome" onStart={handleStart} />}
          {screen === "selection" && <StarSelectionScreen key="selection" onComplete={handleComplete} />}
          {screen === "reflection" && (
            <ReflectionScreen
              key="reflection"
              stars={stars}
              onSave={() => {}}
              onCreateAnother={handleReset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
