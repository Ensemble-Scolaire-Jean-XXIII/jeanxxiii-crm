"use client";

import Skeleton from "../components/Skeleton";
import { useProfile } from "../hooks/useProfile";
import PageHeader from "../components/PageHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useEffect } from "react";

export default function ProfilePage() {
  const { t, themeName, setThemeName } = useTheme();
  const { showToast } = useToast();
  const {
    user,
    formData,
    setFormData,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    handleUpdate,
  } = useProfile();

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError("");
    }
  }, [error, showToast, setError]);

  useEffect(() => {
    if (success) {
      showToast(success, "success");
      setSuccess("");
    }
  }, [success, showToast, setSuccess]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Mon profil"
        description="Gérez vos paramètres et préférences d'affichage"
      />

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className={`${t.card} flex flex-col gap-4`}>
          <h3 className="text-lg font-bold text-(--text-main)">
            Informations personnelles
          </h3>
          <div>
            <label className="label-text">Prénom</label>
            {isLoading ? (
              <Skeleton className="h-9.5 w-full" />
            ) : (
              <input
                type="text"
                className={`${t.input} opacity-70 cursor-not-allowed`}
                value={formData.first_name}
                disabled
              />
            )}
          </div>
          <div>
            <label className="label-text">Nom</label>
            {isLoading ? (
              <Skeleton className="h-9.5 w-full" />
            ) : (
              <input
                type="text"
                className={`${t.input} opacity-70 cursor-not-allowed`}
                value={formData.last_name}
                disabled
              />
            )}
          </div>
          <div>
            <label className="label-text">Email</label>
            {isLoading ? (
              <Skeleton className="h-9.5full" />
            ) : (
              <input
                type="email"
                className={`${t.input} opacity-70 cursor-not-allowed`}
                value={formData.email}
                disabled
              />
            )}
          </div>
          <div>
            <label className="label-text">Rôle</label>
            {isLoading ? (
              <Skeleton className="h-9.5 w-full" />
            ) : (
              <input
                type="text"
                className={`${t.input} opacity-70 cursor-not-allowed`}
                value={user?.role || ""}
                disabled
              />
            )}
          </div>
        </div>

        <div className={`${t.card} flex flex-col justify-between gap-4`}>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-(--text-main)">Sécurité</h3>
            <div>
              <label className="label-text">Ancien mot de passe</label>
              <input
                type="password"
                className={t.input}
                value={(formData as any).old_password || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    old_password: e.target.value,
                  } as any)
                }
                required
              />
            </div>
            <div>
              <label className="label-text">Nouveau mot de passe</label>
              <input
                type="password"
                className={t.input}
                value={formData.password_hash}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_hash: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="label-text">Confirmer le mot de passe</label>
              <input
                type="password"
                className={t.input}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-(--border-color)">
            <button type="submit" className={t.btnPrimary + " w-full"}>
              Enregistrer les modifications
            </button>
          </div>
        </div>
        <div className={`${t.card} shadow-sm flex flex-col gap-4`}>
          <div>
            <h3 className="text-lg font-bold mb-3 text-(--text-main)">
              Apparence
            </h3>
            <label className="label-text">Thème de l&apos;application</label>
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value as any)}
              className={`${t.input} cursor-pointer`}
            >
              <option value="shadowIslands" className="bg-slate-900 text-white">
                Shadow Islands
              </option>
              <option value="glass" className="bg-slate-900 text-white">
                Glass
              </option>
              <option value="institution" className="bg-slate-900 text-white">
                Jean 23
              </option>
              <option value="solid" className="bg-slate-900 text-white">
                Solid
              </option>
            </select>
            <p className={`text-xs mt-2 ${t.textMuted}`}>
              Modifie l&apos;apparence globale instantanément.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
