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
  CreateAutomationDTO,
  EmailAutomationRule,
} from "../types";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";

export default function AutomationsPage() {
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
  } = useCrud<EmailAutomationRule, CreateAutomationDTO>(automationService, {
    status_id: "",
    formation_id: null,
    email_template_id: "",
    trigger_type: "STATUS_CHANGE",
    scheduled_date: null,
  });

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);

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
          setCreateForm((prev: CreateAutomationDTO) => ({
            ...prev,
            status_id: sData[0].id,
          }));
        }
        if (!createForm.email_template_id && tData.length > 0) {
          setCreateForm((prev: CreateAutomationDTO) => ({
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
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.replace("T", " ") + ":00";
    }

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
    <div className="space-y-8">
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-white">
          Automatisation des Emails
        </h1>
        <p className="text-white/80 mt-1">
          Gérez les règles d&rsquo;envoies automatique d&rsquo;emails
        </p>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Nouvelle règle / Campagne
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="label-text">Type de déclencheur</label>
            <select
              className="input-field"
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
              <option value="SCHEDULED_DATE">Date programmée (Campagne)</option>
            </select>
          </div>

          {createForm.trigger_type === "STATUS_CHANGE" && (
            <div>
              <label className="label-text">Statut déclencheur</label>
              <select
                className="input-field"
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
              <label className="label-text">Date et Heure d&apos;envoi</label>
              <input
                type="datetime-local"
                className="input-field"
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
            <label className="label-text">Formation (Cible)</label>
            <select
              className="input-field"
              value={createForm.formation_id?.toString() || ""}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
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
          </div>

          <div>
            <label className="label-text">Template d&apos;email</label>
            <select
              className="input-field"
              value={createForm.email_template_id}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  email_template_id: e.target.value,
                })
              }
              required
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">
              {createForm.trigger_type === "SCHEDULED_DATE"
                ? "Planifier la campagne"
                : "Ajouter la règle"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="p-3 font-semibold">Déclencheur (Statut / Date)</th>
              <th className="p-3 font-semibold">Formation Cible</th>
              <th className="p-3 font-semibold">Template d&apos;email</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="h-8 w-16 inline-block" />
                  </td>
                </tr>
              ))
            ) : automations.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  Aucune règle d&apos;automatisation trouvée.
                </td>
              </tr>
            ) : (
              automations.map((rule) => (
                <tr
                  key={rule.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3">
                    {rule.trigger_type === "STATUS_CHANGE" ? (
                      <select
                        className="input-field py-1 px-2 text-xs sm:text-sm cursor-pointer w-full"
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
                        className="input-field py-1 px-2 text-xs sm:text-sm w-full"
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

                  <td className="p-3">
                    <select
                      className="input-field py-1 px-2 text-xs sm:text-sm cursor-pointer w-full"
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

                  <td className="p-3">
                    <select
                      className="input-field py-1 px-2 text-xs sm:text-sm cursor-pointer w-full"
                      value={rule.email_template_id}
                      onChange={(e) =>
                        updateWithUndo(rule.id, {
                          email_template_id: e.target.value,
                        })
                      }
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteWithUndo(rule.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-ghost text-red-400 px-2 py-1 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
