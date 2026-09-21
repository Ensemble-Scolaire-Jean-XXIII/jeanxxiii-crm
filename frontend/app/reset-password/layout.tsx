import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}