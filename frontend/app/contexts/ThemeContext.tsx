"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type ThemeName = "islands" | "glass" | "institution";

type ThemeContextType = {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  t: {
    wrapper: string;
    sidebar: string;
    header: string;
    main: string;
    card: string;
    tableHeader: string;
    tableRow: string;
    input: string;
    btnPrimary: string;
    btnGhost: string;
    textMuted: string;
    title: string;
    activeNav: string;
    navHover: string;
  };
};

const getThemeStyles = () => {
  return {
    wrapper:
      "flex flex-col h-screen overflow-hidden p-2 md:p-4 gap-2 md:gap-4 bg-transparent relative text-[var(--text-main)]",
    sidebar:
      "bg-[var(--bg-sidebar)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl h-full shrink-0 shadow-2xl transition-all overflow-y-auto",
    header:
      "h-16 bg-[var(--bg-header)] backdrop-blur-xl text-white flex items-center justify-between px-3 md:px-6 rounded-2xl border border-[var(--border-color)] shadow-2xl shrink-0 z-20",
    main: "flex-1 overflow-y-auto flex flex-col p-4 lg:p-8 bg-[var(--bg-card)] backdrop-blur-lg rounded-2xl border border-[var(--border-color)] shadow-2xl",
    card: "crm-card",
    tableHeader:
      "bg-[var(--bg-table-header)] backdrop-blur-md text-[var(--text-muted)] border-b border-[var(--border-color)] z-20",
    tableRow:
      "border-b border-[var(--border-color)] hover:bg-white/5 transition-colors",
    input: "crm-input",
    btnPrimary: "crm-btn-primary",
    btnGhost: "crm-btn-ghost",
    textMuted: "text-[var(--text-muted)]",
    title: "text-[var(--text-main)] text-2xl font-bold tracking-tight",
    activeNav:
      "bg-[var(--accent)] text-white font-semibold rounded-xl shadow-lg",
    navHover:
      "hover:bg-white/10 text-[var(--text-muted)] rounded-xl transition-colors",
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("islands");

  useEffect(() => {
    const saved = localStorage.getItem("crm_theme") as ThemeName;
    if (saved) {
      setThemeNameState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "islands");
    }
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    localStorage.setItem("crm_theme", name);
    document.documentElement.setAttribute("data-theme", name);
  };

  return (
    <ThemeContext.Provider
      value={{ themeName, setThemeName, t: getThemeStyles() }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
