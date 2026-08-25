"use client";

import { formationService } from "../services/formationService";
import { Formation, CreateFormationDTO } from "../types";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";

export default function FormationsPage() {
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
  } = useCrud<Formation, CreateFormationDTO>(formationService, { name: "" });

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
          Formations
        </h1>
        <p className="text-white/80 mt-1">
          Gérez la liste des formations proposées par l&apos;établissement
        </p>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Ajouter une formation
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>
        <form onSubmit={(e) => create(e, createForm)} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nom de la formation (ex: BTS SIO)"
              className="input-field"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Créer
          </button>
        </form>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="p-3 font-semibold">Nom de la formation</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-3">
                    <Skeleton className="h-6 w-48" />
                  </td>
                  <td className="p-3 text-right">
                    <Skeleton className="h-6 w-16 inline-block" />
                  </td>
                </tr>
              ))
            ) : formations.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-6 text-center text-slate-400">
                  Aucune formation enregistrée.
                </td>
              </tr>
            ) : (
              formations.map((f) => (
                <tr
                  key={f.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3">
                    {editingId === f.id ? (
                      <input
                        className="input-field py-1 px-2 max-w-sm"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      <span className="font-medium text-white">{f.name}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editingId === f.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(f.id, { name: editForm.name })
                          }
                          className="btn btn-ghost text-green-400 px-2 py-1 text-sm font-bold"
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
                          onClick={() => startEdit(f)}
                          className="btn btn-ghost text-accent px-2 py-1 text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteWithUndo(f.id)}
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
