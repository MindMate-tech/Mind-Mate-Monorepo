import { useState, useEffect } from "react";
import VideoChat from "@/components/VideoChat";
import ExercisePanel from "@/components/ExercisePanel";
import MemoryCarousel from "@/components/MemoryCarousel";
import DementiaExercises from "@/components/DementiaExercises";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings, User, HelpCircle } from "lucide-react";

const SpaceBackground = () => {
  useEffect(() => {
    const container = document.querySelector(".space-stars");
    if (!container) return;

    // Create twinkling stars
    const createStar = () => {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${Math.random() * 3 + 1}px`;
      star.style.height = star.style.width;
      star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
      star.style.setProperty("--opacity", `${Math.random() * 0.5 + 0.3}`);
      star.style.animationDelay = `${Math.random() * 3}s`;
      return star;
    };

    // Create nebula clouds
    const createNebula = () => {
      const nebula = document.createElement("div");
      nebula.className = "nebula";
      const size = Math.random() * 300 + 200;
      nebula.style.width = `${size}px`;
      nebula.style.height = `${size}px`;
      nebula.style.left = `${Math.random() * 100}%`;
      nebula.style.top = `${Math.random() * 100}%`;
      
      const colors = [
        "hsl(263 85% 65% / 0.2)",
        "hsl(320 70% 60% / 0.15)",
        "hsl(230 60% 50% / 0.15)",
      ];
      nebula.style.background = colors[Math.floor(Math.random() * colors.length)];
      nebula.style.animation = Math.random() > 0.5 ? "nebula-drift 25s ease-in-out infinite" : "nebula-drift-slow 35s ease-in-out infinite";
      nebula.style.animationDelay = `${Math.random() * 10}s`;
      return nebula;
    };

    // Create shooting stars
    const createShootingStar = () => {
      const shootingStar = document.createElement("div");
      shootingStar.className = "shooting-star";
      shootingStar.style.left = `${Math.random() * 100}%`;
      shootingStar.style.top = `${Math.random() * 50}%`;
      shootingStar.style.animation = "shooting-star 2s ease-in forwards";
      shootingStar.style.animationDelay = `${Math.random() * 5}s`;
      
      setTimeout(() => shootingStar.remove(), 7000);
      return shootingStar;
    };

    // Create floating particles
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      const size = Math.random() * 2 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = Math.random() > 0.5 ? "float 6s ease-in-out infinite" : "drift 20s ease-in-out infinite";
      particle.style.animationDelay = `${Math.random() * 5}s`;
      return particle;
    };

    // Add stars
    for (let i = 0; i < 150; i++) {
      container.appendChild(createStar());
    }

    // Add nebula clouds
    for (let i = 0; i < 5; i++) {
      container.appendChild(createNebula());
    }

    // Add particles
    for (let i = 0; i < 40; i++) {
      container.appendChild(createParticle());
    }

    // Add shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        container.appendChild(createShootingStar());
      }
    }, 3000);

    return () => clearInterval(shootingStarInterval);
  }, []);

  return <div className="space-stars" />;
};

const Index = () => {
  const [showExercises, setShowExercises] = useState(false);
  const [showMemoryCarousel, setShowMemoryCarousel] = useState(false);
  const [showDementiaExercises, setShowDementiaExercises] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  useEffect(() => {
    // Fetch LiveKit token and create Beyond avatar session
    const initializeSession = async () => {
      try {
        const roomName = 'dementia-care-room';
        const username = `patient-${Date.now()}`;

        // Step 1: Get user token
        const tokenResponse = await fetch(`/api/token?room=${roomName}&username=${username}`);
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch token');
        }

        const tokenData = await tokenResponse.json();
        setLiveKitToken(tokenData.token);
        
        // Avatar session will be created in VideoChat component after permissions are granted
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoadingToken(false);
      }
    };

    initializeSession();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full relative">
        <SpaceBackground />
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="mr-2" />
                <div className="w-10 h-10 rounded-xl bg-gradient-cosmic flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">MindMate.tech</h1>
                  <p className="text-xs text-muted-foreground">AI Cognitive Health Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <HelpCircle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-6 py-6 relative z-10">
            <div className="h-[calc(100vh-140px)] flex gap-6">
              {isLoadingToken ? (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-space-deep to-space-mid rounded-2xl">
                  <div className="text-white text-center">
                    <p className="text-lg mb-2">Initializing video session...</p>
                    <p className="text-sm text-gray-400">Please wait</p>
                  </div>
                </div>
              ) : liveKitToken ? (
                <VideoChat
                  isExpanded={showExercises}
                  onToggleExercises={() => setShowExercises(!showExercises)}
                  onShowMemories={() => setShowMemoryCarousel(true)}
                  roomName="dementia-care-room"
                  participantName={`patient-${Date.now()}`}
                  token={liveKitToken}
                  liveKitUrl={import.meta.env.VITE_LIVEKIT_URL || 'wss://mindgate-b4zorucn.livekit.cloud'}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-space-deep to-space-mid rounded-2xl">
                  <div className="text-white text-center">
                    <p className="text-lg mb-2">Failed to initialize video session</p>
                    <p className="text-sm text-gray-400">Please refresh the page</p>
                  </div>
                </div>
              )}
              <ExercisePanel isVisible={showExercises} />
            </div>
          </main>

          {/* Memory Carousel */}
          <MemoryCarousel 
            isVisible={showMemoryCarousel} 
            onClose={() => setShowMemoryCarousel(false)} 
          />

          {/* Dementia Exercises */}
          <DementiaExercises 
            isVisible={showDementiaExercises} 
            onClose={() => setShowDementiaExercises(false)} 
          />

          {/* Floating Action Button for Loved Ones Photos */}
          {!showMemoryCarousel && (
            <Button
              onClick={() => setShowMemoryCarousel(true)}
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-glow bg-primary hover:bg-primary/90 animate-glow-pulse z-50"
            >
              <span className="text-2xl">❤️</span>
            </Button>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
