"use client";

import { templateService } from "../services/templateService";
import { EmailTemplate } from "../types/index";
import Toast from "../components/Toast";
import { useCrud } from "../hooks/useCrud";

interface CreateTemplateDTO {
  name: string;
  subject: string;
  body: string;
}

export default function TemplatesPage() {
  const {
    data: templates,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    createForm,
    setCreateForm,
    error,
    setError,
    success,
    setSuccess,
    handleCreate,
    handleDelete,
    startEdit,
    saveEdit,
  } = useCrud<EmailTemplate, CreateTemplateDTO>(templateService, {
    name: "",
    subject: "",
    body: "",
  });

  const onSaveEdit = (id: string) => {
    saveEdit(id, (form) => {
      const payload = { ...form };
      delete (payload as { id?: string | number }).id;
      return payload;
    });
  };

  return (
    <div className="space-y-8">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <h1 className="text-3xl font-bold text-primary dark:text-white">
        Templates Email
      </h1>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Nouveau template
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
              className="input-field min-h-[100px]"
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

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="p-3 font-semibold w-1/4">Template & Sujet</th>
              <th className="p-3 font-semibold w-2/4">Contenu</th>
              <th className="p-3 font-semibold text-right w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr
                key={t.id}
                className="group border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors align-top"
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
                          setEditForm({ ...editForm, subject: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium text-primary dark:text-white">
                        {t.name}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t.subject}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {editingId === t.id ? (
                    <textarea
                      className="input-field py-1 px-2 min-h-[100px] text-sm"
                      value={editForm.body || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, body: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {t.body}
                    </p>
                  )}
                </td>
                <td className="p-3 text-right">
                  {editingId === t.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSaveEdit(t.id)}
                        className="btn btn-ghost text-green-600 px-2 py-1 text-sm"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-ghost text-slate-500 px-2 py-1 text-sm"
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
                        onClick={() => handleDelete(t.id)}
                        className="btn btn-ghost text-danger px-2 py-1 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
