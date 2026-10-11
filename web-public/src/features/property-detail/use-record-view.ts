import { useEffect } from "react";
import { api } from "@/lib/api";

export function useRecordView(id: string | undefined) {
  useEffect(() => {
    if (!id) return;
    const key = "horilux-viewed-" + id;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: the backend still rate-limits per visitor
    }
    api.post("/public/properties/" + id + "/view/").catch(() => {});
  }, [id]);
}
