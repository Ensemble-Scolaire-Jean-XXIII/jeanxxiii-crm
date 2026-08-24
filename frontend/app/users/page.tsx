"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "../services/userService";
import { auditLogService } from "../services/auditLogService";
import { CreateUsersDTO, User, AuditLog } from "../types/index";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";

export default function UsersPage() {
  const {
    data: users,
    isLoading,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    createForm,
    setCreateForm,
    undoAction,
    error,
    setError,
    success,
    setSuccess,
    setUndoAction,
    startEdit,
    create,
    updateWithUndo,
    deleteWithUndo,
  } = useCrud<User, CreateUsersDTO>(userService, {
    email: "",
    password_hash: "",
    first_name: "",
    last_name: "",
    role: "user",
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await auditLogService.getLogs(logPage, 20);
      setLogs(res.data);
      setLogTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erreur de récupération des logs", err);
    }
  }, [logPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatAction = (action: string) => {
    switch (action) {
      case "CREATE":
        return <span className="text-emerald-400 font-bold">CRÉATION</span>;
      case "UPDATE":
        return <span className="text-blue-400 font-bold">MODIFICATION</span>;
      case "DELETE":
        return <span className="text-red-400 font-bold">SUPPRESSION</span>;
      default:
        return <span>{action}</span>;
    }
  };

  return (
    <div className="space-y-12">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      {undoAction && (
        <Toast
          message={undoAction.message}
          type="undo"
          duration={undoAction.duration}
          onClose={() => setUndoAction(null)}
          onUndo={undoAction.onUndo}
        />
      )}

      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            Utilisateurs
          </h1>
          <p className="text-white/80 mt-1">
            Administrez les accès à l&rsquo;application et consultez les actions
            utilisateurs
          </p>
        </div>

        <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary dark:text-white">
              Ajouter un utilisateur
            </h2>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
              Nouveau
            </span>
          </div>

          <form
            onSubmit={(e) => create(e, createForm)}
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
                  setCreateForm({
                    ...createForm,
                    password_hash: e.target.value,
                  })
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

        <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
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
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="p-3">
                      <Skeleton className="h-8 w-40" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-8 w-48" />
                    </td>
                    <td className="p-3">
                      <Skeleton className="h-8 w-24" />
                    </td>
                    <td className="p-3 text-right">
                      <Skeleton className="h-8 w-24 inline-block" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors"
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
                        <span className="font-medium text-white">
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
                        <span className="text-slate-300">{u.email}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        className="input-field py-1! px-2! text-sm cursor-pointer w-full sm:w-auto"
                        value={u.role}
                        onChange={(e) =>
                          updateWithUndo(u.id, { role: e.target.value })
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
                            onClick={() =>
                              updateWithUndo(u.id, {
                                first_name: editForm.first_name,
                                last_name: editForm.last_name,
                                email: editForm.email,
                              })
                            }
                            className="btn btn-ghost text-green-400 px-2 py-1 text-sm font-bold"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-ghost text-slate-400 px-2 py-1 text-sm"
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
                            onClick={() => deleteWithUndo(u.id)}
                            className="btn btn-ghost text-red-400 px-2 py-1 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Historique des actions (Logs)
            </h2>
            <p className="text-white/80 mt-1 text-sm">
              Trace de toutes les modifications effectuées sur le CRM
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="btn btn-ghost text-white text-sm"
          >
            Actualiser
          </button>
        </div>

        <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Utilisateur</th>
                  <th className="p-3 font-semibold">Action</th>
                  <th className="p-3 font-semibold">Ressource</th>
                  <th className="p-3 font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-white">
                      {log.user_name} <br />
                      <span className="text-xs text-slate-400 font-normal">
                        {log.user_email}
                      </span>
                    </td>
                    <td className="p-3">{formatAction(log.action)}</td>
                    <td className="p-3 font-semibold text-slate-300">
                      {log.resource}
                    </td>
                    <td className="p-3">
                      <pre className="text-[10px] bg-slate-950 p-2 rounded border border-white/10 max-w-xs overflow-x-auto text-slate-300">
                        {log.details
                          ? JSON.stringify(log.details, null, 2)
                          : "Aucun détail"}
                      </pre>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      Aucun log enregistré pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logTotalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="btn btn-ghost text-sm disabled:opacity-50"
              >
                &larr; Précédent
              </button>
              <span className="text-sm font-medium text-slate-300">
                Page {logPage} sur {logTotalPages}
              </span>
              <button
                onClick={() =>
                  setLogPage((p) => Math.min(logTotalPages, p + 1))
                }
                disabled={logPage === logTotalPages}
                className="btn btn-ghost text-sm disabled:opacity-50"
              >
                Suivant &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
