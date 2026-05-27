"use client";

import { useCallback, useEffect, useState } from "react";

import {
  adminDocumentsClient,
  type AdminDocument,
  type AdminDocumentUpdate,
} from "@/lib/admin/documentsClient";

interface UseAdminDocumentResult {
  document: AdminDocument | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (body: AdminDocumentUpdate) => Promise<AdminDocument>;
  remove: () => Promise<void>;
}

export function useAdminDocument(id: number | null): UseAdminDocumentResult {
  const [document, setDocument] = useState<AdminDocument | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (documentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDocumentsClient.get(documentId);
      setDocument(data);
    } catch (err) {
      setDocument(null);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id === null) return;
    void load(id);
  }, [id, load]);

  const refresh = useCallback(async () => {
    if (id === null) return;
    await load(id);
  }, [id, load]);

  const update = useCallback(
    async (body: AdminDocumentUpdate) => {
      if (id === null) throw new Error("No document id");
      const updated = await adminDocumentsClient.update(id, body);
      setDocument(updated);
      return updated;
    },
    [id],
  );

  const remove = useCallback(async () => {
    if (id === null) throw new Error("No document id");
    await adminDocumentsClient.remove(id);
  }, [id]);

  return { document, loading, error, refresh, update, remove };
}
