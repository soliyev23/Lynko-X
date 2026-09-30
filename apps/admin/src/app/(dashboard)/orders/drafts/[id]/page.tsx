"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Alert } from "@/components/ui";
import { DraftForm, type DraftData } from "@/components/DraftForm";

export default function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DraftData>(`/drafts/${id}`).then(setDraft).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!draft) return <div className="text-gray-400">{t("loading")}</div>;
  return <DraftForm draft={draft} />;
}
