"use client";

import { useState } from "react";
import { templateService } from "../services/templateService";
import { CreateTemplateDTO, EmailTemplate } from "../types/index";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";

export default function TemplatesPage() {
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
  } = useCrud<EmailTemplate, CreateTemplateDTO>(templateService, {
    name: "",
    subject: "",
    body: "",
  });

  const [showForm, setShowForm] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredTemplates,
  } = useSearch(templates, (t, query) => {
    const name = (t.name || "").toLowerCase();
    const subject = (t.subject || "").toLowerCase();
    const body = (t.body || "").toLowerCase();
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-ghost border border-white/20 text-white text-sm py-1.5 px-4 bg-white/5 hover:bg-white/10"
        >
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
                <label className="label-text">Nom du template</label>
                <input
                  type="text"
                  className="input-field py-1.5"
                  placeholder="Statut - Formation"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label-text">Sujet de l&#39;email</label>
                <input
                  type="text"
                  className="input-field py-1.5"
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
              <label className="label-text">Contenu de l&#39;email</label>
              <textarea
                className="input-field min-h-20 py-1.5"
                value={createForm.body}
                placeholder="Bonjour {{civility}} {{first_name}} {{last_name}},"
                onChange={(e) =>
                  setCreateForm({ ...createForm, body: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className="btn btn-primary py-1.5 text-sm">
                Ajouter le template
              </button>
            </div>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-md">
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="px-3 py-3 font-semibold text-white w-1/4">
                Template & Sujet
              </th>
              <th className="px-3 py-3 font-semibold text-white w-2/4">
                Contenu
              </th>
              <th className="px-3 py-3 font-semibold text-white text-right w-1/4">
                <input
                  type="text"
                  className="input-field py-1 px-2 text-xs font-normal w-full max-w-44 text-right ml-auto"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="px-3 py-2">
                    <Skeleton className="h-10 w-full" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-12 w-full" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Skeleton className="h-8 w-24 inline-block" />
                  </td>
                </tr>
              ))
            ) : filteredTemplates.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  Aucun template trouvé.
                </td>
              </tr>
            ) : (
              filteredTemplates.map((t) => (
                <tr
                  key={t.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors align-top"
                >
                  <td className="px-3 py-2">
                    {editingId === t.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className="input-field py-1 px-2 text-xs font-medium"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className="input-field py-1 px-2 text-[10px]"
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
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{t.name}</span>
                        <span className="text-xs text-slate-400 mt-1">
                          {t.subject}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === t.id ? (
                      <textarea
                        className="input-field py-2 px-3 min-h-40 text-xs"
                        value={editForm.body || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, body: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-wrap">
                        {t.body}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingId === t.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(t.id, {
                              name: editForm.name,
                              subject: editForm.subject,
                              body: editForm.body,
                            })
                          }
                          className="btn btn-ghost text-green-400 px-2 py-1 text-xs"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-ghost text-slate-400 px-2 py-1 text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(t)}
                          className="btn btn-ghost text-accent px-2 py-1 text-xs"
                        >
                          Corriger
                        </button>
                        <button
                          onClick={() => deleteWithUndo(t.id)}
                          className="btn btn-ghost text-red-400 px-2 py-1 text-xs"
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
