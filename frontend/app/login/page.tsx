"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/userService";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { ToastProvider, useToast } from "../contexts/ToastContext";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const router = useRouter();
  const { t } = useTheme();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await userService.login(email, passwordHash);
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      }
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
            Connexion à l&apos;espace sécurisé
          </p>
        </div>

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
        </form>
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
