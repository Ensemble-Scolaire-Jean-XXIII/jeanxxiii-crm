"use client";

import Toast from "../components/Toast";
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

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <h1 className="text-3xl font-bold text-primary dark:text-white">
        Mon Profil
      </h1>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Prénom</label>
              <input
                type="text"
                className="input-field"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Nom</label>
              <input
                type="text"
                className="input-field"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label-text">Rôle</label>
            <input
              type="text"
              className="input-field bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white disabled:opacity-70"
              value={user?.role}
              disabled
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 my-4 pt-4">
            <h3 className="text-lg font-bold mb-2">
              Modifier le mot de passe (optionnel)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Nouveau mot de passe</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password_hash}
                  onChange={(e) =>
                    setFormData({ ...formData, password_hash: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label-text">Confirmer le mot de passe</label>
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

          <button type="submit" className="btn btn-primary w-full">
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
