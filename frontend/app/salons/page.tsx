"use client";

import { useState, useEffect } from "react";
import { prospectService } from "../services/prospectService";
import { formationService } from "../services/formationService";
import { countryService } from "../services/countryService";
import { Formation } from "../types";
import Toast from "../components/Toast";

export default function SalonsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [franceCountryId, setFranceCountryId] = useState<number | null>(null);
  const [error, setError] = useState("");
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
    formationService
      .getAll()
      .then(setFormations)
      .catch(() => {});

    countryService
      .getAll()
      .then((countries) => {
        const france = countries.find((c) => c.name.toLowerCase() === "france");
        if (france) {
          setFranceCountryId(france.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await prospectService.create({
        ...form,
        country_id: franceCountryId ?? 1,
        status_id: 1,
      });

      setForm(initialForm);
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div className="bg-white/25 backdrop-blur-md p-12 rounded-3xl flex flex-col items-center border border-white/20 shadow-2xl animate-fade-in-up">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
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
          <p className="text-white/90 text-lg">
            Vos informations ont bien été enregistrées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center items-center relative">
      <Toast message={error} type="error" onClose={() => setError("")} />

      <div className="w-full max-w-2xl bg-white/20 dark:bg-slate-900/60 backdrop-blur-lg p-8 sm:p-12 rounded-3xl border border-white/20 shadow-2xl my-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">
            Rencontrons-nous !
          </h1>
          <p className="text-white/90 text-lg">
            Laissez-nous vos coordonnées pour rester en contact.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
                Prénom *
              </label>
              <input
                type="text"
                required
                className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 text-lg shadow-inner transition-all"
                placeholder="Jean"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
                Nom *
              </label>
              <input
                type="text"
                required
                className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 text-lg shadow-inner transition-all"
                placeholder="Dupont"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 text-lg shadow-inner transition-all"
              placeholder="jean.dupont@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
                Téléphone
              </label>
              <input
                type="tel"
                className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 text-lg shadow-inner transition-all"
                placeholder="06 12 34 56 78"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
                Sexe *
              </label>
              <select
                className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white text-lg shadow-inner transition-all cursor-pointer"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Femme</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-semibold mb-2 drop-shadow-sm">
              Formation visée (Optionnel)
            </label>
            <select
              className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white text-lg shadow-inner transition-all cursor-pointer"
              value={form.formation_id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  formation_id: e.target.value ? Number(e.target.value) : null,
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

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] text-xl mt-4"
          >
            Valider mes informations
          </button>
        </form>
      </div>
    </div>
  );
}
