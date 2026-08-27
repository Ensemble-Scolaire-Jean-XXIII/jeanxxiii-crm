"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { parseJwt } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";
import Image from "next/image";

function NavLink({
  href,
  iconSrc,
  iconAlt,
  children,
  isOpen,
}: {
  href: string;
  iconSrc: string;
  iconAlt: string;
  children: React.ReactNode;
  isOpen: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={!isOpen ? String(children) : undefined}
      className={`group relative px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium overflow-hidden whitespace-nowrap shrink-0 ${
        isActive
          ? "bg-accent/20 text-white border border-accent/30 shadow-lg shadow-accent/10"
          : "text-slate-300 hover:text-white hover:bg-white/10"
      }`}
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

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isSalonsPage = pathname === "/salons";

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLoginPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPassword, setExitPassword] = useState("");

  const {
    handleExitKiosk,
    isLoading: isExiting,
    error: exitError,
    setError: setExitError,
  } = useAuth();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isKioskMode");
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

    const isKioskMode = localStorage.getItem("isKioskMode") === "true";
    if (isKioskMode && !isSalonsPage) {
      router.push("/salons");
      return;
    }

    if (isSalonsPage) {
      localStorage.setItem("isKioskMode", "true");
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
    if (setExitError) setExitError("");
  }

  if (isLoginPage) return <>{children}</>;

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-white font-medium">
        Chargement...
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden p-2 md:p-4 gap-2 md:gap-4 bg-transparent relative">
      <header className="h-16 bg-slate-900/60 backdrop-blur-xl text-white flex items-center justify-between px-3 md:px-6 rounded-2xl border border-white/20 shadow-2xl shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-4">
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
            <span className="bg-accent/20 text-accent text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-accent/30 uppercase tracking-widest shrink-0">
              {isSalonsPage ? "SALON" : "CRM"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {!isSalonsPage ? (
            <>
              <Link
                href="/salons"
                className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold rounded-xl bg-linear-to-br from-accent to-orange-600 hover:from-accent hover:to-orange-500 text-white shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
              >
                <span className="relative px-3 py-2 transition-all ease-in duration-75 bg-slate-900/40 rounded-[10px] group-hover:bg-transparent flex items-center gap-2">
                  <Image
                    src="/icons/salons.webp"
                    alt="Salons"
                    width={16}
                    height={16}
                    className="object-contain brightness-0 invert shrink-0"
                    unoptimized
                  />
                  <span className="hidden md:inline-block">Mode Salon</span>
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-danger/80 text-white px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-danger/20 cursor-pointer"
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
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-danger/80 text-white px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-danger/20 cursor-pointer"
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

      <div className="flex flex-1 overflow-hidden gap-4">
        {!isSalonsPage && (
          <aside
            className={`hidden lg:flex bg-slate-900/60 backdrop-blur-xl text-white rounded-2xl border border-white/20 shadow-2xl flex-col shrink-0 overflow-y-auto transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "w-64" : "w-20"
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <span
                className={`font-bold tracking-wider text-xs text-slate-400 transition-opacity duration-300 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                NAVIGATION
              </span>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs mx-auto flex items-center justify-center cursor-pointer"
                title={isSidebarOpen ? "Réduire" : "Déplier"}
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
            </div>

            <nav className="p-3 flex flex-col gap-2">
              <NavLink
                href="/"
                iconSrc="/icons/dashboard.webp"
                iconAlt="Dashboard"
                isOpen={isSidebarOpen}
              >
                Tableau de bord
              </NavLink>
              {isAdmin && (
                <NavLink
                  href="/users"
                  iconSrc="/icons/users.webp"
                  iconAlt="Users"
                  isOpen={isSidebarOpen}
                >
                  Utilisateurs
                </NavLink>
              )}
              <NavLink
                href="/prospects"
                iconSrc="/icons/prospects.webp"
                iconAlt="Prospects"
                isOpen={isSidebarOpen}
              >
                Prospects
              </NavLink>
              <NavLink
                href="/automations"
                iconSrc="/icons/automations.webp"
                iconAlt="Automations"
                isOpen={isSidebarOpen}
              >
                Automatisations
              </NavLink>
              <NavLink
                href="/formations"
                iconSrc="/icons/formations.webp"
                iconAlt="Formations"
                isOpen={isSidebarOpen}
              >
                Formations
              </NavLink>
              <NavLink
                href="/statuses"
                iconSrc="/icons/statuses.webp"
                iconAlt="Statuses"
                isOpen={isSidebarOpen}
              >
                Statuts
              </NavLink>
              <NavLink
                href="/templates"
                iconSrc="/icons/templates.webp"
                iconAlt="Templates"
                isOpen={isSidebarOpen}
              >
                Templates
              </NavLink>
              <NavLink
                href="/profile"
                iconSrc="/icons/profile.webp"
                iconAlt="Profile"
                isOpen={isSidebarOpen}
              >
                Mon profil
              </NavLink>
            </nav>
          </aside>
        )}

        <main
          className={`flex-1 overflow-y-auto flex flex-col p-4 lg:p-8 ${
            !isSalonsPage
              ? "pb-24 lg:pb-8 bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-white/15 shadow-2xl"
              : ""
          }`}
        >
          {children}
        </main>
      </div>

      {!isSalonsPage && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-2xl border-t border-white/20 z-40 flex items-center justify-start sm:justify-center gap-1 overflow-x-auto px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `nav::-webkit-scrollbar { display: none; }`,
            }}
          />
          <NavLink
            href="/"
            iconSrc="/icons/dashboard.webp"
            iconAlt="Dashboard"
            isOpen={false}
          >
            Tableau de bord
          </NavLink>
          {isAdmin && (
            <NavLink
              href="/users"
              iconSrc="/icons/users.webp"
              iconAlt="Users"
              isOpen={false}
            >
              Utilisateurs
            </NavLink>
          )}
          <NavLink
            href="/prospects"
            iconSrc="/icons/prospects.webp"
            iconAlt="Prospects"
            isOpen={false}
          >
            Prospects
          </NavLink>
          <NavLink
            href="/automations"
            iconSrc="/icons/automations.webp"
            iconAlt="Automations"
            isOpen={false}
          >
            Automatisations
          </NavLink>
          <NavLink
            href="/formations"
            iconSrc="/icons/formations.webp"
            iconAlt="Formations"
            isOpen={false}
          >
            Formations
          </NavLink>
          <NavLink
            href="/statuses"
            iconSrc="/icons/statuses.webp"
            iconAlt="Statuses"
            isOpen={false}
          >
            Statuts
          </NavLink>
          <NavLink
            href="/templates"
            iconSrc="/icons/templates.webp"
            iconAlt="Templates"
            isOpen={false}
          >
            Templates
          </NavLink>
          <NavLink
            href="/profile"
            iconSrc="/icons/profile.webp"
            iconAlt="Profile"
            isOpen={false}
          >
            Mon profil
          </NavLink>
        </nav>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => handleExitKiosk(e, exitPassword)}
            className="bg-slate-900/90 border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl relative text-white"
          >
            <h3 className="text-xl font-bold mb-2">Quitter le Mode Salon</h3>
            <p className="text-sm text-slate-300 mb-6">
              Saisis ton mot de passe pour retourner au CRM.
            </p>
            {exitError && (
              <p className="text-danger text-sm mb-4 font-medium">
                {exitError}
              </p>
            )}
            <input
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              placeholder="Mot de passe..."
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 mb-6 focus:ring-2 focus:ring-accent outline-none"
              value={exitPassword}
              onChange={(e) => setExitPassword(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  if (setExitError) setExitError("");
                  setExitPassword("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isExiting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent/80 text-white transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-accent/20"
              >
                Déverrouiller
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
