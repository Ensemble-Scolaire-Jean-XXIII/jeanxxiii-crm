"use client";

import { templateService } from "../services/templateService";
import { CreateTemplateDTO, EmailTemplate } from "../types/index";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";

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
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
          Templates d&rsquo;email
        </h1>
        <p className="text-white/80 mt-1">
          Rédigez les emails qui seront distribués automatiquement
        </p>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Nouveau template
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>
        <form
          onSubmit={(e) => create(e, createForm)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Nom du template</label>
              <input
                type="text"
                className="input-field"
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
                className="input-field"
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
              className="input-field min-h-25"
              value={createForm.body}
              onChange={(e) =>
                setCreateForm({ ...createForm, body: e.target.value })
              }
              required
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary">
              Créer
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="p-3 font-semibold w-1/4">Template & Sujet</th>
              <th className="p-3 font-semibold w-2/4">Contenu</th>
              <th className="p-3 font-semibold text-right w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-3">
                    <Skeleton className="h-10 w-full" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-12 w-full" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="h-8 w-24 inline-block" />
                  </td>
                </tr>
              ))
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-400">
                  Aucun template trouvé.
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr
                  key={t.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors align-top"
                >
                  <td className="p-3">
                    {editingId === t.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className="input-field py-1 px-2 font-medium"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className="input-field py-1 px-2 text-sm"
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
                        <span className="text-sm text-slate-400 mt-1">
                          {t.subject}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <textarea
                        className="input-field py-1 px-2 min-h-25 text-sm"
                        value={editForm.body || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, body: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {t.body}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right">
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
                          className="btn btn-ghost text-green-400 px-2 py-1 text-sm"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-ghost text-slate-400 px-2 py-1 text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(t)}
                          className="btn btn-ghost text-accent px-2 py-1 text-sm"
                        >
                          Corriger
                        </button>
                        <button
                          onClick={() => deleteWithUndo(t.id)}
                          className="btn btn-ghost text-red-400 px-2 py-1 text-sm"
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
      </div>
    </div>
  );
}
