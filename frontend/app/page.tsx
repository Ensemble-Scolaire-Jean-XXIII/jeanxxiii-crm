"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { prospectService } from "./services/prospectService";
import { userService } from "./services/userService";
import { automationService } from "./services/automationService";
import { lexpressService } from "./services/lexpressService";
import Image from "next/image";
import Skeleton from "./components/Skeleton";
import PageHeader from "./components/PageHeader";
import { useTheme } from "./contexts/ThemeContext";
import { useToast } from "./contexts/ToastContext";

export default function DashboardPage() {
  const { t } = useTheme();
  const { showToast } = useToast();
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
    try {
      await lexpressService.syncLatest();
      showToast("Synchronisation rapide réussie", "success");
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "Échec de la synchronisation rapide",
        "error",
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
    try {
      await lexpressService.syncFull();
      showToast("Synchronisation complète réussie", "success");
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "Échec de la synchronisation complète",
        "error",
      );
    } finally {
      setIsSyncingFull(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre espace de gestion des prospects"
      />

      <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar pr-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className={`${t.card} border border-(--border-color) rounded-2xl p-4`}
          >
            <h2
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${t.textMuted}`}
            >
              Prospects totaux
            </h2>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-24" /> : stats.prospects}
            </div>
          </div>
          <div
            className={`${t.card} border border-(--border-color) rounded-2xl p-4`}
          >
            <h2
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${t.textMuted}`}
            >
              Règles auto
            </h2>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                stats.automations
              )}
            </div>
          </div>

          {isLoading ? (
            <div
              className={`${t.card} border border-(--border-color) rounded-2xl p-4`}
            >
              <h2
                className={`text-xs font-semibold uppercase tracking-wider mb-1 ${t.textMuted}`}
              >
                Utilisateurs
              </h2>
              <div className="text-3xl font-bold">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ) : (
            isAdmin && (
              <div
                className={`${t.card} border border-(--border-color) rounded-2xl p-4`}
              >
                <h2
                  className={`text-xs font-semibold uppercase tracking-wider mb-1 ${t.textMuted}`}
                >
                  Utilisateurs
                </h2>
                <div className="text-3xl font-bold">{stats.users}</div>
              </div>
            )
          )}
        </div>

        <div
          className={`${t.card} border border-(--border-color) rounded-2xl p-4`}
        >
          <div className="border-b border-(--border-color) pb-3">
            <h2 className="font-semibold text-base">Actions rapides</h2>
          </div>
          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/prospects?action=create"
              className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-(--border-color)"
            >
              <span className="font-medium text-sm">Ajouter un prospect</span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={16}
                height={16}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <Link
              href="/templates?action=create"
              className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-(--border-color)"
            >
              <span className="font-medium text-sm">
                Créer un nouveau template
              </span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={16}
                height={16}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <Link
              href="/automations?action=create"
              className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-(--border-color)"
            >
              <span className="font-medium text-sm">
                Créer une nouvelle automatisation
              </span>
              <Image
                src="/icons/add.webp"
                alt="Ajouter"
                width={16}
                height={16}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            <button
              onClick={handleSyncLatest}
              disabled={isSyncingLatest}
              className="cursor-pointer group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-(--border-color) text-left disabled:opacity-50"
            >
              <span className="font-medium text-sm flex items-center gap-1.5">
                {isSyncingLatest ? (
                  "Mise à jour en cours..."
                ) : isLoading ? (
                  <>
                    <span>Actualiser les derniers prospects -</span>
                    <Skeleton className="inline-block h-4 w-14" />
                    <span></span>
                  </>
                ) : (
                  `Actualiser les derniers prospects - ${lastSyncText}`
                )}
              </span>
              <Image
                src="/icons/refresh.webp"
                alt="Actualiser"
                width={18}
                height={18}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </button>

            <Link
              href="/salons"
              className="group flex items-center justify-between p-2.5 rounded-xl bg-[#e84e1b]/20 hover:bg-[#e84e1b]/40 transition-all border border-[#e84e1b]/30"
            >
              <span className="font-medium text-sm">
                Lancer le mode &#34;Salons&#34;
              </span>
              <Image
                src="/icons/salons.webp"
                alt="Mode Salon"
                width={18}
                height={18}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
            </Link>

            {isLoading ? (
              <div className="p-2.5 rounded-xl border border-(--border-color) bg-amber-500/20 hover:bg-amber-500/40">
                <Skeleton className="h-5 w-full bg-white/10" />
              </div>
            ) : (
              isAdmin && (
                <button
                  onClick={handleSyncFull}
                  disabled={isSyncingFull}
                  className="cursor-pointer group flex items-center justify-between p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 transition-all border border-amber-400/30 text-left disabled:opacity-50"
                >
                  <span className="font-medium text-sm">
                    {isSyncingFull
                      ? "Synchro complète en cours..."
                      : "Forcer la synchronisation complète (si une longue période de coupure est survenue)"}
                  </span>
                  <Image
                    src="/icons/dangerSync.webp"
                    alt="Sync"
                    width={18}
                    height={18}
                    className="object-contain brightness-0 invert shrink-0"
                    unoptimized
                  />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
