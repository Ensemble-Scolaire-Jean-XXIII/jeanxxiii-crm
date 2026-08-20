"use client";

import { useEffect, useState } from "react";
import { prospectService } from "../services/prospectService";
import { statusService } from "../services/statusService";
import { countryService } from "../services/countryService";
import { formationService } from "../services/formationService";
import {
  ProspectExtended,
  Status,
  Country,
  Formation,
  CreateProspectsDTO,
  SortHeaderProps,
} from "../types";
import Toast from "../components/Toast";
import { useCrud } from "../hooks/useCrud";

const formInputs: {
  name: keyof CreateProspectsDTO;
  type: string;
  placeholder: string;
  required: boolean;
}[] = [
  { name: "first_name", type: "text", placeholder: "Prénom", required: true },
  { name: "last_name", type: "text", placeholder: "Nom", required: true },
  { name: "email", type: "email", placeholder: "Email", required: true },
  { name: "phone", type: "tel", placeholder: "Téléphone", required: false },
];

const SortHeader = ({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
}: SortHeaderProps) => (
  <th
    className="p-3 font-semibold whitespace-nowrap cursor-pointer hover:text-primary dark:hover:text-white transition-colors group select-none"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-2">
      {label}
      <span className="text-[10px] text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity">
        {sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </div>
  </th>
);

export default function ProspectsPage() {
  const {
    data: prospects,
    error,
    success,
    editingId,
    editForm,
    createForm,
    setError,
    setSuccess,
    setEditingId,
    setEditForm,
    setCreateForm,
    handleCreate,
    handleDelete,
    handleUpdateField,
    startEdit,
    saveEdit,
  } = useCrud<ProspectExtended, CreateProspectsDTO>(prospectService, {
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

  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
    setCreateForm((prev: CreateProspectsDTO) => ({
      ...prev,
      [name]:
        name.endsWith("_id") || name === "formation_id"
          ? value
            ? Number(value)
            : null
          : value,
    }));
  };

  const onHandleCreate = (e: React.FormEvent) => {
    handleCreate(e, createForm);
  };

  const onSaveEdit = (id: string) => {
    saveEdit(id, (form) => ({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
    }));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
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
        compareResult = (a.country_name || "").localeCompare(
          b.country_name || "",
        );
        break;
      case "status":
        compareResult = (a.status_name || "").localeCompare(
          b.status_name || "",
        );
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
    <div className="w-full max-w-full space-y-8 overflow-x-hidden px-2 sm:px-4">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-white">
          Prospects
        </h1>
        <p className="text-white/80 mt-1">
          Construisez les emails qui seront distribués automatiquement
        </p>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-white/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-white">
            Ajouter un prospect
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            Nouveau
          </span>
        </div>

        <form
          onSubmit={onHandleCreate}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {formInputs.map((input) => (
            <div key={input.name} className="w-full">
              <label className="label-text">{input.placeholder}</label>
              <input
                name={input.name}
                type={input.type}
                className="input-field w-full"
                value={(createForm[input.name] as string) || ""}
                onChange={handleCreateChange}
                required={input.required}
              />
            </div>
          ))}

          <div className="w-full">
            <label className="label-text">Pays</label>
            <select
              name="country_id"
              className="input-field w-full"
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
            <label className="label-text">Formation</label>
            <select
              name="formation_id"
              className="input-field w-full"
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
            <label className="label-text">Sexe</label>
            <select
              name="gender"
              className="input-field w-full"
              value={createForm.gender}
              onChange={handleCreateChange}
            >
              <option value="Masculin">Homme</option>
              <option value="Féminin">Femme</option>
            </select>
          </div>

          <div className="w-full">
            <label className="label-text">Statut</label>
            <select
              name="status_id"
              className="input-field w-full"
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

          <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              Créer
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/20 dark:bg-slate-800/60 backdrop-blur-sm p-0 sm:p-6 rounded-lg border border-white/20 shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-237.5">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 sm:bg-transparent">
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
                  label="Action"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th className="p-3 font-semibold text-right whitespace-nowrap">
                  Paramètres
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProspects.map((p) => (
                <tr
                  key={p.id}
                  className="group border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-3 min-w-45">
                    {editingId === p.id ? (
                      <div className="flex flex-col sm:flex-row gap-1">
                        <input
                          className="input-field py-1 px-2 w-full text-xs"
                          value={editForm.first_name || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              first_name: e.target.value,
                            })
                          }
                        />
                        <input
                          className="input-field py-1 px-2 w-full text-xs"
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
                        className="block truncate max-w-50"
                        title={`${p.first_name || ""} ${p.last_name || ""}`}
                      >
                        {p.first_name} {p.last_name}
                      </span>
                    )}
                  </td>

                  <td className="p-3 min-w-55">
                    {editingId === p.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          className="input-field py-1 px-2 text-xs w-full"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                        <input
                          className="input-field py-1 px-2 text-xs w-full"
                          value={editForm.phone || ""}
                          placeholder="Téléphone"
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                    ) : (
                      <div>
                        <span
                          className="block truncate max-w-55"
                          title={p.email}
                        >
                          {p.email}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                          {p.phone ? p.phone : "Aucun téléphone"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="p-3 min-w-37.5">
                    <select
                      className="bg-transparent border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary rounded px-2 py-1 text-xs sm:text-sm cursor-pointer outline-none transition-colors w-full"
                      value={p.formation_id ?? ""}
                      onChange={(e) =>
                        handleUpdateField(
                          p.id,
                          "formation_id",
                          e.target.value ? Number(e.target.value) : null,
                        )
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

                  <td className="p-3 min-w-30">
                    <select
                      className="bg-transparent border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary rounded px-2 py-1 text-xs sm:text-sm cursor-pointer outline-none transition-colors w-full"
                      value={p.country_id ?? ""}
                      onChange={(e) =>
                        handleUpdateField(
                          p.id,
                          "country_id",
                          Number(e.target.value),
                        )
                      }
                    >
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 min-w-37.5">
                    <select
                      className="bg-transparent border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary rounded px-2 py-1 text-xs sm:text-sm cursor-pointer outline-none transition-colors w-full"
                      value={p.status_id ?? ""}
                      onChange={(e) =>
                        handleUpdateField(
                          p.id,
                          "status_id",
                          Number(e.target.value),
                        )
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 text-xs sm:text-sm whitespace-nowrap min-w-25">
                    {p.last_action_date
                      ? new Date(p.last_action_date).toLocaleDateString()
                      : "Jamais"}
                  </td>

                  <td className="p-3 text-right min-w-37.5">
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onSaveEdit(p.id)}
                          className="btn btn-ghost text-green-600 px-2 py-1 text-xs font-bold"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-ghost text-slate-500 px-2 py-1 text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(p)}
                          className="btn btn-ghost text-accent px-2 py-1 text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-ghost text-danger px-2 py-1 text-xs"
                        >
                          Suppr.
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sortedProspects.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Aucun prospect trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
