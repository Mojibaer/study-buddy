"use client";

import { useCallback, useEffect, useState } from "react";

import {
  adminStructureClient,
  type StructureOverview,
} from "@/lib/admin/structureClient";

interface UseAdminStructureResult {
  overview: StructureOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSemester: (name: string) => Promise<void>;
  renameSemester: (id: number, name: string) => Promise<void>;
  deleteSemester: (id: number, force?: boolean) => Promise<void>;
  createSubject: (name: string, semesterId: number) => Promise<void>;
  updateSubject: (
    id: number,
    body: { name?: string; semester_id?: number },
  ) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  renameCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export function useAdminStructure(): UseAdminStructureResult {
  const [overview, setOverview] = useState<StructureOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminStructureClient.overview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  const wrap = useCallback(
    <T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
      async (...args: T) => {
        await fn(...args);
        await load();
      },
    [load],
  );

  return {
    overview,
    loading,
    error,
    refresh,
    createSemester: wrap((name: string) =>
      adminStructureClient.createSemester(name),
    ),
    renameSemester: wrap((id: number, name: string) =>
      adminStructureClient.renameSemester(id, name),
    ),
    deleteSemester: wrap((id: number, force = false) =>
      adminStructureClient.deleteSemester(id, force),
    ),
    createSubject: wrap((name: string, semesterId: number) =>
      adminStructureClient.createSubject(name, semesterId),
    ),
    updateSubject: wrap(
      (id: number, body: { name?: string; semester_id?: number }) =>
        adminStructureClient.updateSubject(id, body),
    ),
    deleteSubject: wrap((id: number) => adminStructureClient.deleteSubject(id)),
    createCategory: wrap((name: string) =>
      adminStructureClient.createCategory(name),
    ),
    renameCategory: wrap((id: number, name: string) =>
      adminStructureClient.renameCategory(id, name),
    ),
    deleteCategory: wrap((id: number) =>
      adminStructureClient.deleteCategory(id),
    ),
  };
}
