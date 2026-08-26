"use client";

import { useState } from "react";
import { formationService } from "../services/formationService";
import { Formation, CreateFormationDTO } from "../types";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";

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

  const [showForm, setShowForm] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredFormations,
  } = useSearch(formations, (f, query) => {
    return (f.name || "").toLowerCase().includes(query);
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
        title="Formations"
        description="Gérez les formations proposées par l'établissement"
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-ghost border border-white/20 text-white text-sm py-1.5 px-4 bg-white/5 hover:bg-white/10"
        >
          {showForm ? "Cacher le formulaire d'ajout" : "+ Nouvelle formation"}
        </button>
      </PageHeader>

      {showForm && (
        <FormCard title="Nouvelle formation">
          <form onSubmit={(e) => create(e, createForm)} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nom de la formation"
                className="input-field py-1.5"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary py-1.5 text-sm">
              Ajouter la formation
            </button>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-md">
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="px-3 py-3 font-semibold text-white">
                Nom de la formation
              </th>
              <th className="px-3 py-3 font-semibold text-white text-right">
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
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="px-3 py-2">
                    <Skeleton className="h-6 w-48" />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Skeleton className="h-6 w-16 inline-block" />
                  </td>
                </tr>
              ))
            ) : filteredFormations.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  Aucune formation enregistrée.
                </td>
              </tr>
            ) : (
              filteredFormations.map((f) => (
                <tr
                  key={f.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-2">
                    {editingId === f.id ? (
                      <input
                        className="input-field py-1 px-2 max-w-sm text-xs"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      <span className="font-medium text-white">{f.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingId === f.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(f.id, { name: editForm.name })
                          }
                          className="btn btn-ghost text-green-400 px-2 py-1 text-xs font-bold"
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
                          onClick={() => startEdit(f)}
                          className="btn btn-ghost text-accent px-2 py-1 text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteWithUndo(f.id)}
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
