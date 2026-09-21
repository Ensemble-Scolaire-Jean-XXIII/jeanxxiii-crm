import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statuts" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}