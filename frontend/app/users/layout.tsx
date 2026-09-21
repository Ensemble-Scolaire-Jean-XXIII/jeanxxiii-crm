import type { Metadata } from "next";

export const metadata: Metadata = { title: "Utilisateurs" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}