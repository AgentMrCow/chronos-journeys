import React, { createContext, useContext, useState, useCallback } from "react";

interface AccessibilityState {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  ttsEnabled: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  setFontSize: (size: AccessibilityState["fontSize"]) => void;
  toggleHighContrast: () => void;
  toggleTts: () => void;
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>({
    fontSize: "normal",
    highContrast: false,
    ttsEnabled: false,
  });

  const setFontSize = useCallback((fontSize: AccessibilityState["fontSize"]) => {
    setState((s) => ({ ...s, fontSize }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setState((s) => ({ ...s, highContrast: !s.highContrast }));
  }, []);

  const toggleTts = useCallback(() => {
    setState((s) => ({ ...s, ttsEnabled: !s.ttsEnabled }));
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!state.ttsEnabled) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-TW";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [state.ttsEnabled]
  );

  const fontClass =
    state.fontSize === "large"
      ? "font-scale-large"
      : state.fontSize === "xlarge"
      ? "font-scale-xlarge"
      : "";

  const contrastClass = state.highContrast ? "high-contrast" : "";

  return (
    <AccessibilityContext.Provider
      value={{ ...state, setFontSize, toggleHighContrast, toggleTts, speak }}
    >
      <div className={`${fontClass} ${contrastClass}`}>{children}</div>
    </AccessibilityContext.Provider>
  );
};
