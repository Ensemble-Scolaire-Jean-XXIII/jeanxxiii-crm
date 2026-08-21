"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/userService";
import Toast from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const data = await userService.login(email, passwordHash);
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent relative items-center justify-center p-4">
      <Toast message={error} type="error" onClose={() => setError("")} />

      <div className="w-full max-w-md bg-white/25 dark:bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-md mb-1">
            CRM Jean XXIII
          </h1>
          <p className="text-white/80 text-sm">
            Connexion à l&apos;espace sécurisé
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Adresse email"
              className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-500 text-base shadow-inner transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full bg-white/70 dark:bg-slate-800/70 border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-500 text-base shadow-inner transition-all"
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] text-lg mt-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
