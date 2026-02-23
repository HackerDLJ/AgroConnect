import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Supported languages with native names
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "fr", name: "French", native: "Français" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
];

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  translateText: async (t) => t,
  isTranslating: false,
});

// Cache translations to avoid redundant API calls
const translationCache = new Map<string, string>();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() =>
    localStorage.getItem("agro_lang") || "en"
  );
  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
    localStorage.setItem("agro_lang", code);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = code;
  }, []);

  // Translate using Google Translate unofficial API (no key required for basic use)
  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === "en" || !text) return text;

    // Input validation: limit length and reject suspicious content
    if (text.length > 5000) return text;

    const cacheKey = `${language}:${text}`;
    if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

    // Cache size limit to prevent memory exhaustion
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }

    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const data = await res.json();
      if (!Array.isArray(data?.[0])) return text;
      const translated = data[0]
        .filter((d: unknown): d is [string] => Array.isArray(d) && typeof d[0] === 'string')
        .map((d: [string]) => d[0])
        .join("") || text;
      translationCache.set(cacheKey, translated);
      return translated;
    } catch {
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translateText, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
