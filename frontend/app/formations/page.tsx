"use client";

import { useState, useEffect } from "react";
import { formationService } from "../services/formationService";
import { Formation, CreateFormationPayload, Column } from "../types";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import PageActions from "../components/PageActions";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

export default function FormationsPage() {
  const { t } = useTheme();
  const { showToast } = useToast();
  const {
    data: formations,
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
  } = useCrud<Formation, CreateFormationPayload>(formationService, {
    name: "",
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
    filteredData: filteredFormations,
  } = useSearch(formations, (f, query) => {
    return (f.name || "").toLowerCase().includes(query);
  });

  const columns: Column<Formation>[] = [
    {
      field: "name",
      label: "Nom de la formation",
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
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Formations"
        description="Gérez les formations proposées par l'établissement"
      >
        <PageActions
          onRefresh={loadData}
          showNew={true}
          isNewOpen={showForm}
          onToggleNew={() => setShowForm(!showForm)}
          newLabel="Nouvelle formation"
        />
      </PageHeader>

      {showForm && (
        <FormCard title="Nouvelle formation">
          <form onSubmit={(e) => create(e, createForm)} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nom de la formation"
                className={`${t.input} py-1.5`}
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className={t.btnPrimary}>
              Ajouter la formation
            </button>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <DataTable
          data={filteredFormations}
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
          emptyMessage="Aucune formation enregistrée."
        />
      </ScrollableTableCard>
    </div>
  );
}
