"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { userService } from "../services/userService";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { ToastProvider, useToast } from "../contexts/ToastContext";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwordHash, setPasswordHash] = useState("");

  const { t } = useTheme();
  const { showToast } = useToast();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    try {
      await userService.resetPassword(token, passwordHash);
      showToast("Mot de passe modifié avec succès", "success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, "error");
    }
  };

  if (!token) {
    return (
      <div className={t.wrapper + " items-center justify-center"}>
        <div
          className={`${t.card} w-full max-w-md p-8 sm:p-10 z-10 shadow-2xl text-center`}
        >
          <h1 className="text-xl font-bold text-red-500 mb-4">Lien invalide</h1>
          <p className="text-(--text-muted) text-sm mb-6">
            Le jeton de réinitialisation est manquant.
          </p>
          <button
            onClick={() => router.push("/login")}
            className={t.btnPrimary + " w-full py-2"}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={t.wrapper + " items-center justify-center"}>
      <div className={`${t.card} w-full max-w-md p-8 sm:p-10 z-10 shadow-2xl`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-(--text-main) mb-1">
            CRM Jean XXIII
          </h1>
          <p className="text-(--text-muted) text-sm">
            Choisissez un nouveau mot de passe
          </p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className={t.input}
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`${t.btnPrimary} w-full text-base py-3`}
          >
            Valider le nouveau mot de passe
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className={`text-xs ${t.textMuted} hover:text-(--text-main) transition-colors`}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              Chargement...
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </ToastProvider>
    </ThemeProvider>
  );
}
