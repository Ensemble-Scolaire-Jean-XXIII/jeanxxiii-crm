"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { parseJwt } from "../lib/auth";
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
      className={`group relative px-4 py-3 transition-all duration-300 flex items-center gap-4 font-medium border-l-4 border-transparent overflow-hidden whitespace-nowrap ${
        isActive
          ? "bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
          : "text-slate-300 hover:text-white hover:bg-white/5"
      }`}
    >
      <span
        className={`absolute left-0 top-0 h-full bg-accent transition-all duration-300 ${
          isActive
            ? "w-1 opacity-100"
            : "w-0 opacity-0 group-hover:w-0.5 group-hover:opacity-100"
        }`}
      ></span>
      <span className="shrink-0 w-6 h-6 relative flex items-center justify-center">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={20}
          height={20}
          className="object-contain brightness-0 invert"
          unoptimized
        />
      </span>
      <span
        className={`transition-opacity duration-300 ${
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLoginPage);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (isLoginPage) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
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
  }, [isLoginPage, router, handleLogout]);

  if (isLoginPage) return <>{children}</>;
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent relative">
      <div className="slideshow-container">
        <div className="slide bg-1"></div>
        <div className="slide bg-2"></div>
        <div className="slide bg-3"></div>
        <div className="slide bg-4"></div>
        <div className="slide bg-5"></div>
      </div>

      <header className="h-16 bg-primary text-white flex items-center justify-between px-6 border-b border-white/10 shadow-md shrink-0 z-20">
        <div className="font-bold text-lg tracking-wide flex items-center gap-3">
          <Image
            src="/j23.webp"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          JEAN XXIII CRM
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-danger hover:bg-danger-hover text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden bg-transparent z-10">
        <aside
          className={`bg-secondary/95 backdrop-blur-md text-white flex flex-col shrink-0 overflow-y-auto border-r border-white/10 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <div className="p-3 flex items-center justify-between border-b border-white/10">
            <span
              className={`font-semibold tracking-wider text-xs text-slate-400 transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              MENU
            </span>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs mx-auto flex items-center justify-center cursor-pointer"
              title={isSidebarOpen ? "Réduire" : "Déplier"}
            >
              {isSidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          <nav className="p-2 flex flex-col gap-1.5">
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

        <main className="flex-1 overflow-y-auto p-8 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
