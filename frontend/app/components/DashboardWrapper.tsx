"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { parseJwt } from "../lib/auth";
import { userService } from "../services/userService";
import Image from "next/image";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";

function NavLink({
  href,
  iconSrc,
  iconAlt,
  children,
  isOpen,
  onClick,
  disabled,
}: {
  href: string;
  iconSrc: string;
  iconAlt: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={disabled ? "#" : href}
      title={!isOpen ? String(children) : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-disabled={disabled}
      className={`group relative px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium overflow-hidden whitespace-nowrap shrink-0 ${
        isActive
          ? "bg-accent/20 text-white border border-accent/30 shadow-lg shadow-accent/10"
          : "text-slate-300 hover:text-white hover:bg-white/10"
      } ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
    >
      <span className="shrink-0 w-6 h-6 relative flex items-center justify-center">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={20}
          height={20}
          className={`object-contain brightness-0 invert transition-all ${
            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
          }`}
          unoptimized
        />
      </span>
      <span
        className={`text-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden"
        }`}
      >
        {children}
      </span>
    </Link>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isSalonsPage = pathname === "/salons";

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLoginPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPassword, setExitPassword] = useState("");
  const [exitError, setExitError] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const { t, themeName } = useTheme();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isSalonMode");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (isLoginPage) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    const isSalonMode = localStorage.getItem("isSalonMode") === "true";
    if (isSalonMode && !isSalonsPage) {
      router.push("/salons");
      return;
    }

    if (isSalonsPage) {
      localStorage.setItem("isSalonMode", "true");
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      handleLogout();
    } else {
      setTimeout(() => {
        setIsAdmin(decoded.role === "admin");
        setIsLoading(false);
      }, 0);
    }
  }, [isLoginPage, isSalonsPage, router, handleLogout]);

  if (!isSalonsPage && showExitModal) {
    setShowExitModal(false);
    setExitPassword("");
    setExitError("");
  }

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExitError("");
    setIsExiting(true);
    try {
      await userService.reauthenticate(exitPassword);
      localStorage.removeItem("isSalonMode");
      setShowExitModal(false);
      setExitPassword("");
      router.push("/");
    } catch (err) {
      setExitError(
        err instanceof Error ? err.message : "Mot de passe incorrect",
      );
    } finally {
      setIsExiting(false);
    }
  };

  if (isLoginPage) return <>{children}</>;

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-(--bg-card) backdrop-blur-xl font-medium text-(--text-main)">
        Chargement...
      </div>
    );

  return (
    <div className={t.wrapper}>
      <header className={t.header}>
        <div className="flex items-center gap-2 md:gap-4">
          {!isSalonsPage && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="h-8 md:h-9 w-auto relative flex items-center shrink-0">
            <Image
              src="/j23.webp"
              alt="Logo"
              width={36}
              height={36}
              className="h-full w-auto object-contain rounded-lg"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-wider text-white hidden sm:block">
              ENSEMBLE SCOLAIRE JEAN XXIII
            </span>
            <span className="font-black text-sm tracking-wider text-white sm:hidden">
              JEAN XXIII
            </span>
            <span className="bg-[#e84e1b]/20 text-[#e84e1b] text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-[#e84e1b]/30 uppercase tracking-widest shrink-0">
              {" "}
              {isSalonsPage ? "SALON" : "CRM"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {!isSalonsPage ? (
            <>
              <Link
                href="/salons"
                className={`${t.btnPrimary} text-xs flex items-center gap-2`}
              >
                <Image
                  src="/icons/salons.webp"
                  alt="Salons"
                  width={16}
                  height={16}
                  className="object-contain brightness-0 invert shrink-0"
                  unoptimized
                />
                <span className="hidden md:inline-block">Mode Salon</span>
              </Link>

              <button
                onClick={handleLogout}
                className={`${t.btnGhost} text-xs flex items-center gap-2`}
              >
                <Image
                  src="/icons/logout.webp"
                  alt="Déconnexion"
                  width={16}
                  height={16}
                  className="object-contain brightness-0 invert shrink-0"
                  unoptimized
                />
                <span className="hidden md:inline-block">Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setExitError("");
                setExitPassword("");
                setShowExitModal(true);
              }}
              className={`${t.btnGhost} text-xs flex items-center gap-2`}
            >
              <Image
                src="/icons/back.webp"
                alt="Retour"
                width={16}
                height={16}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
              <span className="hidden md:inline-block">Retour au CRM</span>
            </button>
          )}
        </div>
      </header>

      <div
        className={`flex flex-1 overflow-hidden ${themeName === "solid" ? "gap-0" : "gap-4"}`}
      >
        {!isSalonsPage && isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-50 flex ${t.sidebar} text-white border-r lg:border border-(--border-color) shadow-2xl flex-col shrink-0 overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-20"
          } ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10 min-h-16">
            <span
              className={`font-bold tracking-wider text-xs text-slate-400 transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              NAVIGATION
            </span>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs mx-auto items-center justify-center cursor-pointer"
            >
              <Image
                src={
                  isSidebarOpen
                    ? "/icons/chevronLeft.webp"
                    : "/icons/chevronRight.webp"
                }
                alt={isSidebarOpen ? "Réduire" : "Déplier"}
                width={14}
                height={14}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer ml-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="p-3 flex flex-col gap-2">
            <NavLink
              href="/"
              iconSrc="/icons/dashboard.webp"
              iconAlt="Dashboard"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Tableau de bord
            </NavLink>
            {isAdmin && (
              <NavLink
                href="/users"
                iconSrc="/icons/users.webp"
                iconAlt="Users"
                isOpen={isSidebarOpen || isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(false)}
                disabled={isSalonsPage}
              >
                Utilisateurs
              </NavLink>
            )}
            <NavLink
              href="/prospects"
              iconSrc="/icons/prospects.webp"
              iconAlt="Prospects"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Prospects
            </NavLink>
            <NavLink
              href="/automations"
              iconSrc="/icons/automations.webp"
              iconAlt="Automations"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Automatisations
            </NavLink>
            <NavLink
              href="/formations"
              iconSrc="/icons/formations.webp"
              iconAlt="Formations"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Formations
            </NavLink>
            <NavLink
              href="/statuses"
              iconSrc="/icons/statuses.webp"
              iconAlt="Statuses"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Statuts
            </NavLink>
            <NavLink
              href="/templates"
              iconSrc="/icons/templates.webp"
              iconAlt="Templates"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Templates
            </NavLink>
            <NavLink
              href="/profile"
              iconSrc="/icons/profile.webp"
              iconAlt="Profile"
              isOpen={isSidebarOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={isSalonsPage}
            >
              Mon profil
            </NavLink>
          </nav>
        </aside>
        <main className={t.main}>{children}</main>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleExitSubmit}
            className={`${t.card} w-full max-w-md shadow-2xl relative space-y-4`}
          >
            <h3 className="text-xl font-bold text-(--text-main)">
              Quitter le Mode Salon
            </h3>
            <p className="text-sm text-(--text-muted)">
              Saisis ton mot de passe pour retourner au CRM.
            </p>
            {exitError && (
              <p className="text-red-400 text-xs font-medium">{exitError}</p>
            )}
            <input
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              placeholder="Mot de passe..."
              className={t.input}
              value={exitPassword}
              onChange={(e) => setExitPassword(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  setExitError("");
                  setExitPassword("");
                }}
                className={t.btnGhost}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isExiting}
                className={t.btnPrimary}
              >
                {isExiting ? "Vérification..." : "Déverrouiller"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DashboardInner>{children}</DashboardInner>
      </ToastProvider>
    </ThemeProvider>
  );
}
