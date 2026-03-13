import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LanguageSelector from "@/components/LanguageSelector";
import "./i18n/index";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthGuard } from "@/components/AuthGuard";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    // 1. i18n language handling
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
    }

    // 2. Custom Handshake Protocol (Phase 7)
    const handleAuth = async () => {
      const token = params.get("token");
      const storedUserId = sessionStorage.getItem("user_id");

      if (storedUserId) {
        setIsAuthResolved(true);
        return;
      }

      if (!token) {
        window.location.href = "/token";
        return;
      }

      try {
        const response = await fetch("/api/auth/handshake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const { user_id } = await response.json();
          sessionStorage.setItem("user_id", user_id);
          
          // Phase 7, Step 3 — Remove token from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState({}, "", url.pathname + url.search);
          
          setIsAuthResolved(true);
        } else {
          window.location.href = "/token";
        }
      } catch (error) {
        console.error("Auth handshake failed:", error);
        window.location.href = "/token";
      }
    };

    handleAuth();
  }, [i18n]);

  // Phase 8 — UI Blocking During Handshake
  if (!isAuthResolved) {
    return (
      <div className="min-h-screen bg-night-sky flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-lavender border-t-transparent rounded-full animate-spin" />
          <p className="text-accent-lavender font-reflection animate-pulse">Initializing Sky...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageSelector />
        <BrowserRouter basename="/identity_reflection">
          <Routes>
            <Route 
              path="/" 
              element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
