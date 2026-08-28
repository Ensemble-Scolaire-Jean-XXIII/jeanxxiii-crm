"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { automationService } from "../services/automationService";
import { statusService } from "../services/statusService";
import { templateService } from "../services/templateService";
import { formationService } from "../services/formationService";
import {
  Status,
  EmailTemplate,
  Formation,
  CreateAutomationPayload,
  EmailAutomationRule,
  Column,
} from "../types";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

function AutomationsContent() {
  const { t } = useTheme();
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const {
    data: automations,
    isLoading,
    error,
    success,
    editingId,
    editForm,
    createForm,
    undoAction,
    setError,
    setSuccess,
    setEditingId,
    setEditForm,
    setCreateForm,
    setUndoAction,
    startEdit,
    create,
    updateWithUndo,
    deleteWithUndo,
  } = useCrud<EmailAutomationRule, CreateAutomationPayload>(automationService, {
    status_id: "",
    formation_id: null,
    email_template_id: "",
    trigger_type: "STATUS_CHANGE",
    scheduled_date: null,
  });

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
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
    filteredData: filteredAutomations,
  } = useSearch(automations, (rule, query) => {
    const trigger = (rule.trigger_type || "").toLowerCase();
    const statusObj = statuses.find((s) => s.id === rule.status_id);
    const statusName = (statusObj?.name || "").toLowerCase();
    const formationObj = formations.find((f) => f.id === rule.formation_id);
    const formationName = (formationObj?.name || "").toLowerCase();
    const templateObj = templates.find((t) => t.id === rule.email_template_id);
    const templateName = (templateObj?.name || "").toLowerCase();
    const dateStr = (rule.scheduled_date || "").toLowerCase();

    return (
      trigger.includes(query) ||
      statusName.includes(query) ||
      formationName.includes(query) ||
      templateName.includes(query) ||
      dateStr.includes(query)
    );
  });

  useEffect(() => {
    const fetchSecondaryData = async () => {
      try {
        const [sData, tData, fData] = await Promise.all([
          statusService.getAll(),
          templateService.getAll(),
          formationService.getAll(),
        ]);
        setStatuses(sData);
        setTemplates(tData);
        setFormations(fData);

        if (
          !createForm.status_id &&
          sData.length > 0 &&
          createForm.trigger_type === "STATUS_CHANGE"
        ) {
          setCreateForm((prev: CreateAutomationPayload) => ({
            ...prev,
            status_id: sData[0].id,
          }));
        }
        if (!createForm.email_template_id && tData.length > 0) {
          setCreateForm((prev: CreateAutomationPayload) => ({
            ...prev,
            email_template_id: tData[0].id,
          }));
        }
      } catch {
        setError("Erreur lors du chargement des données secondaires");
      }
    };
    fetchSecondaryData();
  }, [
    setError,
    setCreateForm,
    createForm.status_id,
    createForm.email_template_id,
    createForm.trigger_type,
  ]);

  const handleCreate = (e: React.FormEvent) => {
    let formattedDate = createForm.scheduled_date;
    if (formattedDate && formattedDate.includes("T"))
      formattedDate = formattedDate.replace("T", " ") + ":00";
    const payload = {
      ...createForm,
      status_id:
        createForm.trigger_type === "STATUS_CHANGE"
          ? createForm.status_id
          : null,
      scheduled_date:
        createForm.trigger_type === "SCHEDULED_DATE" ? formattedDate : null,
    };
    create(e, payload);
  };

  const columns: Column<EmailAutomationRule>[] = [
    {
      field: "trigger",
      label: "Déclencheur (Statut / Date)",
      render: (item) => {
        if (item.trigger_type === "STATUS_CHANGE") {
          const status = statuses.find((s) => s.id === item.status_id);
          return <span>{status?.name || "Inconnu"}</span>;
        }
        return (
          <span>
            {item.scheduled_date
              ? new Date(item.scheduled_date).toLocaleString()
              : "Aucune date"}
          </span>
        );
      },
      renderEdit: (form, update) => {
        if (form.trigger_type === "STATUS_CHANGE") {
          return (
            <select
              className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
              value={form.status_id ?? ""}
              onChange={(e) =>
                update({
                  status_id: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="datetime-local"
            className={`${t.input} py-1 px-2 text-xs sm:text-sm w-full truncate`}
            value={
              form.scheduled_date
                ? new Date(form.scheduled_date)
                    .toLocaleString("sv")
                    .slice(0, 16)
                    .replace(" ", "T")
                : ""
            }
            onChange={(e) =>
              update({
                scheduled_date: e.target.value
                  ? e.target.value.replace("T", " ") + ":00"
                  : null,
              })
            }
          />
        );
      },
    },
    {
      field: "formation",
      label: "Formation Cible",
      render: (item) => {
        const formation = formations.find((f) => f.id === item.formation_id);
        return <span>{formation?.name || "Toutes les formations"}</span>;
      },
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
          value={form.formation_id ?? ""}
          onChange={(e) =>
            update({
              formation_id: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">-- Toutes les formations --</option>
          {formations.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      field: "template",
      label: "Template d'email",
      render: (item) => {
        const template = templates.find((t) => t.id === item.email_template_id);
        return <span>{template?.name || "Inconnu"}</span>;
      },
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
          value={form.email_template_id || ""}
          onChange={(e) => update({ email_template_id: e.target.value })}
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Automatisation des Emails"
        description="Gérez les règles d'envois automatiques d'emails"
      >
        <button onClick={() => setShowForm(!showForm)} className={t.btnGhost}>
          {showForm ? "Cacher le formulaire d'ajout" : "+ Nouvelle règle"}
        </button>
      </PageHeader>

      {showForm && (
        <FormCard title="Nouvelle règle / Campagne">
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Type de déclencheur
              </label>
              <select
                className={`${t.input} w-full truncate`}
                value={createForm.trigger_type}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    trigger_type: e.target.value,
                    status_id:
                      e.target.value === "STATUS_CHANGE" && statuses.length > 0
                        ? statuses[0].id
                        : "",
                  })
                }
              >
                <option value="STATUS_CHANGE">Changement de statut</option>
                <option value="SCHEDULED_DATE">
                  Date programmée (Campagne)
                </option>
              </select>
            </div>
            {createForm.trigger_type === "STATUS_CHANGE" && (
              <div>
                <label className={`block text-xs mb-1 ${t.textMuted}`}>
                  Statut déclencheur
                </label>
                <select
                  className={`${t.input} w-full truncate`}
                  value={
                    createForm.status_id === null ? "" : createForm.status_id
                  }
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      status_id: Number(e.target.value),
                    })
                  }
                  required
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {createForm.trigger_type === "SCHEDULED_DATE" && (
              <div>
                <label className={`block text-xs mb-1 ${t.textMuted}`}>
                  Date et Heure d&apos;envoi
                </label>
                <input
                  type="datetime-local"
                  className={`${t.input} w-full`}
                  value={createForm.scheduled_date || ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      scheduled_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}
            <div>
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Formation (Cible)
              </label>
              <select
                className={`${t.input} w-full truncate`}
                value={createForm.formation_id?.toString() || ""}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    formation_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              >
                <option value="">-- Toutes les formations --</option>
                {formations.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Template d&apos;email
              </label>
              <select
                className={`${t.input} w-full truncate`}
                value={createForm.email_template_id}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    email_template_id: e.target.value,
                  })
                }
                required
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end mt-2">
              <button type="submit" className={t.btnPrimary}>
                {createForm.trigger_type === "SCHEDULED_DATE"
                  ? "Planifier la campagne"
                  : "Ajouter la règle"}
              </button>
            </div>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <DataTable
          data={filteredAutomations}
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
          emptyMessage="Aucune règle d'automatisation trouvée."
        />
      </ScrollableTableCard>
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense>
      <AutomationsContent />
    </Suspense>
  );
}
