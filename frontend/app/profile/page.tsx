"use client";

import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
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

  return (
    <div className="space-y-8">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Mon profil
        </h1>
        <p className="text-white/80 mt-1">Gérez vos paramètres de sécurité</p>
      </div>

      <div className="glass-card p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text mb-2 block">Prénom</label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <label className="label-text mb-2 block">Nom</label>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <label className="label-text mb-2 block">Email</label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <label className="label-text mb-2 block">Rôle</label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 my-4 pt-4 space-y-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div>
                <label className="label-text mb-2 block">
                  Ancien mot de passe
                </label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Prénom</label>
                <input
                  type="text"
                  className="input-field bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white disabled:opacity-70"
                  value={formData.first_name}
                  disabled
                />
              </div>
              <div>
                <label className="label-text">Nom</label>
                <input
                  type="text"
                  className="input-field bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white disabled:opacity-70"
                  value={formData.last_name}
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white disabled:opacity-70"
                value={formData.email}
                disabled
              />
            </div>
            <div>
              <label className="label-text">Rôle</label>
              <input
                type="text"
                className="input-field bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white disabled:opacity-70"
                value={user?.role || ""}
                disabled
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-4 pt-4">
              <h3 className="text-lg font-bold mb-4 text-white">
                Modifier le mot de passe
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label-text">Ancien mot de passe</label>
                  <input
                    type="password"
                    className="input-field"
                    value={
                      (formData as typeof formData & { old_password?: string })
                        .old_password || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        old_password: e.target.value,
                      } as typeof formData & { old_password: string })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="input-field"
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
                    <label className="label-text">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="input-field"
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
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Enregistrer les modifications
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
