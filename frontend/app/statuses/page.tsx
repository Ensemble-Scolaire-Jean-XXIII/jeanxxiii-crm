"use client";

import { useState, useEffect } from "react";
import { statusService } from "../services/statusService";
import { Column, CreateStatusPayload, Status } from "../types";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import PageActions from "../components/PageActions";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

export default function StatusesPage() {
  const { t } = useTheme();
  const { showToast } = useToast();
  const {
    data: statuses,
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
    loadData,
  } = useCrud<Status, CreateStatusPayload>(statusService, {
    name: "",
    is_custom: true,
  });

  const [showForm, setShowForm] = useState(false);

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
    searchQuery,
    setSearchQuery,
    filteredData: filteredStatuses,
  } = useSearch(statuses, (s, query) => {
    const name = (s.name || "").toLowerCase();
    const type = s.is_custom ? "personnalisé" : "système";
    return name.includes(query) || type.includes(query);
  });

  const columns: Column<Status>[] = [
    {
      field: "name",
      label: "Nom du statut",
      render: (item) => (
        <span className="font-medium block truncate" title={item.name}>
          {item.name}
        </span>
      ),
      renderEdit: (form, update) => (
        <input
          type="text"
          className={`${t.input} py-1 px-2 w-full text-xs`}
          value={form.name || ""}
          onChange={(e) => update({ name: e.target.value })}
        />
      ),
    },
    {
      field: "type",
      label: "Type",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-medium ${item.is_custom ? "bg-white/10 text-slate-300" : "bg-primary/20 text-primary"}`}
        >
          {item.is_custom ? "Personnalisé" : "Système"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Statuts"
        description="Gérez les status à attribuer à vos prospects"
      >
        <PageActions
          onRefresh={loadData}
          showNew={true}
          isNewOpen={showForm}
          onToggleNew={() => setShowForm(!showForm)}
          newLabel="Nouveau statut"
        />
      </PageHeader>

      {showForm && (
        <FormCard title="Nouveau statut">
          <form onSubmit={(e) => create(e, createForm)} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nom du statut"
                className={`${t.input} py-1.5`}
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className={t.btnPrimary}>
              Ajouter le statut
            </button>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <DataTable
          data={filteredStatuses}
          columns={columns}
          keyExtractor={(item) => item.id}
          editingId={editingId}
          editForm={editForm}
          setEditForm={setEditForm}
          onEdit={startEdit}
          onSave={updateWithUndo}
          onCancel={() => setEditingId(null)}
          onDelete={deleteWithUndo}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          emptyMessage="Aucun statut trouvé."
        />
      </ScrollableTableCard>
    </div>
  );
}
