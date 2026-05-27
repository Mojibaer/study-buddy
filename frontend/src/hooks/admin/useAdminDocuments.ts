"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  adminDocumentsClient,
  type AdminDocument,
  type AdminDocumentsFilter,
  type BulkDeleteResponse,
} from "@/lib/admin/documentsClient";

interface UseAdminDocumentsResult {
  documents: AdminDocument[];
  loading: boolean;
  error: string | null;
  filter: AdminDocumentsFilter;
  setFilter: (next: AdminDocumentsFilter) => void;
  refresh: () => Promise<void>;
  selectedIds: Set<number>;
  toggleSelected: (id: number) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  bulkDelete: (ids: number[]) => Promise<BulkDeleteResponse>;
}

export function useAdminDocuments(): UseAdminDocumentsResult {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminDocumentsFilter>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filterKey = useMemo(() => JSON.stringify(filter), [filter]);

  const load = useCallback(async (current: AdminDocumentsFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDocumentsClient.list(current);
      setDocuments(data);
      setSelectedIds((prev) => {
        const next = new Set<number>();
        const present = new Set(data.map((d) => d.id));
        for (const id of prev) if (present.has(id)) next.add(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(JSON.parse(filterKey) as AdminDocumentsFilter);
  }, [filterKey, load]);

  const refresh = useCallback(() => load(filter), [filter, load]);

  const toggleSelected = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === documents.length) return new Set();
      return new Set(documents.map((d) => d.id));
    });
  }, [documents]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const bulkDelete = useCallback(async (ids: number[]) => {
    const result = await adminDocumentsClient.bulkDelete(ids);
    const removed = new Set(result.deleted);
    setDocuments((prev) => prev.filter((d) => !removed.has(d.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of removed) next.delete(id);
      return next;
    });
    return result;
  }, []);

  return {
    documents,
    loading,
    error,
    filter,
    setFilter,
    refresh,
    selectedIds,
    toggleSelected,
    toggleAll,
    clearSelection,
    bulkDelete,
  };
}
