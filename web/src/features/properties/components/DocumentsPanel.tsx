import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, Tag } from "@/components/ui/display";
import { Select } from "@/components/ui/form";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useUploadDocument, type PropertyDetail } from "../api";
import { DOCUMENT_TYPES } from "../constants";

export function DocumentsPanel({ property, canUpload }: { property: PropertyDetail; canUpload: boolean }) {
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument(property.id);
  const docs = property.documents ?? [];

  async function onFile(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File too large", "Documents must be under 15 MB.");
      return;
    }
    try {
      await upload.mutateAsync({ file, docType });
      toast.success("Document uploaded", `${docType}: ${file.name}`);
    } catch (err) {
      toast.error("Couldn't upload the document", getErrorMessage(err));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Panel
      title="Documents"
      description="Title deeds, site plans and signed agreements used for verification."
      flush
      actions={
        canUpload && (
          <div className="flex items-center gap-2">
            <Select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-7 w-40 text-xs" aria-label="Document type">
              {DOCUMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <input ref={inputRef} type="file" hidden accept=".pdf,image/*,.doc,.docx" onChange={(e) => onFile(e.target.files)} />
            <Button size="sm" icon={<Upload />} loading={upload.isPending} onClick={() => inputRef.current?.click()}>
              Upload
            </Button>
          </div>
        )
      }
    >
      {docs.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-subtle">No documents uploaded.</p>
      ) : (
        <ul className="divide-y divide-line">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
              <FileText className="size-4 shrink-0 text-ink-subtle" />
              <a href={d.file} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-brand hover:underline">
                {d.doc_type}
              </a>
              {d.verified && <Tag tone="success">Verified</Tag>}
              <span className="shrink-0 text-xs text-ink-subtle">{formatDate(d.uploaded_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
