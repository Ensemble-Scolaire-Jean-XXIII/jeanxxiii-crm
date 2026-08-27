"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeName, ThemeContextType } from "../types";

const themes: Record<ThemeName, ThemeContextType["t"]> = {
  shadowIslands: {
    wrapper:
      "flex flex-col h-screen overflow-hidden p-4 gap-4 bg-[var(--bg-main)]",
    sidebar:
      "bg-[var(--bg-sidebar)] backdrop-blur-xl rounded-r-2xl lg:rounded-2xl",
    header:
      "flex items-center justify-between px-6 py-4 bg-[var(--bg-header)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] shrink-0 shadow-2xl",
    main: "flex-1 crm-card overflow-y-auto flex flex-col min-h-0",
    card: "crm-card",
    tableHeader:
      "bg-[var(--bg-table-header)] text-[var(--text-main)] border-b border-[var(--border-color)]",
    tableRow: "border-b border-[var(--border-color)] hover:bg-white/5",
    input: "crm-input",
    btnPrimary: "crm-btn-primary",
    btnGhost: "crm-btn-ghost",
    textMuted: "text-[var(--text-muted)]",
    title: "text-xl font-bold text-[var(--text-main)]",
    activeNav:
      "bg-accent/20 text-white border border-accent/30 shadow-lg shadow-accent/10",
    navHover: "text-slate-300 hover:text-white hover:bg-white/10",
  },
  glass: {
    wrapper:
      "flex flex-col h-screen overflow-hidden p-4 gap-4 bg-[var(--bg-main)]",
    sidebar:
      "bg-[var(--bg-sidebar)] backdrop-blur-2xl rounded-r-2xl lg:rounded-2xl",
    header:
      "flex items-center justify-between px-6 py-4 bg-[var(--bg-header)] backdrop-blur-2xl rounded-2xl border border-[var(--border-color)] shrink-0 shadow-2xl",
    main: "flex-1 crm-card overflow-y-auto flex flex-col min-h-0",
    card: "crm-card",
    tableHeader:
      "bg-[var(--bg-table-header)] text-[var(--text-main)] border-b border-[var(--border-color)]",
    tableRow: "border-b border-[var(--border-color)] hover:bg-white/5",
    input: "crm-input",
    btnPrimary: "crm-btn-primary",
    btnGhost: "crm-btn-ghost",
    textMuted: "text-[var(--text-muted)]",
    title: "text-xl font-bold text-[var(--text-main)]",
    activeNav:
      "bg-cyan-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10",
    navHover: "text-slate-300 hover:text-white hover:bg-white/10",
  },
  institution: {
    wrapper:
      "flex flex-col h-screen overflow-hidden p-4 gap-4 bg-[var(--bg-main)]",
    sidebar:
      "bg-[var(--bg-sidebar)] backdrop-blur-xl rounded-r-2xl lg:rounded-2xl",
    header:
      "flex items-center justify-between px-6 py-4 bg-[var(--bg-header)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] shrink-0 shadow-2xl",
    main: "flex-1 crm-card overflow-y-auto flex flex-col min-h-0",
    card: "crm-card",
    tableHeader:
      "bg-[var(--bg-table-header)] text-[var(--text-main)] border-b border-[var(--border-color)]",
    tableRow: "border-b border-[var(--border-color)] hover:bg-white/5",
    input: "crm-input",
    btnPrimary: "crm-btn-primary",
    btnGhost: "crm-btn-ghost",
    textMuted: "text-[var(--text-muted)]",
    title: "text-xl font-bold text-[var(--text-main)]",
    activeNav:
      "bg-accent/20 text-white border border-accent/30 shadow-lg shadow-accent/10",
    navHover: "text-slate-300 hover:text-white hover:bg-white/10",
  },
  solid: {
    wrapper: "flex flex-col h-screen overflow-hidden bg-[var(--bg-main)]",
    sidebar: "bg-[var(--bg-sidebar)] rounded-none",
    header:
      "flex items-center justify-between px-6 py-4 bg-[var(--bg-header)] border-b border-[var(--border-color)] shrink-0 rounded-none",
    main: "flex-1 overflow-y-auto flex flex-col min-h-0 p-6 bg-[var(--bg-main)]",
    card: "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-box)] p-6 shadow-md",
    tableHeader:
      "bg-[var(--bg-table-header)] text-[var(--text-main)] border-b border-[var(--border-color)]",
    tableRow: "border-b border-[var(--border-color)] hover:bg-white/5",
    input: "crm-input",
    btnPrimary: "crm-btn-primary",
    btnGhost: "crm-btn-ghost",
    textMuted: "text-[var(--text-muted)]",
    title: "text-xl font-bold text-[var(--text-main)]",
    activeNav: "bg-accent/20 text-white border border-accent/30",
    navHover: "text-slate-300 hover:text-white hover:bg-white/10",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("shadowIslands");

  useEffect(() => {
    const saved = localStorage.getItem("crm-theme") as ThemeName;
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  }, []);

  const handleSetTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem("crm-theme", name);
    document.documentElement.setAttribute("data-theme", name);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setThemeName: handleSetTheme,
        t: themes[themeName] || themes.shadowIslands,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
