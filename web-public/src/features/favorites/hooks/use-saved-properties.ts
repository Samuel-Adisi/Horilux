import { useCallback, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PropertyDetail } from "@/lib/types";

// Anonymous favorites: property IDs live in the visitor's browser, no account needed.
const STORAGE_KEY = "horilux-favorites";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function readIds(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function writeIds(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage blocked or full: favorites still work for this page session
  }
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedProperties() {
  const ids = useSyncExternalStore(subscribe, readIds);

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["favorite-property", id],
      queryFn: async () => {
        const { data } = await api.get<PropertyDetail>(`/public/properties/${id}/`);
        return data;
      },
      staleTime: 2 * 60 * 1000,
      retry: false,
    })),
  });

  const data = results.flatMap((r, i) => {
    if (!r.data) return [];
    const photo = [...(r.data.media ?? [])]
      .sort((a, b) => a.order - b.order)
      .find((m) => m.media_type === "photo" && m.url);
    const property_detail = {
      ...r.data,
      cover_image: r.data.cover_image ?? photo?.url ?? null,
    };
    return [{ id: ids[i], property: ids[i], property_detail }];
  });

  return {
    data,
    isLoading: results.some((r) => r.isLoading),
    isError: ids.length > 0 && results.every((r) => r.isError),
  };
}

export function useToggleSavedProperty() {
  const ids = useSyncExternalStore(subscribe, readIds);

  const isSaved = useCallback(
    (propertyId: string) => ids.includes(String(propertyId)),
    [ids]
  );

  const isPending = useCallback((_propertyId: string) => false, []);

  const toggle = useCallback((propertyId: string) => {
    const id = String(propertyId);
    const current = readIds();
    writeIds(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);
  }, []);

  return { isSaved, toggle, isPending };
}

export function useFavoritesCount() {
  return useSyncExternalStore(subscribe, readIds).length;
}
