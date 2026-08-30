"use client";

import Image from "next/image";
import { useTheme } from "../contexts/ThemeContext";
import RefreshButton from "./RefreshButton";
import { PageActionsProps } from "../types";

export default function PageActions({
  showLogs = false,
  showSettings = false,
  showForm = false,
  onRefresh,
  onToggleForm,
  onToggleSettings,
  onToggleLogs,
  showNew = false,
  isNewOpen = false,
  onToggleNew,
  newLabel = "Nouveau",
}: PageActionsProps) {
  const { t } = useTheme();

  if (showNew || onToggleNew) {
    return (
      <div className="flex gap-2 items-center">
        {onRefresh && <RefreshButton onRefresh={onRefresh} />}
        {onToggleNew && (
          <button
            onClick={onToggleNew}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src={isNewOpen ? "/icons/hide.webp" : "/icons/add.webp"}
              alt={newLabel}
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">
              {isNewOpen ? "Cacher" : newLabel}
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {showSettings ? (
        <>
          <button
            onClick={() => {
              if (onToggleSettings) onToggleSettings(false);
              if (onToggleLogs) onToggleLogs(false);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/back.webp"
              alt="Retour"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <button
            onClick={() => {
              if (onToggleSettings) onToggleSettings(false);
              if (onToggleLogs) onToggleLogs(true);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/history.webp"
              alt="Historique"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Historique</span>
          </button>
        </>
      ) : showLogs ? (
        <>
          {onRefresh && <RefreshButton onRefresh={onRefresh} />}
          <button
            onClick={() => {
              if (onToggleSettings) onToggleSettings(true);
              if (onToggleLogs) onToggleLogs(false);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/settings.webp"
              alt="Configuration"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Configuration</span>
          </button>
          <button
            onClick={() => {
              if (onToggleLogs) onToggleLogs(false);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/back.webp"
              alt="Retour"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Retour</span>
          </button>
        </>
      ) : (
        <>
          {onRefresh && <RefreshButton onRefresh={onRefresh} />}
          {onToggleForm && (
            <button
              onClick={onToggleForm}
              className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
            >
              <Image
                src={showForm ? "/icons/hide.webp" : "/icons/add.webp"}
                alt="Formulaire"
                width={16}
                height={16}
                className="object-contain brightness-0 invert shrink-0"
                unoptimized
              />
              <span className="hidden sm:inline">
                {showForm ? "Cacher" : "Nouvel utilisateur"}
              </span>
            </button>
          )}
          <button
            onClick={() => {
              if (onToggleSettings) onToggleSettings(true);
              if (onToggleLogs) onToggleLogs(false);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/settings.webp"
              alt="Configuration"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Configuration</span>
          </button>
          <button
            onClick={() => {
              if (onToggleLogs) onToggleLogs(true);
              if (onToggleSettings) onToggleSettings(false);
            }}
            className={`${t.btnGhost} flex items-center gap-2 cursor-pointer`}
          >
            <Image
              src="/icons/history.webp"
              alt="Historique"
              width={16}
              height={16}
              className="object-contain brightness-0 invert shrink-0"
              unoptimized
            />
            <span className="hidden sm:inline">Historique</span>
          </button>
        </>
      )}
    </div>
  );
}
