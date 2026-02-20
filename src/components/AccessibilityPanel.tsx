import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Type, Eye, Volume2, X } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const { fontSize, setFontSize, highContrast, toggleHighContrast, ttsEnabled, toggleTts } =
    useAccessibility();

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-jade shadow-lg shadow-jade/30 transition-transform hover:scale-110"
        aria-label="Accessibility Settings"
      >
        <Settings className="h-6 w-6 text-accent-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg text-foreground">無障礙設定</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Type className="h-4 w-4" />
                <span>字體大小 Font Size</span>
              </div>
              <div className="flex gap-2">
                {(["normal", "large", "xlarge"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      fontSize === size
                        ? "border-gold bg-gold/20 text-gold"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {size === "normal" ? "標準" : size === "large" ? "大" : "特大"}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="mb-5">
              <button
                onClick={toggleHighContrast}
                className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-muted-foreground"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>高對比模式 High Contrast</span>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    highContrast ? "bg-jade" : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      highContrast ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Text to Speech */}
            <div>
              <button
                onClick={toggleTts}
                className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-muted-foreground"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  <span>語音朗讀 Text-to-Speech</span>
                </div>
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    ttsEnabled ? "bg-jade" : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      ttsEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              為神經多樣性人士設計 · Designed for neurodivergent users
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityPanel;
