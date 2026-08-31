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
  Column,
} from "../types";
import { useCrud } from "../hooks/useCrud";
import { useSearch } from "../hooks/useSearch";
import { useSort } from "../hooks/useSort";
import PageHeader from "../components/PageHeader";
import FormCard from "../components/FormCard";
import ScrollableTableCard from "../components/ScrollableTableCard";
import DataTable from "../components/DataTable";
import PageActions from "../components/PageActions";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";

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
  const { showToast } = useToast();
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
    loadData,
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

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError("");
    }
  }, [error, showToast, setError]);

  useEffect(() => {
    if (success) {
      showToast(success, "success");
      setSuccess("");
    }
  }, [success, showToast, setSuccess]);

  useEffect(() => {
    if (undoAction) {
      showToast(
        undoAction.message,
        "undo",
        undoAction.duration,
        undoAction.onUndo,
      );
      setUndoAction(null);
    }
  }, [undoAction, showToast, setUndoAction]);

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

  const columns: Column<ProspectExtended>[] = [
    {
      field: "name",
      label: "Nom",
      sortable: true,
      render: (item) => (
        <span
          className="block w-full truncate font-medium"
          title={`${item.first_name || ""} ${item.last_name || ""}`}
        >
          {item.first_name} {item.last_name}
        </span>
      ),
      renderEdit: (form, update) => (
        <div className="flex flex-col gap-1">
          <input
            className={`${t.input} py-1! px-2! text-xs! truncate`}
            value={form.first_name || ""}
            onChange={(e) => update({ first_name: e.target.value })}
            placeholder="Prénom"
          />
          <input
            className={`${t.input} py-1! px-2! text-xs! truncate`}
            value={form.last_name || ""}
            onChange={(e) => update({ last_name: e.target.value })}
            placeholder="Nom"
          />
        </div>
      ),
    },
    {
      field: "contact",
      label: "Contact",
      sortable: true,
      render: (item) => (
        <div className="w-full truncate">
          <span className="block w-full truncate" title={item.email}>
            {item.email}
          </span>
          <span
            className={`block w-full truncate text-[10px] font-medium ${t.textMuted}`}
          >
            {item.phone ? item.phone : "Aucun téléphone"}
          </span>
        </div>
      ),
      renderEdit: (form, update) => (
        <div className="flex flex-col gap-1">
          <input
            className={`${t.input} py-1! px-2! text-xs! truncate`}
            value={form.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="Email"
          />
          <input
            className={`${t.input} py-1! px-2! text-xs! truncate`}
            value={form.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="Téléphone"
          />
        </div>
      ),
    },
    {
      field: "formation",
      label: "Formation",
      sortable: true,
      className: "hidden md:table-cell",
      render: (item) => {
        const f = formations.find((f) => f.id === item.formation_id);
        return <span className="block truncate">{f?.name || "Aucune"}</span>;
      },
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
          value={form.formation_id ?? ""}
          onChange={(e) =>
            update({
              formation_id: e.target.value ? Number(e.target.value) : null,
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
      ),
    },
    {
      field: "country",
      label: "Pays",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (item) => {
        const c = countries.find((c) => c.id === item.country_id);
        return (
          <span className="block truncate">{c?.name || item.country_name}</span>
        );
      },
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
          value={form.country_id ?? ""}
          onChange={(e) => update({ country_id: Number(e.target.value) })}
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      field: "status",
      label: "Statut",
      sortable: true,
      render: (item) => {
        const s = statuses.find((s) => s.id === item.status_id);
        const ps = statuses.find((s) => s.id === item.previous_status_id);
        return (
          <div className="w-full truncate">
            <span className="block truncate">
              {s?.name || item.status_name}
            </span>
            {(ps?.name || item.previous_status_name) && (
              <span
                className={`block w-full truncate text-[10px] font-medium ${t.textMuted}`}
                title={`Ancien statut : ${ps?.name || item.previous_status_name}`}
              >
                Ancien: {ps?.name || item.previous_status_name}
              </span>
            )}
          </div>
        );
      },
      renderEdit: (form, update) => (
        <select
          className={`${t.input} py-1! px-2! text-xs! cursor-pointer truncate`}
          value={form.status_id ?? ""}
          onChange={(e) => update({ status_id: Number(e.target.value) })}
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      field: "date",
      label: "Dernière action",
      sortable: true,
      className: "hidden sm:table-cell text-xs",
      render: (item) => (
        <span className={t.textMuted}>
          {item.last_action_date
            ? new Date(item.last_action_date).toLocaleDateString()
            : "Jamais"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <PageHeader
        title="Prospects"
        description="Gérez vos prospects facilement"
      >
        <PageActions
          onRefresh={loadData}
          showNew={true}
          isNewOpen={showForm}
          onToggleNew={() => setShowForm(!showForm)}
          newLabel="Nouveau prospect"
        />
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
        <DataTable
          data={sortedProspects}
          columns={columns}
          keyExtractor={(item) => item.id}
          editingId={editingId}
          editForm={editForm}
          setEditForm={setEditForm}
          onEdit={startEdit}
          onSave={updateWithUndo}
          onCancel={() => setEditingId(null)}
          onDelete={deleteWithUndo}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          emptyMessage="Aucun prospect trouvé."
        />
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
