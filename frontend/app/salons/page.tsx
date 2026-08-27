"use client";

import { useState, useEffect } from "react";
import { prospectService } from "../services/prospectService";
import { formationService } from "../services/formationService";
import { countryService } from "../services/countryService";
import { Formation } from "../types";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

export default function SalonsPage() {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
        <div className="bg-slate-900/80 backdrop-blur-xl p-12 rounded-3xl flex flex-col items-center border border-white/20 shadow-2xl animate-fade-in-up">
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
          <p className="text-white/90 text-lg">
            Vos informations ont bien été enregistrées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col p-5 sm:p-6 bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-white/15 shadow-2xl">
      <Toast message={error} type="error" onClose={() => setError("")} />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />

      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white drop-shadow-md mb-1">
          Rencontrons-nous !
        </h1>
        <p className="text-white/90 text-sm">
          Laissez-nous vos coordonnées pour rester en contact.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
                Prénom *
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white placeholder-slate-400 text-sm shadow-inner transition-all outline-none"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
                Nom *
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white placeholder-slate-400 text-sm shadow-inner transition-all outline-none"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white placeholder-slate-400 text-sm shadow-inner transition-all outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
                Téléphone
              </label>
              <input
                type="tel"
                className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white placeholder-slate-400 text-sm shadow-inner transition-all outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
                Civilité *
              </label>
              <select
                className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white text-sm shadow-inner transition-all cursor-pointer outline-none"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Masculin" className="bg-slate-900">
                  Monsieur
                </option>
                <option value="Féminin" className="bg-slate-900">
                  Madame
                </option>
                <option value="" className="bg-slate-900">
                  Ne préfère pas l'indiquer
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-xs font-semibold mb-1 drop-shadow-sm">
              Formation visée (Optionnel)
            </label>
            <select
              className="w-full bg-slate-800/70 border border-white/15 focus:ring-2 focus:ring-primary rounded-xl px-3 py-2.5 text-white text-sm shadow-inner transition-all cursor-pointer outline-none"
              value={form.formation_id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  formation_id: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="" className="bg-slate-900">
                -- Non défini --
              </option>
              {formations.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] text-base mt-2 cursor-pointer"
          >
            Valider mes informations
          </button>
        </form>
      )}
    </div>
  );
}
