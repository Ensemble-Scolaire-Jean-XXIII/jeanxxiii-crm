"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { prospectService } from "../services/prospectService";
import { statusService } from "../services/statusService";
import { countryService } from "../services/countryService";
import { formationService } from "../services/formationService";
import {
  ProspectExtended,
  Status,
  Country,
  Formation,
  CreateProspectPayload,
} from "../types";
import Toast from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import { useSort } from "../hooks/useSort";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import SortHeader from "../components/SortHeader";
import { useTheme } from "../contexts/ThemeContext";

const formInputs: {
  name: keyof CreateProspectPayload;
  type: string;
  placeholder: string;
  required: boolean;
}[] = [
  { name: "first_name", type: "text", placeholder: "Prénom", required: true },
  { name: "last_name", type: "text", placeholder: "Nom", required: true },
  { name: "email", type: "email", placeholder: "Email", required: true },
  { name: "phone", type: "tel", placeholder: "Téléphone", required: false },
];

function ProspectsContent() {
  const { t } = useTheme();
  const searchParams = useSearchParams();

  const {
    data: prospects,
    isLoading,
    error,
    success,
    editingId,
    editForm,
    createForm,
    undoAction,
    setError,
    setSuccess,
    setEditingId,
    setEditForm,
    setCreateForm,
    setUndoAction,
    startEdit,
    create,
    updateWithUndo,
    deleteWithUndo,
  } = useCrud<ProspectExtended, CreateProspectPayload>(prospectService, {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "Masculin",
    country_id: 1,
    status_id: 1,
    formation_id: null,
  });

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showForm, setShowForm] = useState(
    searchParams.get("action") === "create",
  );

  const { sortField, sortDirection, handleSort } = useSort("date", "desc");

  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredProspects,
  } = useSearch(prospects, (p, query) => {
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    return (
      fullName.includes(query) || email.includes(query) || phone.includes(query)
    );
  });

  useEffect(() => {
    const fetchSecondaryData = async () => {
      try {
        const [sData, cData, fData] = await Promise.all([
          statusService.getAll(),
          countryService.getAll(),
          formationService.getAll(),
        ]);
        setStatuses(sData);
        setCountries(cData);
        setFormations(fData);
      } catch {
        setError("Erreur lors du chargement des données secondaires");
      }
    };
    fetchSecondaryData();
  }, [setError]);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev: CreateProspectPayload) => ({
      ...prev,
      [name]:
        name.endsWith("_id") || name === "formation_id"
          ? value
            ? Number(value)
            : null
          : value,
    }));
  };

  const sortedProspects = [...filteredProspects].sort((a, b) => {
    let compareResult = 0;
    switch (sortField) {
      case "name":
        compareResult = (a.last_name || "").localeCompare(b.last_name || "");
        break;
      case "contact":
        compareResult = (a.email || "").localeCompare(b.email || "");
        break;
      case "formation":
        const fA = formations.find((f) => f.id === a.formation_id)?.name || "";
        const fB = formations.find((f) => f.id === b.formation_id)?.name || "";
        compareResult = fA.localeCompare(fB);
        break;
      case "country":
        const cA =
          countries.find((c) => c.id === a.country_id)?.name ||
          a.country_name ||
          "";
        const cB =
          countries.find((c) => c.id === b.country_id)?.name ||
          b.country_name ||
          "";
        compareResult = cA.localeCompare(cB);
        break;
      case "status":
        const sA =
          statuses.find((s) => s.id === a.status_id)?.name ||
          a.status_name ||
          "";
        const sB =
          statuses.find((s) => s.id === b.status_id)?.name ||
          b.status_name ||
          "";
        compareResult = sA.localeCompare(sB);
        break;
      case "date":
      default:
        compareResult =
          new Date(a.last_action_date || 0).getTime() -
          new Date(b.last_action_date || 0).getTime();
        break;
    }
    return sortDirection === "asc" ? compareResult : -compareResult;
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
        title="Prospects"
        description="Gérez vos prospects facilement"
      >
        <button onClick={() => setShowForm(!showForm)} className={t.btnGhost}>
          {showForm ? "Cacher le formulaire d'ajout" : "+ Nouveau prospect"}
        </button>
      </PageHeader>

      {showForm && (
        <FormCard title="Nouveau prospect">
          <form
            onSubmit={(e) => create(e, createForm)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {formInputs.map((input) => (
              <div key={input.name} className="w-full">
                <label className={`block text-xs mb-1 ${t.textMuted}`}>
                  {input.placeholder}
                </label>
                <input
                  name={input.name}
                  type={input.type}
                  className={`${t.input} w-full py-1.5`}
                  value={
                    (createForm[
                      input.name as keyof CreateProspectPayload
                    ] as string) || ""
                  }
                  onChange={handleCreateChange}
                  required={input.required}
                />
              </div>
            ))}

            <div className="w-full">
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Pays
              </label>
              <select
                name="country_id"
                className={`${t.input} w-full py-1.5`}
                value={createForm.country_id}
                onChange={handleCreateChange}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Formation
              </label>
              <select
                name="formation_id"
                className={`${t.input} w-full py-1.5`}
                value={createForm.formation_id || ""}
                onChange={handleCreateChange}
              >
                <option value="">-- Aucune formation --</option>
                {formations.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Civilité
              </label>
              <select
                name="gender"
                className={`${t.input} w-full py-1.5`}
                value={createForm.gender}
                onChange={handleCreateChange}
              >
                <option value="Masculin">Monsieur</option>
                <option value="Féminin">Madame</option>
              </select>
            </div>

            <div className="w-full">
              <label className={`block text-xs mb-1 ${t.textMuted}`}>
                Statut
              </label>
              <select
                name="status_id"
                className={`${t.input} w-full py-1.5`}
                value={createForm.status_id}
                onChange={handleCreateChange}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button type="submit" className={t.btnPrimary}>
                Ajouter le prospect
              </button>
            </div>
          </form>
        </FormCard>
      )}

      <ScrollableTableCard>
        <table className="w-full text-left text-sm table-fixed min-w-200">
          <thead className={`sticky top-0 z-10 shadow-md ${t.tableHeader}`}>
            <tr className="border-b border-(--border-color)">
              <SortHeader
                field="name"
                label="Nom"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="contact"
                label="Contact"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="formation"
                label="Formation"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="country"
                label="Pays"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="status"
                label="Statut"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortHeader
                field="date"
                label="Dernière action"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className={`px-3 py-3 text-right ${t.tableHeader}`}>
                <input
                  type="text"
                  className={`${t.input} w-36 ml-auto py-1! text-xs! font-normal`}
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton columns={7} />
            ) : sortedProspects.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`px-3 py-6 text-center truncate ${t.textMuted}`}
                >
                  Aucun prospect trouvé.
                </td>
              </tr>
            ) : (
              sortedProspects.map((p) => (
                <tr
                  key={p.id}
                  className={`group border-b transition-colors ${t.tableRow}`}
                >
                  <td className="px-3 py-3.5 truncate">
                    {editingId === p.id ? (
                      <div className="flex flex-col sm:flex-row gap-1">
                        <input
                          className={`${t.input} py-1! px-2! text-xs! truncate`}
                          value={editForm.first_name || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              first_name: e.target.value,
                            })
                          }
                        />
                        <input
                          className={`${t.input} py-1! px-2! text-xs! truncate`}
                          value={editForm.last_name || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <span
                        className="block w-full truncate font-medium"
                        title={`${p.first_name || ""} ${p.last_name || ""}`}
                      >
                        {p.first_name} {p.last_name}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3.5 truncate">
                    {editingId === p.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          className={`${t.input} py-1! px-2! text-xs! truncate`}
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              email: e.target.value,
                            })
                          }
                        />
                        <input
                          className={`${t.input} py-1! px-2! text-xs! truncate`}
                          value={editForm.phone || ""}
                          placeholder="Téléphone"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="w-full truncate">
                        <span className="block w-full truncate" title={p.email}>
                          {p.email}
                        </span>
                        <span
                          className={`block w-full truncate text-[10px] font-medium ${t.textMuted}`}
                        >
                          {p.phone ? p.phone : "Aucun téléphone"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3.5 truncate">
                    <select
                      className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
                      value={p.formation_id ?? ""}
                      onChange={(e) =>
                        updateWithUndo(p.id, {
                          formation_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">-- Aucune --</option>
                      {formations.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-3.5 truncate">
                    <select
                      className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
                      value={p.country_id ?? ""}
                      onChange={(e) =>
                        updateWithUndo(p.id, {
                          country_id: Number(e.target.value),
                        })
                      }
                    >
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-3.5 truncate">
                    <select
                      className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
                      value={p.status_id ?? ""}
                      onChange={(e) =>
                        updateWithUndo(p.id, {
                          status_id: Number(e.target.value),
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className={`px-3 py-3.5 text-xs truncate ${t.textMuted}`}>
                    {p.last_action_date
                      ? new Date(p.last_action_date).toLocaleDateString()
                      : "Jamais"}
                  </td>

                  <td className="px-3 py-3.5 text-right">
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            updateWithUndo(p.id, {
                              first_name: editForm.first_name,
                              last_name: editForm.last_name,
                              email: editForm.email,
                              phone: editForm.phone,
                            })
                          }
                          className="text-green-500 hover:bg-green-500/10 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`${t.textMuted} px-2 py-1 rounded text-xs hover:bg-black/5 cursor-pointer`}
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-blue-500 hover:bg-blue-500/10 px-2 py-1 rounded text-xs cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteWithUndo(p.id)}
                          className="text-red-500 hover:bg-red-500/10 px-2 py-1 rounded text-xs cursor-pointer"
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

export default function ProspectsPage() {
  return (
    <Suspense>
      <ProspectsContent />
    </Suspense>
  );
}
