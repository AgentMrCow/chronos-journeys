import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AccessibilityState {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  ttsEnabled: boolean;
  preferredVoiceURI: string;
}

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  default: boolean;
}

export interface SpeakOptions {
  force?: boolean;
  interrupt?: boolean;
  lang?: string;
  pitch?: number;
  rate?: number;
  voiceURI?: string;
}

interface AccessibilityContextType extends AccessibilityState {
  availableVoices: VoiceOption[];
  speechSupported: boolean;
  previewVoice: (sampleText?: string) => void;
  setFontSize: (size: AccessibilityState["fontSize"]) => void;
  setPreferredVoice: (voiceURI: string) => void;
  stopSpeaking: () => void;
  toggleHighContrast: () => void;
  toggleTts: () => void;
  speak: (text: string, options?: SpeakOptions) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);
const STORAGE_KEY = "chronos-accessibility";

const loadInitialState = (): AccessibilityState => {
  if (typeof window === "undefined") {
    return {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: false,
      preferredVoiceURI: "",
    };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: false,
      preferredVoiceURI: "",
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AccessibilityState>;
    return {
      fontSize: parsed.fontSize === "large" || parsed.fontSize === "xlarge" ? parsed.fontSize : "normal",
      highContrast: Boolean(parsed.highContrast),
      ttsEnabled: Boolean(parsed.ttsEnabled),
      preferredVoiceURI: typeof parsed.preferredVoiceURI === "string" ? parsed.preferredVoiceURI : "",
    };
  } catch {
    return {
      fontSize: "normal",
      highContrast: false,
      ttsEnabled: false,
      preferredVoiceURI: "",
    };
  }
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>(loadInitialState);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  const setFontSize = useCallback((fontSize: AccessibilityState["fontSize"]) => {
    setState((s) => ({ ...s, fontSize }));
  }, []);

  const setPreferredVoice = useCallback((preferredVoiceURI: string) => {
    setState((s) => ({ ...s, preferredVoiceURI }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setState((s) => ({ ...s, highContrast: !s.highContrast }));
  }, []);

  const toggleTts = useCallback(() => {
    setState((s) => ({ ...s, ttsEnabled: !s.ttsEnabled }));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
  }, [speechSupported]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!speechSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices().map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
      }));

      setAvailableVoices(voices);

      if (!state.preferredVoiceURI && voices.length > 0) {
        const preferred =
          voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-tw")) ||
          voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ||
          voices.find((voice) => voice.default) ||
          voices[0];

        if (preferred) {
          setState((s) => ({ ...s, preferredVoiceURI: preferred.voiceURI }));
        }
      } else if (state.preferredVoiceURI && !voices.some((voice) => voice.voiceURI === state.preferredVoiceURI)) {
        setState((s) => ({ ...s, preferredVoiceURI: "" }));
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [speechSupported, state.preferredVoiceURI]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if ((!state.ttsEnabled && !options?.force) || !speechSupported || !text.trim()) return;

      if (options?.interrupt !== false) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const preferredVoiceURI = options?.voiceURI || state.preferredVoiceURI;
      const matchingVoice = preferredVoiceURI
        ? window.speechSynthesis.getVoices().find((voice) => voice.voiceURI === preferredVoiceURI)
        : undefined;

      if (matchingVoice) {
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
      } else {
        utterance.lang = options?.lang || "zh-TW";
      }

      utterance.rate = options?.rate ?? 0.92;
      utterance.pitch = options?.pitch ?? 1;
      window.speechSynthesis.speak(utterance);
    },
    [speechSupported, state.preferredVoiceURI, state.ttsEnabled]
  );

  const previewVoice = useCallback(
    (sampleText?: string) => {
      if (!speechSupported) return;
      const preview = sampleText || "藺相如已入秦廷，請慎思下一步。";
      const wasEnabled = state.ttsEnabled;

      if (!wasEnabled) {
        const utterance = new SpeechSynthesisUtterance(preview);
        const matchingVoice = state.preferredVoiceURI
          ? window.speechSynthesis.getVoices().find((voice) => voice.voiceURI === state.preferredVoiceURI)
          : undefined;

        if (matchingVoice) {
          utterance.voice = matchingVoice;
          utterance.lang = matchingVoice.lang;
        } else {
          utterance.lang = "zh-TW";
        }
        utterance.rate = 0.92;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return;
      }

      speak(preview);
    },
    [speak, speechSupported, state.preferredVoiceURI, state.ttsEnabled]
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
      value={{
        ...state,
        availableVoices,
        previewVoice,
        setFontSize,
        setPreferredVoice,
        speak,
        speechSupported,
        stopSpeaking,
        toggleHighContrast,
        toggleTts,
      }}
    >
      <div className={`${fontClass} ${contrastClass}`}>{children}</div>
    </AccessibilityContext.Provider>
  );
};
