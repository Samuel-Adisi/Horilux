import { useEffect } from "react";

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · Horilux` : "Horilux Estates";
  }, [title]);
}
