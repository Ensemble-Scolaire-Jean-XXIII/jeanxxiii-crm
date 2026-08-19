"use client";

import { userService } from "../services/userService";
import { User } from "../types/index";
import Toast from "../components/Toast";
import { useCrud } from "../hooks/useCrud";

interface CreateUsersDTO {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function UsersPage() {
  const {
    data: users,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    createForm,
    setCreateForm,
    error,
    setError,
    success,
    setSuccess,
    handleCreate,
    handleDelete,
    handleUpdateField,
    startEdit,
    saveEdit,
  } = useCrud<User, CreateUsersDTO>(userService, {
    email: "",
    password_hash: "",
    first_name: "",
    last_name: "",
    role: "user",
  });

  const onSaveEdit = (id: string) => {
    saveEdit(id, (form) => {
      const payload = { ...form };
      delete (payload as { id?: string | number }).id;
      return payload;
    });
  };

  return (
    <div className="space-y-8">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <h1 className="text-3xl font-bold text-primary dark:text-white">
        Utilisateurs
      </h1>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Ajouter un utilisateur
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div>
            <label className="label-text">Prénom</label>
            <input
              type="text"
              className="input-field"
              value={createForm.first_name}
              onChange={(e) =>
                setCreateForm({ ...createForm, first_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="label-text">Nom</label>
            <input
              type="text"
              className="input-field"
              value={createForm.last_name}
              onChange={(e) =>
                setCreateForm({ ...createForm, last_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input
              type="email"
              className="input-field"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="label-text">Mot de passe</label>
            <input
              type="password"
              className="input-field"
              value={createForm.password_hash}
              onChange={(e) =>
                setCreateForm({ ...createForm, password_hash: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="label-text">Rôle</label>
            <select
              className="input-field"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm({ ...createForm, role: e.target.value })
              }
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="lg:col-span-5 flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">
              Créer
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="p-3 font-semibold">Nom complet</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Rôle</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="group border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="p-3">
                  {editingId === u.id ? (
                    <div className="flex gap-2">
                      <input
                        className="input-field py-1 px-2 w-28"
                        value={editForm.first_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            first_name: e.target.value,
                          })
                        }
                      />
                      <input
                        className="input-field py-1 px-2 w-28"
                        value={editForm.last_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <span className="font-medium">
                      {u.first_name} {u.last_name}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {editingId === u.id ? (
                    <input
                      className="input-field py-1 px-2"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  ) : (
                    <span className="text-slate-600 dark:text-slate-400">
                      {u.email}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <select
                    className="bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary rounded px-2 py-1 text-sm font-medium cursor-pointer outline-none transition-colors"
                    value={u.role}
                    onChange={(e) =>
                      handleUpdateField(u.id, "role", e.target.value)
                    }
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  {editingId === u.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSaveEdit(u.id)}
                        className="btn btn-ghost text-green-600 px-2 py-1 text-sm"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-ghost text-slate-500 px-2 py-1 text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startEdit(u)}
                        className="btn btn-ghost text-accent px-2 py-1 text-sm"
                      >
                        Corriger
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-ghost text-danger px-2 py-1 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
