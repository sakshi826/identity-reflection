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



const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "selection" | "reflection" | "history">("welcome");
  const [stars, setStars] = useState<StarData[]>([]);
  const [savedConstellations, setSavedConstellations] = useState<SavedConstellation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = sessionStorage.getItem("user_id");

  const fetchConstellations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/constellations", {
        headers: { "x-user-id": userId || "" }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedConstellations(data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConstellations();
  }, [fetchConstellations]);

  const handleStart = useCallback(() => setScreen("selection"), []);
  const handleHistory = useCallback(() => setScreen("history"), []);

  const handleComplete = useCallback((completedStars: StarData[]) => {
    setStars(completedStars);
    setScreen("reflection");
  }, []);

  const handleSave = useCallback(async () => {
    const newConstellation = {
      id: crypto.randomUUID(),
      stars,
    };
    
    try {
      const response = await fetch("/api/constellations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId || ""
        },
        body: JSON.stringify(newConstellation),
      });

      if (response.ok) {
        await fetchConstellations();
        setScreen("welcome");
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, [stars, userId, fetchConstellations]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/constellations/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId || "" }
      });
      if (response.ok) {
        fetchConstellations();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }, [userId, fetchConstellations]);

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
