import type { Metadata } from "next";

export const metadata: Metadata = { title: "Templates d'email" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}