"use client";

import { useState } from "react";
import { templateService } from "../services/templateService";
import { CreateTemplatePayload, EmailTemplate } from "../types/index";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import { useTheme } from "../contexts/ThemeContext";

export default function TemplatesPage() {
  const { t } = useTheme();
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
  } = useCrud<EmailTemplate, CreateTemplatePayload>(templateService, {
    name: "",
    subject: "",
    body: "",
  });

  const [showForm, setShowForm] = useState(false);

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
        title="Templates d'email"
        description="Rédigez les emails qui seront distribués automatiquement"
      >
        <button onClick={() => setShowForm(!showForm)} className={t.btnGhost}>
          {showForm ? "Cacher le formulaire d'ajout" : "+ Nouveau template"}
        </button>
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
        <table className="w-full text-left text-sm table-fixed min-w-200">
          <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
            <tr className="border-b border-slate-700">
              <th className="px-3 py-3 font-semibold w-1/4 truncate">
                Template & Sujet
              </th>
              <th className="px-3 py-3 font-semibold truncate">Contenu</th>
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
              <TableSkeleton columns={3} />
            ) : filteredTemplates.length === 0 ? (
              <tr>
                {" "}
                <td
                  colSpan={3}
                  className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                >
                  Aucun template trouvé.
                </td>
              </tr>
            ) : (
              filteredTemplates.map((tpl) => (
                <tr
                  key={tpl.id}
                  className={`group border-b transition-colors align-top ${t.tableRow}`}
                >
                  <td className="px-3 py-3.5 truncate">
                    {editingId === tpl.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className={`${t.input} py-1 px-2 text-xs font-medium w-full`}
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className={`${t.input} py-1 px-2 text-[10px] w-full`}
                          value={editForm.subject || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              subject: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col truncate w-full">
                        <span
                          className="font-medium block truncate"
                          title={tpl.name}
                        >
                          {tpl.name}
                        </span>
                        <span
                          className={`text-xs mt-1 block truncate ${t.textMuted}`}
                          title={tpl.subject}
                        >
                          {tpl.subject}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {editingId === tpl.id ? (
                      <textarea
                        className={`${t.input} py-2 px-3 min-h-40 text-xs w-full`}
                        value={editForm.body || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, body: e.target.value })
                        }
                      />
                    ) : (
                      <p
                        className={`text-xs line-clamp-3 whitespace-pre-wrap ${t.textMuted}`}
                      >
                        {tpl.body}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    {editingId === tpl.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(tpl.id, {
                              name: editForm.name,
                              subject: editForm.subject,
                              body: editForm.body,
                            })
                          }
                          className="text-green-400 hover:bg-green-500/10 px-2 py-1 rounded text-xs"
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
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(tpl)}
                          className="text-accent hover:bg-accent/10 px-2 py-1 rounded text-xs"
                        >
                          Corriger
                        </button>
                        <button
                          onClick={() => deleteWithUndo(tpl.id)}
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
    </div>
  );
}
