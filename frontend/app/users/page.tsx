"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "../services/userService";
import { auditLogService } from "../services/auditLogService";
import { CreateUserPayload, User, AuditLog } from "../types/index";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { usePagination } from "../hooks/usePagination";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import { useTheme } from "../contexts/ThemeContext";

export default function UsersPage() {
  const { t } = useTheme();
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
  } = useCrud<User, CreateUserPayload>(userService, {
    email: "",
    password_hash: "",
    first_name: "",
    last_name: "",
    role: "user",
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const {
    page: logPage,
    setPage: setLogPage,
    totalPages: logTotalPages,
    setTotalPages: setLogTotalPages,
  } = usePagination(1, 1);
  const [showLogs, setShowLogs] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    searchQuery: userSearchQuery,
    setSearchQuery: setUserSearchQuery,
    filteredData: filteredUsers,
  } = useSearch(users, (u, query) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const role = (u.role || "").toLowerCase();
    return (
      fullName.includes(query) || email.includes(query) || role.includes(query)
    );
  });

  const {
    searchQuery: logSearchQuery,
    setSearchQuery: setLogSearchQuery,
    filteredData: filteredLogs,
  } = useSearch(logs, (l, query) => {
    const userName = (l.user_name || "").toLowerCase();
    const userEmail = (l.user_email || "").toLowerCase();
    const action = (l.action || "").toLowerCase();
    const resource = (l.resource || "").toLowerCase();
    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      action.includes(query) ||
      resource.includes(query)
    );
  });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await auditLogService.getLogs(logPage, 20);
      setLogs(res.data);
      setLogTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erreur logs", err);
    }
  }, [logPage, setLogTotalPages]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatAction = (action: string) => {
    switch (action) {
      case "CREATE":
        return (
          <span className="text-emerald-400 font-bold truncate">CRÉATION</span>
        );
      case "UPDATE":
        return (
          <span className="text-blue-400 font-bold truncate">MODIFICATION</span>
        );
      case "DELETE":
        return (
          <span className="text-red-400 font-bold truncate">SUPPRESSION</span>
        );
      default:
        return <span className="truncate">{action}</span>;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
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

      <PageHeader
        title={showLogs ? "Historique des actions" : "Utilisateurs"}
        description={
          showLogs
            ? "Consulter toutes les modifications effectuées sur le CRM"
            : "Administrez les accès à l'application et consultez les actions utilisateurs"
        }
      >
        <div className="flex gap-2">
          {showLogs ? (
            <button onClick={fetchLogs} className={t.btnGhost}>
              Actualiser
            </button>
          ) : (
            <button
              onClick={() => setShowForm(!showForm)}
              className={t.btnGhost}
            >
              {showForm
                ? "Cacher le formulaire d'ajout"
                : "+ Nouvel utilisateur"}
            </button>
          )}
          <button onClick={() => setShowLogs(!showLogs)} className={t.btnGhost}>
            {showLogs ? "← Retour aux utilisateurs" : "Voir l'historique →"}
          </button>
        </div>
      </PageHeader>

      {!showLogs ? (
        <>
          {showForm && (
            <FormCard title="Nouvel utilisateur">
              <form
                onSubmit={(e) => create(e, createForm)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3"
              >
                <div>
                  <label className={`block text-xs mb-1 ${t.textMuted}`}>
                    Prénom
                  </label>
                  <input
                    type="text"
                    className={`${t.input} py-1.5 w-full`}
                    value={createForm.first_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${t.textMuted}`}>
                    Nom
                  </label>
                  <input
                    type="text"
                    className={`${t.input} py-1.5 w-full`}
                    value={createForm.last_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${t.textMuted}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`${t.input} py-1.5 w-full`}
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${t.textMuted}`}>
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className={`${t.input} py-1.5 w-full`}
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
                  <label className={`block text-xs mb-1 ${t.textMuted}`}>
                    Rôle
                  </label>
                  <select
                    className={`${t.input} py-1.5 w-full`}
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="lg:col-span-5 flex justify-end">
                  <button type="submit" className={t.btnPrimary}>
                    Ajouter l&apos;utilisateur
                  </button>
                </div>
              </form>
            </FormCard>
          )}

          <ScrollableTableCard>
            <table className="w-full text-left text-sm table-fixed min-w-175">
              <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
                <tr className="border-b border-slate-700">
                  <th className="px-3 py-3 font-semibold truncate">
                    Nom complet
                  </th>
                  <th className="px-3 py-3 font-semibold truncate">Email</th>
                  <th className="px-3 py-3 font-semibold truncate">Rôle</th>
                  <th className="px-3 py-3 font-semibold text-right w-52">
                    <input
                      type="text"
                      className={`${t.input} w-36 ml-auto py-1! text-xs! font-normal`}
                      placeholder="Rechercher..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={4} />
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    {" "}
                    <td
                      colSpan={4}
                      className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                    >
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`group border-b transition-colors ${t.tableRow}`}
                    >
                      <td className="px-3 py-3.5 truncate">
                        {editingId === u.id ? (
                          <div className="flex gap-2">
                            <input
                              className={`${t.input} py-1 px-2 w-full text-xs`}
                              value={editForm.first_name || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  first_name: e.target.value,
                                })
                              }
                            />
                            <input
                              className={`${t.input} py-1 px-2 w-full text-xs`}
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
                          <span
                            className="font-medium block truncate"
                            title={`${u.first_name} ${u.last_name}`}
                          >
                            {u.first_name} {u.last_name}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 truncate">
                        {editingId === u.id ? (
                          <input
                            className={`${t.input} py-1 px-2 text-xs w-full truncate`}
                            value={editForm.email || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span
                            className={`block truncate ${t.textMuted}`}
                            title={u.email}
                          >
                            {u.email}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 truncate">
                        <select
                          className={`${t.input} py-1 px-2 text-xs cursor-pointer w-full truncate`}
                          value={u.role}
                          onChange={(e) =>
                            updateWithUndo(u.id, { role: e.target.value })
                          }
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        {editingId === u.id ? (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() =>
                                updateWithUndo(u.id, {
                                  first_name: editForm.first_name,
                                  last_name: editForm.last_name,
                                  email: editForm.email,
                                })
                              }
                              className="text-green-400 hover:bg-green-500/10 px-2 py-1 rounded text-xs font-bold"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={`${t.textMuted} hover:bg-black/5 px-2 py-1 rounded text-xs`}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEdit(u)}
                              className="text-accent hover:bg-accent/10 px-2 py-1 rounded text-xs"
                            >
                              Corriger
                            </button>
                            <button
                              onClick={() => deleteWithUndo(u.id)}
                              className="text-red-400 hover:bg-red-500/10 px-2 py-1 rounded text-xs"
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
          </ScrollableTableCard>
        </>
      ) : (
        <ScrollableTableCard
          footer={
            logTotalPages > 1 && (
              <>
                <button
                  onClick={() => setLogPage(Math.max(1, logPage - 1))}
                  disabled={logPage === 1}
                  className={t.btnGhost + " text-xs py-1!"}
                >
                  &larr; Précédent
                </button>
                <span
                  className={`text-[10px] font-medium truncate ${t.textMuted}`}
                >
                  Page {logPage} sur {logTotalPages}
                </span>
                <button
                  onClick={() =>
                    setLogPage(Math.min(logTotalPages, logPage + 1))
                  }
                  disabled={logPage === logTotalPages}
                  className={t.btnGhost + " text-xs py-1!"}
                >
                  Suivant &rarr;
                </button>
              </>
            )
          }
        >
          <table className="w-full text-left text-xs table-fixed min-w-225">
            <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
              <tr className="border-b border-slate-700">
                <th className="px-3 py-3 font-semibold w-32 truncate">Date</th>
                <th className="px-3 py-3 font-semibold w-40 truncate">
                  Utilisateur
                </th>
                <th className="px-3 py-3 font-semibold w-32 truncate">
                  Action
                </th>
                <th className="px-3 py-3 font-semibold w-40 truncate">
                  Ressource
                </th>
                <th className="px-3 py-3 font-semibold text-right w-52">
                  <input
                    type="text"
                    className={`${t.input} w-36 ml-auto py-1! text-xs! font-normal`}
                    placeholder="Rechercher..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-b transition-colors ${t.tableRow}`}
                >
                  <td className={`px-3 py-3.5 truncate ${t.textMuted}`}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td
                    className="px-3 py-3.5 font-medium truncate"
                    title={`${log.user_name} - ${log.user_email}`}
                  >
                    <span className="block truncate">{log.user_name}</span>
                    <span
                      className={`text-[10px] font-normal block truncate ${t.textMuted}`}
                    >
                      {log.user_email}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 truncate">
                    {formatAction(log.action)}
                  </td>
                  <td
                    className="px-3 py-3.5 font-semibold truncate"
                    title={log.resource}
                  >
                    {log.resource}
                  </td>
                  <td className="px-3 py-3.5 text-right truncate">
                    <pre className="text-[10px] bg-slate-950 p-1.5 rounded border border-white/10 text-slate-300 ml-auto inline-block text-left truncate max-w-full">
                      {log.details
                        ? JSON.stringify(log.details, null, 2)
                        : "Aucun détail"}
                    </pre>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  {" "}
                  <td
                    colSpan={5}
                    className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                  >
                    Aucun log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollableTableCard>
      )}
    </div>
  );
}
