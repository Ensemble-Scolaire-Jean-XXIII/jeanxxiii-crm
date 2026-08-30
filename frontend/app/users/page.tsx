"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { userService } from "../services/userService";
import { auditLogService } from "../services/auditLogService";
import { settingService } from "../services/settingService";
import { CreateUserPayload, User, AuditLog, Column } from "../types/index";
import { useCrud } from "../hooks/useCrud";
import { usePagination } from "../hooks/usePagination";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import PageActions from "../components/PageActions";

export default function UsersPage() {
  const { t } = useTheme();
  const { showToast } = useToast();
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
    loadData: fetchUsers,
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
  const [showSettings, setShowSettings] = useState(false);
  const [isResetEnabled, setIsResetEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingService.get("password_reset_enabled");
        setIsResetEnabled(res.enabled);
      } catch (err) {
        setIsResetEnabled(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleReset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsResetEnabled(checked);
    try {
      await settingService.update("password_reset_enabled", {
        enabled: checked,
      });
      showToast(
        checked ? "Réinitialisation activée" : "Réinitialisation désactivée",
        "success",
      );
    } catch (err) {
      setIsResetEnabled(!checked);
      showToast("Erreur lors de la modification", "error");
    }
  };

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

  useEffect(() => {
    if (undoAction) {
      showToast(
        undoAction.message,
        "undo",
        undoAction.duration,
        undoAction.onUndo,
      );
      setUndoAction(null);
    }
  }, [undoAction, showToast, setUndoAction]);

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
      setLogs([]);
    }
  }, [logPage, setLogTotalPages]);

  useEffect(() => {
    if (showLogs) {
      fetchLogs();
    }
  }, [showLogs, fetchLogs]);

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

  const userColumns: Column<User>[] = [
    {
      field: "name",
      label: "Nom complet",
      render: (item) => (
        <span
          className="font-medium block truncate"
          title={`${item.first_name} ${item.last_name}`}
        >
          {item.first_name} {item.last_name}
        </span>
      ),
      renderEdit: (form, update) => (
        <div className="flex gap-2">
          <input
            type="text"
            className={`${t.input} py-1 px-2 w-full text-xs`}
            value={form.first_name || ""}
            onChange={(e) => update({ first_name: e.target.value })}
            placeholder="Prénom"
          />
          <input
            type="text"
            className={`${t.input} py-1 px-2 w-full text-xs`}
            value={form.last_name || ""}
            onChange={(e) => update({ last_name: e.target.value })}
            placeholder="Nom"
          />
        </div>
      ),
    },
    {
      field: "email",
      label: "Email",
      render: (item) => (
        <span className={`block truncate ${t.textMuted}`} title={item.email}>
          {item.email}
        </span>
      ),
      renderEdit: (form, update) => (
        <input
          type="email"
          className={`${t.input} py-1 px-2 text-xs w-full truncate`}
          value={form.email || ""}
          onChange={(e) => update({ email: e.target.value })}
        />
      ),
    },
    {
      field: "role",
      label: "Rôle",
      render: (item) => (
        <span>{item.role === "admin" ? "Administrateur" : "Utilisateur"}</span>
      ),
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1 px-2 text-xs cursor-pointer w-full truncate`}
          value={form.role || "user"}
          onChange={(e) => update({ role: e.target.value })}
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>
      ),
    },
  ];

  const logColumns: Column<AuditLog>[] = [
    {
      field: "created_at",
      label: "Date",
      className: "w-48",
      render: (item) => (
        <span className={`block truncate ${t.textMuted}`}>
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      field: "user_name",
      label: "Utilisateur",
      className: "w-44",
      render: (item) => (
        <div
          className="truncate"
          title={`${item.user_name} - ${item.user_email}`}
        >
          <span className="block truncate font-medium">{item.user_name}</span>
          <span className={`text-[10px] block truncate ${t.textMuted}`}>
            {item.user_email}
          </span>
        </div>
      ),
    },
    {
      field: "action",
      label: "Action",
      className: "w-32",
      render: (item) => formatAction(item.action),
    },
    {
      field: "resource",
      label: "Ressource",
      className: "w-40",
      render: (item) => (
        <span className="font-semibold block truncate" title={item.resource}>
          {item.resource}
        </span>
      ),
    },
    {
      field: "details",
      label: "Détails",
      render: (item) => (
        <div className="bg-slate-950 p-1.5 rounded border border-white/15 overflow-auto max-h-24 custom-scrollbar text-left w-full">
          <pre className="text-[10px] text-slate-300 inline-block">
            {item.details
              ? JSON.stringify(item.details, null, 2)
              : "Aucun détail"}
          </pre>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title={
          showLogs
            ? "Historique des actions"
            : showSettings
              ? "Configuration Système"
              : "Utilisateurs"
        }
        description={
          showLogs
            ? "Consulter toutes les modifications effectuées sur le CRM"
            : showSettings
              ? "Paramétrez les options globales de l'application"
              : "Administrez les accès à l'application et parametrez les actions utilisateurs"
        }
      >
        <PageActions
          showLogs={showLogs}
          showSettings={showSettings}
          showForm={showForm}
          onRefresh={showLogs ? fetchLogs : fetchUsers}
          onToggleForm={() => {
            setShowForm(!showForm);
            setShowSettings(false);
          }}
          onToggleSettings={setShowSettings}
          onToggleLogs={setShowLogs}
          newLabel="Nouvel utilisateur"
        />
      </PageHeader>

      {showSettings ? (
        <FormCard title="Configuration Système">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isResetEnabled}
                onChange={handleToggleReset}
              />
              <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className={`text-sm font-medium ${t.textMuted}`}>
              Autoriser les utilisateurs à demander une réinitialisation de mot
              de passe depuis la page de connexion
            </span>
          </div>
        </FormCard>
      ) : showLogs ? (
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
          <DataTable
            data={filteredLogs}
            columns={logColumns}
            keyExtractor={(item) => item.id}
            editingId={null}
            editForm={{}}
            setEditForm={() => {}}
            onEdit={() => {}}
            onSave={() => {}}
            onCancel={() => {}}
            onDelete={() => {}}
            searchQuery={logSearchQuery}
            onSearchChange={setLogSearchQuery}
            searchPlaceholder="Rechercher..."
            hideActions={true}
            emptyMessage="Aucun log ne correspond à votre recherche."
          />
        </ScrollableTableCard>
      ) : (
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
            <DataTable
              data={filteredUsers}
              columns={userColumns}
              keyExtractor={(item) => item.id}
              editingId={editingId}
              editForm={editForm}
              setEditForm={setEditForm}
              onEdit={startEdit}
              onSave={updateWithUndo}
              onCancel={() => setEditingId(null)}
              onDelete={deleteWithUndo}
              searchQuery={userSearchQuery}
              onSearchChange={setUserSearchQuery}
              isLoading={isLoading}
              emptyMessage="Aucun utilisateur trouvé."
            />
          </ScrollableTableCard>
        </>
      )}
    </div>
  );
}
