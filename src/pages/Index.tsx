import HeroSection from "@/components/HeroSection";
import EraSelection from "@/components/EraSelection";
import FeaturesSection from "@/components/FeaturesSection";
import GameDemo from "@/components/GameDemo";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";

const Index = () => {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background">
        <HeroSection />
        <EraSelection />
        <GameDemo />
        <FeaturesSection />

        {/* Footer */}
        <footer className="border-t border-border py-12 text-center">
          <p className="font-serif text-xl text-shimmer">穿越千年 · Chronicle Quest</p>
          <p className="mt-2 text-sm text-muted-foreground">
            無論你來自何方 · Wherever you come from
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © 2026 Chronicle Quest. Inclusive by Design.
          </p>
        </footer>

        <AccessibilityPanel />
      </div>
    </AccessibilityProvider>
  );
};

export default Index;
