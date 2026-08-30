"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { templateService } from "../services/templateService";
import { Column, CreateTemplatePayload, EmailTemplate } from "../types/index";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import PageActions from "../components/PageActions";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

function TemplatesContent() {
  const { t } = useTheme();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const {
    data: templates,
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
  } = useCrud<EmailTemplate, CreateTemplatePayload>(templateService, {
    name: "",
    subject: "",
    body: "",
  });

  const [showForm, setShowForm] = useState(
    searchParams.get("action") === "create",
  );

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
    filteredData: filteredTemplates,
  } = useSearch(templates, (tpl, query) => {
    const name = (tpl.name || "").toLowerCase();
    const subject = (tpl.subject || "").toLowerCase();
    const body = (tpl.body || "").toLowerCase();
    return (
      name.includes(query) || subject.includes(query) || body.includes(query)
    );
  });

  const columns: Column<EmailTemplate>[] = [
    {
      field: "name",
      label: "Template & Sujet",
      className: "w-1/4",
      render: (item) => (
        <div className="flex flex-col truncate w-full">
          <span className="font-medium block truncate" title={item.name}>
            {item.name}
          </span>
          <span
            className={`text-xs mt-1 block truncate ${t.textMuted}`}
            title={item.subject}
          >
            {item.subject}
          </span>
        </div>
      ),
      renderEdit: (form, update) => (
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            className={`${t.input} py-1 px-2 text-xs font-medium w-full`}
            value={form.name || ""}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Nom du template"
          />
          <input
            type="text"
            className={`${t.input} py-1 px-2 text-[10px] w-full`}
            value={form.subject || ""}
            onChange={(e) => update({ subject: e.target.value })}
            placeholder="Sujet"
          />
        </div>
      ),
    },
    {
      field: "body",
      label: "Contenu",
      render: (item) => (
        <p
          className={`text-xs line-clamp-3 whitespace-pre-wrap ${t.textMuted}`}
        >
          {item.body}
        </p>
      ),
      renderEdit: (form, update) => (
        <textarea
          className={`${t.input} py-2 px-3 min-h-40 text-xs w-full`}
          value={form.body || ""}
          onChange={(e) => update({ body: e.target.value })}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Templates d'email"
        description="Rédigez les emails qui seront distribués automatiquement"
      >
        <PageActions
          onRefresh={loadData}
          showNew={true}
          isNewOpen={showForm}
          onToggleNew={() => setShowForm(!showForm)}
          newLabel="Nouveau template"
        />
      </PageHeader>

      {showForm && (
        <FormCard title="Nouveau template">
          <form
            onSubmit={(e) => create(e, createForm)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs mb-1 ${t.textMuted}`}>
                  Nom du template
                </label>
                <input
                  type="text"
                  className={`${t.input} py-1.5`}
                  placeholder="Statut - Formation"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${t.textMuted}`}>
                  Sujet de l&apos;email
                </label>
                <input
                  type="text"
                  className={`${t.input} py-1.5`}
                  placeholder="Dernière relance suite à votre demande - Formation"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subject: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Contenu de l&apos;email
              </label>
              <textarea
                className={`${t.input} min-h-20 py-1.5`}
                value={createForm.body}
                placeholder="Bonjour {{civility}} {{first_name}} {{last_name}},"
                onChange={(e) =>
                  setCreateForm({ ...createForm, body: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className={t.btnPrimary}>
                Ajouter le template
              </button>
            </div>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <DataTable
          data={filteredTemplates}
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
          emptyMessage="Aucun template trouvé."
        />
      </ScrollableTableCard>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplatesContent />
    </Suspense>
  );
}
