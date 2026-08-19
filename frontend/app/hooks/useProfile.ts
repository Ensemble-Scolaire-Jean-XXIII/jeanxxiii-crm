import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { User } from "../types/index";

interface UpdateProfileDTO {
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password_hash: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await userService.getMe();
        setUser(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password_hash: "",
          confirmPassword: "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le profil",
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{16,}$/;

    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide");
      return;
    }

    if (formData.password_hash) {
      if (!passwordRegex.test(formData.password_hash)) {
        setError(
          "Le mot de passe doit contenir au moins 16 caractères, une lettre, un chiffre et un caractère spécial",
        );
        return;
      }
      if (formData.password_hash !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
    }

    try {
      const updateData: UpdateProfileDTO = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      if (formData.password_hash) {
        updateData.password_hash = formData.password_hash;
      }

      await userService.updateMe(updateData);
      setSuccess("Profil mis à jour avec succès");
      setFormData((prev) => ({
        ...prev,
        password_hash: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de mettre à jour le profil",
      );
    }
  };

  return {
    user,
    formData,
    setFormData,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    handleUpdate,
  };
}
