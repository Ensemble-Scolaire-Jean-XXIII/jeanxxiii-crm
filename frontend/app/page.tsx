"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { prospectService } from "./services/prospectService";
import { userService } from "./services/userService";
import { automationService } from "./services/automationService";
import { lexpressService } from "./services/lexpressService";
import Image from "next/image";
import Toast from "./components/Toast";
import Skeleton from "./components/Skeleton";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    prospects: 0,
    users: 0,
    automations: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isSyncingLatest, setIsSyncingLatest] = useState(false);
  const [isSyncingFull, setIsSyncingFull] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>("Jamais");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSyncStatus = async () => {
    try {
      const res = await lexpressService.getLastSync();
      if (res && res.lastSync) {
        const diffMinutes = Math.floor(
          (Date.now() - new Date(res.lastSync).getTime()) / 60000,
        );
        if (diffMinutes < 1) setLastSyncText("À l'instant");
        else if (diffMinutes < 60) setLastSyncText(`Il y a ${diffMinutes} min`);
        else setLastSyncText(`Il y a ${Math.floor(diffMinutes / 60)}h`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [pData, uData, aData] = await Promise.all([
        prospectService.getAll(),
        userService.getAll().catch(() => null),
        automationService.getAll().catch(() => []),
      ]);

      const isUserAdmin = Array.isArray(uData);

      setStats({
        prospects: Array.isArray(pData) ? pData.length : 0,
        users: isUserAdmin ? (uData as unknown[]).length : 0,
        automations: Array.isArray(aData) ? aData.length : 0,
      });
      setIsAdmin(isUserAdmin);
      await loadSyncStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, [loadData]);

  const handleSyncLatest = async () => {
    setIsSyncingLatest(true);
    setError("");
    setSuccess("");
    try {
      await lexpressService.syncLatest();
      setSuccess("Synchronisation rapide réussie");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Échec de la synchronisation rapide",
      );
    } finally {
      setIsSyncingLatest(false);
    }
  };

  const handleSyncFull = async () => {
    if (
      !confirm(
        "Attention, la synchronisation complète est plus longue. Continuer ?",
      )
    )
      return;

    setIsSyncingFull(true);
    setError("");
    setSuccess("");
    try {
      await lexpressService.syncFull();
      setSuccess("Synchronisation complète réussie");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Échec de la synchronisation complète",
      );
    } finally {
      setIsSyncingFull(false);
    }
  };

  return (
    <div className="space-y-8">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Tableau de bord
        </h1>
        <p className="text-white/80 mt-1">
          Bienvenue sur votre espace de gestion des prospects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
            Prospects totaux
          </h2>
          <div className="text-4xl font-bold text-white">
            {isLoading ? <Skeleton className="h-10 w-24" /> : stats.prospects}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
            Règles auto
          </h2>
          <div className="text-4xl font-bold text-white">
            {isLoading ? <Skeleton className="h-10 w-24" /> : stats.automations}
          </div>
        </div>

        {isAdmin && (
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
              Utilisateurs
            </h2>
            <div className="text-4xl font-bold text-white">
              {isLoading ? <Skeleton className="h-10 w-24" /> : stats.users}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6">
          <div className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            <h2 className="font-semibold text-white">Actions rapides</h2>
          </div>
          <div className="pt-6 flex flex-col gap-3">
            <Link
              href="/prospects"
              className="group flex items-center justify-between p-3 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
            >
              <span className="font-medium text-sm">Nouveau prospect</span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={18}
                height={18}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <Link
              href="/templates"
              className="group flex items-center justify-between p-3 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
            >
              <span className="font-medium text-sm">Nouveau template</span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={18}
                height={18}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <Link
              href="/automations"
              className="group flex items-center justify-between p-3 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
            >
              <span className="font-medium text-sm">Gérer automatisations</span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={18}
                height={18}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <Link
              href="/salons"
              className="group flex items-center justify-between p-3 rounded-md bg-blue-500/20 hover:bg-blue-500/40 transition-all border border-blue-400/30 text-white"
            >
              <span className="font-medium text-sm">
                Lancer le mode &#34;Salons&#34; (Kiosque)
              </span>
              <Image
                src="/icons/salons.webp"
                alt="Mode Salon"
                width={20}
                height={20}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <button
              onClick={handleSyncLatest}
              disabled={isSyncingLatest}
              className="cursor-pointer group flex items-center justify-between p-3 rounded-md bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white text-left disabled:opacity-50"
            >
              <span className="font-medium text-sm">
                {isSyncingLatest
                  ? "Mise à jour en cours..."
                  : `Actualiser les derniers prospects (${lastSyncText})`}
              </span>
              <Image
                src="/icons/refresh.webp"
                alt="Actualiser"
                width={20}
                height={20}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </button>

            {isAdmin && (
              <button
                onClick={handleSyncFull}
                disabled={isSyncingFull}
                className="cursor-pointer group flex items-center justify-between p-3 rounded-md bg-amber-500/20 hover:bg-amber-500/40 transition-all border border-amber-400/30 text-white text-left disabled:opacity-50"
              >
                <span className="font-medium text-sm">
                  {isSyncingFull
                    ? "Synchro complète en cours..."
                    : "Forcer la synchronisation complète (si une longue période de coupure est survenue)"}
                </span>
                <Image
                  src="/icons/dangerSync.webp"
                  alt="Sync"
                  width={20}
                  height={20}
                  className="object-contain brightness-0 invert shrink-0"
                  unoptimized
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
