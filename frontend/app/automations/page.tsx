"use client";

import { useEffect, useState } from "react";
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
} from "../types";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import { useTheme } from "../contexts/ThemeContext";

export default function AutomationsPage() {
  const { t } = useTheme();
  const {
    data: automations,
    isLoading,
    error,
    success,
    createForm,
    undoAction,
    setError,
    setSuccess,
    setCreateForm,
    setUndoAction,
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
  const [showForm, setShowForm] = useState(false);

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
        <table className="w-full text-left text-sm table-fixed min-w-200">
          <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
            <tr className="border-b border-slate-700">
              <th className="px-3 py-3 font-semibold truncate">
                Déclencheur (Statut / Date)
              </th>
              <th className="px-3 py-3 font-semibold truncate">
                Formation Cible
              </th>
              <th className="px-3 py-3 font-semibold truncate">
                Template d&apos;email
              </th>
              <th className="px-3 py-3 font-semibold text-right w-52">
                <input
                  type="text"
                  className={`${t.input} w-48 ml-auto py-1! text-xs! font-normal`}
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton columns={4} />
            ) : filteredAutomations.length === 0 ? (
              <tr>
                {" "}
                <td
                  colSpan={4}
                  className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                >
                  Aucune règle d&apos;automatisation trouvée.
                </td>
              </tr>
            ) : (
              filteredAutomations.map((rule) => (
                <tr
                  key={rule.id}
                  className={`group border-b transition-colors ${t.tableRow}`}
                >
                  <td className="px-3 py-3.5 truncate">
                    {rule.trigger_type === "STATUS_CHANGE" ? (
                      <select
                        className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
                        value={rule.status_id ?? ""}
                        onChange={(e) =>
                          updateWithUndo(rule.id, {
                            status_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="datetime-local"
                        className={`${t.input} py-1 px-2 text-xs sm:text-sm w-full truncate`}
                        value={
                          rule.scheduled_date
                            ? new Date(rule.scheduled_date)
                                .toLocaleString("sv")
                                .slice(0, 16)
                                .replace(" ", "T")
                            : ""
                        }
                        onChange={(e) =>
                          updateWithUndo(rule.id, {
                            scheduled_date: e.target.value
                              ? e.target.value.replace("T", " ") + ":00"
                              : null,
                          })
                        }
                      />
                    )}
                  </td>
                  <td className="px-3 py-3.5 truncate">
                    <select
                      className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
                      value={rule.formation_id ?? ""}
                      onChange={(e) =>
                        updateWithUndo(rule.id, {
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
                  </td>
                  <td className="px-3 py-3.5 truncate">
                    <select
                      className={`${t.input} py-1 px-2 text-xs sm:text-sm cursor-pointer w-full truncate`}
                      value={rule.email_template_id}
                      onChange={(e) =>
                        updateWithUndo(rule.id, {
                          email_template_id: e.target.value,
                        })
                      }
                    >
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <button
                      onClick={() => deleteWithUndo(rule.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTableCard>
    </div>
  );
}
