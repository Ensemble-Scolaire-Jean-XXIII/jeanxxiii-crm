"use client";

import { useState } from "react";
import { formationService } from "../services/formationService";
import { Formation, CreateFormationPayload } from "../types";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import { useTheme } from "../contexts/ThemeContext";

export default function FormationsPage() {
  const { t } = useTheme();
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
  } = useCrud<Formation, CreateFormationPayload>(formationService, {
    name: "",
  });

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
        <button onClick={() => setShowForm(!showForm)} className={t.btnGhost}>
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
                className={`${t.input} py-1.5`}
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className={t.btnPrimary}>
              Ajouter la formation
            </button>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <table className="w-full text-left text-sm table-fixed min-w-150">
          <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
            <tr className="border-b border-slate-700">
              <th className="px-3 py-3 font-semibold truncate">
                Nom de la formation
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
              <TableSkeleton columns={2} />
            ) : filteredFormations.length === 0 ? (
              <tr>
                {" "}
                <td
                  colSpan={2}
                  className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                >
                  Aucune formation enregistrée.
                </td>
              </tr>
            ) : (
              filteredFormations.map((f) => (
                <tr
                  key={f.id}
                  className={`group border-b transition-colors ${t.tableRow}`}
                >
                  <td className="px-3 py-3.5 truncate">
                    {editingId === f.id ? (
                      <input
                        className={`${t.input} py-1 px-2 w-full text-xs`}
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      <span
                        className="font-medium block truncate"
                        title={f.name}
                      >
                        {f.name}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    {editingId === f.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(f.id, { name: editForm.name })
                          }
                          className="text-green-400 hover:bg-green-500/10 px-2 py-1 rounded text-xs font-bold"
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
                          onClick={() => startEdit(f)}
                          className="text-blue-400 hover:bg-blue-500/10 px-2 py-1 rounded text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteWithUndo(f.id)}
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
