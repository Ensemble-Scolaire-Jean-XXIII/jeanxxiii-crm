"use client";

import { useState } from "react";
import { statusService } from "../services/statusService";
import { CreateStatusDTO, Status } from "../types";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";

export default function StatusesPage() {
  const {
    data: statuses,
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
  } = useCrud<Status, CreateStatusDTO>(statusService, {
    name: "",
    is_custom: true,
  });

  const [showForm, setShowForm] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredStatuses,
  } = useSearch(statuses, (s, query) => {
    const name = (s.name || "").toLowerCase();
    const type = s.is_custom ? "personnalisé" : "système";
    return name.includes(query) || type.includes(query);
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
        title="Statuts"
        description="Gérez les status à attribuer à vos prospects"
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-ghost border border-white/20 text-white text-sm py-1.5 px-4 bg-white/5 hover:bg-white/10"
        >
          {showForm ? "Cacher le formulaire d'ajout" : "+ Nouveau statut"}
        </button>
      </PageHeader>

      {showForm && (
        <FormCard title="Nouveau statut">
          <form onSubmit={(e) => create(e, createForm)} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nom du statut"
                className="input-field py-1.5"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary py-1.5 text-sm">
              Ajouter le statut
            </button>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <table className="w-full text-left text-sm table-fixed min-w-[600px]">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-md">
            <tr className="border-b border-slate-700 text-slate-300">
              <th className="px-3 py-3 font-semibold text-white truncate">
                Nom du statut
              </th>
              <th className="px-3 py-3 font-semibold text-white truncate">
                Type
              </th>
              <th className="px-3 py-3 font-semibold text-white text-right w-52">
                <input
                  type="text"
                  className="input-field py-1 px-2 text-xs font-normal w-full text-right ml-auto"
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
            ) : filteredStatuses.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-slate-400 truncate"
                >
                  Aucun statut trouvé.
                </td>
              </tr>
            ) : (
              filteredStatuses.map((s) => (
                <tr
                  key={s.id}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-3.5 truncate">
                    {editingId === s.id ? (
                      <input
                        className="input-field py-1 px-2 w-full text-xs"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      <span
                        className="font-medium text-white block truncate"
                        title={s.name}
                      >
                        {s.name}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 truncate">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${s.is_custom ? "bg-white/10 text-slate-300" : "bg-primary/20 text-primary"}`}
                    >
                      {s.is_custom ? "Personnalisé" : "Système"}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    {editingId === s.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWithUndo(s.id, {
                              name: editForm.name,
                              is_custom: editForm.is_custom,
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
                          onClick={() => startEdit(s)}
                          className="btn btn-ghost text-accent px-2 py-1 text-xs"
                        >
                          Corriger
                        </button>
                        {!!s.is_custom && (
                          <button
                            onClick={() => deleteWithUndo(s.id)}
                            className="btn btn-ghost text-red-400 px-2 py-1 text-xs"
                          >
                            Supprimer
                          </button>
                        )}
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
