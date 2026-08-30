"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/userService";
import { settingService } from "../services/settingService";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { ToastProvider, useToast } from "../contexts/ToastContext";

function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [isResetEnabled, setIsResetEnabled] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { t } = useTheme();
  const { showToast } = useToast();

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await settingService.get("password_reset_enabled");
        setIsResetEnabled(res.enabled);
      } catch (err) {
        setIsResetEnabled(false);
      }
    };
    checkSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await userService.login(email, passwordHash);
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, "error");
    }
  };

  const handleForgotRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await userService.requestPasswordReset(resetEmail);
      showToast("Un email vous a été envoyé si le compte existe.", "success");
      setShowResetForm(false);
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, "error");
    }
  };

  return (
    <div className={t.wrapper + " items-center justify-center"}>
      <div className={`${t.card} w-full max-w-md p-8 sm:p-10 z-10 shadow-2xl`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-(--text-main) mb-1">
            CRM Jean XXIII
          </h1>
          <p className="text-(--text-muted) text-sm">
            {showResetForm
              ? "Réinitialisation du mot de passe"
              : "Connexion à l'espace sécurisé"}
          </p>
        </div>

        {!showResetForm ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Adresse email"
                className={t.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Mot de passe"
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
              Se connecter
            </button>
            {isResetEnabled && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className={`text-xs ${t.textMuted} hover:text-(--text-main) transition-colors`}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleForgotRequest} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Votre adresse email"
                className={t.input}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`${t.btnPrimary} w-full text-base py-3`}
            >
              Demander un nouveau mot de passe
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowResetForm(false)}
                className={`text-xs ${t.textMuted} hover:text-(--text-main) transition-colors`}
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LoginPageContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
