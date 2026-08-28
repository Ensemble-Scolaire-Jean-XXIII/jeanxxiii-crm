import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/userService";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent,
    email: string,
    password_hash: string,
  ) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await userService.login(email, password_hash);
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitSalon = async (e: React.FormEvent, password: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await userService.reauthenticate(password);

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.removeItem("isSalonMode");
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    handleExitSalon,
    isLoading,
    error,
    setError,
  };
}
