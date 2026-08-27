import { useState, useEffect, useCallback } from "react";
import { CrudService, UndoAction } from "../types";

export function useCrud<T extends { id: string | number }, CreatePayload>(
  service: CrudService<T, CreatePayload>,
  initialCreateState: CreatePayload,
) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<Partial<T>>({});
  const [createForm, setCreateForm] =
    useState<CreatePayload>(initialCreateState);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await service.getAll();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startEdit = (item: T) => {
    setError("");
    setSuccess("");
    setEditingId(item.id);
    setEditForm(item);
  };

  const create = async (e: React.FormEvent, payload: CreatePayload) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await service.create(payload);
      setSuccess("Création réussie");
      setCreateForm(initialCreateState);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
    }
  };

  const updateWithUndo = (
    id: string | number,
    payload: Partial<T>,
    duration = 5000,
  ) => {
    setError("");
    setSuccess("");
    const previousData = [...data];

    setData(
      (prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...payload } : item,
        ) as T[],
    );
    setEditingId(null);

    const timerId = setTimeout(async () => {
      try {
        await service.update(id, payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de modification");
        setData(previousData);
      }
      setUndoAction(null);
    }, duration);

    setUndoAction({
      message: "Modification effectuée. Annulation possible pendant 3s.",
      duration,
      timerId,
      onUndo: () => {
        clearTimeout(timerId);
        setData(previousData);
        setUndoAction(null);
      },
    });
  };

  const deleteWithUndo = (id: string | number, duration = 3000) => {
    setError("");
    setSuccess("");
    const previousData = [...data];

    setData((prev) => prev.filter((item) => item.id !== id) as T[]);

    const timerId = setTimeout(async () => {
      try {
        await service.delete(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression");
        setData(previousData);
      }
      setUndoAction(null);
    }, duration);

    setUndoAction({
      message: "Suppression effectuée. Annulation possible pendant 3s.",
      duration,
      timerId,
      onUndo: () => {
        clearTimeout(timerId);
        setData(previousData);
        setUndoAction(null);
      },
    });
  };

  return {
    data,
    setData,
    error,
    success,
    isLoading,
    editingId,
    editForm,
    createForm,
    undoAction,
    setError,
    setSuccess,
    setEditingId,
    setEditForm,
    setCreateForm,
    setUndoAction,
    loadData,
    startEdit,
    create,
    updateWithUndo,
    deleteWithUndo,
  };
}
