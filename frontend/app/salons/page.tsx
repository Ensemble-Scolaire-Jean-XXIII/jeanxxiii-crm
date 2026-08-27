"use client";

import { useState, useEffect } from "react";
import { prospectService } from "../services/prospectService";
import { formationService } from "../services/formationService";
import { countryService } from "../services/countryService";
import { Formation } from "../types";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import PageHeader from "../components/PageHeader";
import { useTheme } from "../contexts/ThemeContext";

export default function SalonsPage() {
  const { t } = useTheme();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [franceCountryId, setFranceCountryId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const initialForm = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "Masculin",
    formation_id: null as number | null,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadSalonsData = async () => {
      setIsLoading(true);
      try {
        const [fData, cData] = await Promise.all([
          formationService.getAll(),
          countryService.getAll(),
        ]);
        setFormations(fData);
        const france = cData.find((c) => c.name.toLowerCase() === "france");
        if (france) {
          setFranceCountryId(france.id);
        }
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    loadSalonsData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await prospectService.create({
        ...form,
        country_id: franceCountryId ?? 1,
        status_id: 1,
      });

      setForm(initialForm);
      setSuccess("Inscription réussie");
      setShowSuccessAnim(true);
      setTimeout(() => setShowSuccessAnim(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'inscription.",
      );
    }
  };

  if (showSuccessAnim) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
        <div
          className={`${t.card} max-w-md w-full p-12 flex flex-col items-center animate-fade-in-up`}
        >
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Merci !</h2>
          <p className="text-white/90 text-lg text-center">
            Vos informations ont bien été enregistrées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 max-w-3xl mx-auto w-full justify-center">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <PageHeader
        title="Rencontrons-nous !"
        description="Laissez-nous vos coordonnées pour rester en contact."
      />

      <div
        className={`${t.card} flex flex-col flex-1 overflow-hidden justify-center shadow-2xl`}
      >
        <div className="overflow-y-auto flex-1 custom-scrollbar px-6 py-8 flex flex-col justify-center">
          {isLoading ? (
            <div className="space-y-4 max-w-xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-w-xl mx-auto w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Prénom *</label>
                  <input
                    type="text"
                    required
                    className={t.input}
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text">Nom *</label>
                  <input
                    type="text"
                    required
                    className={t.input}
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Email *</label>
                <input
                  type="email"
                  required
                  className={t.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Téléphone</label>
                  <input
                    type="tel"
                    className={t.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-text">Civilité *</label>
                  <select
                    className={t.input}
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="Masculin">Monsieur</option>
                    <option value="Féminin">Madame</option>
                    <option value="">Ne préfère pas l'indiquer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text">
                  Formation visée (Optionnel)
                </label>
                <select
                  className={t.input}
                  value={form.formation_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      formation_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">-- Non défini --</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className={t.btnPrimary + " w-full mt-4"}>
                Valider mes informations
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
