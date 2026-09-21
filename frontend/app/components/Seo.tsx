"use client";

import { useEffect } from "react";

const SITE_NAME = "CRM | Ensemble Scolaire Jean XXIII";

export default function Seo({ title }: { title: string }) {
  useEffect(() => {
    document.title = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  }, [title]);

  return null;
}