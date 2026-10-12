import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/display";
import { ConfirmDialog } from "@/components/ui/overlay";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useDeleteMedia, useReorderMedia, useUploadMedia, type PropertyDetail, type PropertyMedia } from "../api";

const MAX_BYTES = 10 * 1024 * 1024;

export function MediaGallery({ property, canUpload, canDelete }: { property: PropertyDetail; canUpload: boolean; canDelete: boolean }) {
  const media = [...property.media].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [toDelete, setToDelete] = useState<PropertyMedia | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia(property.id);
  const remove = useDeleteMedia();
  const reorder = useReorderMedia();
  const current = media[Math.min(index, media.length - 1)];
  const coverId = media.find((m) => m.media_type === "photo")?.id;
  const canArrange = canUpload && media.length > 1 && !reorder.isPending;

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list);
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    const ok = files.filter((f) => f.size <= MAX_BYTES && (f.type.startsWith("image/") || f.type.startsWith("video/")));
    if (tooBig.length) toast.error(`${tooBig.length} file${tooBig.length > 1 ? "s" : ""} skipped`, "Files must be under 10 MB.");
    let order = media.length ? Math.max(...media.map((m) => m.order)) + 1 : 0;
    setUploading({ done: 0, total: ok.length });
    let failed = 0;
    for (const file of ok) {
      try {
        await upload.mutateAsync({ file, order: order++ });
      } catch (err) {
        failed += 1;
        if (failed === 1) toast.error(`Couldn't upload ${file.name}`, getErrorMessage(err));
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    setUploading(null);
    if (ok.length - failed > 0) toast.success(`${ok.length - failed} file${ok.length - failed > 1 ? "s" : ""} uploaded`);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      setIndex(0);
      toast.success("Photo removed");
    } catch (err) {
      toast.error("Couldn't remove the photo", getErrorMessage(err));
    } finally {
      setToDelete(null);
    }
  }

  async function applyOrder(next: PropertyMedia[], focusId: string) {
    const changes = next
      .map((m, i) => ({ id: m.id, order: i, was: m.order }))
      .filter((c) => c.order !== c.was)
      .map((c) => ({ id: c.id, order: c.order }));
    if (!changes.length) return;
    try {
      await reorder.mutateAsync(changes);
      setIndex(next.findIndex((m) => m.id === focusId));
      toast.success("Photo order saved");
    } catch (err) {
      toast.error("Couldn't save the new order", getErrorMessage(err));
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= media.length || from === to) return;
    const next = [...media];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    void applyOrder(next, item.id);
  }

  return (
    <Panel
      flush
      title="Photos & video"
      description={media.length ? `${media.length} file${media.length > 1 ? "s" : ""}` : undefined}
      actions={
        canUpload && (
          <>
            <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <Button size="sm" icon={<ImagePlus />} loading={!!uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? `Uploading ${uploading.done}/${uploading.total}` : "Add files"}
            </Button>
          </>
        )
      }
    >
      {media.length === 0 ? (
        <button
          type="button"
          disabled={!canUpload}
          onClick={() => inputRef.current?.click()}
          className="flex h-56 w-full flex-col items-center justify-center gap-2 text-sm text-ink-subtle enabled:hover:bg-surface-sunken"
        >
          <ImagePlus className="size-6 text-ink-faint" />
          {canUpload ? "No photos yet. Click to add some — listings need at least one." : "No photos yet."}
        </button>
      ) : (
        <div>
          <div className="group relative aspect-[16/9] bg-black">
            {current.media_type === "video" ? (
              <video key={current.id} src={current.file} controls className="h-full w-full object-contain" />
            ) : (
              <img key={current.id} src={current.file} alt={property.title} className="h-full w-full object-cover" />
            )}
            {current.id === coverId && (
              <span className="absolute left-3 top-3 rounded-sm bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Cover photo</span>
            )}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + media.length) % media.length)}
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-raise hover:bg-white"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % media.length)}
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-raise hover:bg-white"
                  aria-label="Next"
                >
                  <ChevronRight className="size-4" />
                </button>
                <span className="num absolute bottom-3 right-3 rounded-sm bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                  {index + 1} / {media.length}
                </span>
              </>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setToDelete(current)}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100 focus:opacity-100"
                aria-label="Remove this file"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          {canUpload && media.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
              {current.media_type === "photo" && current.id !== coverId && (
                <Button size="sm" variant="primary" icon={<Star />} disabled={reorder.isPending} onClick={() => move(index, 0)}>
                  Set as cover
                </Button>
              )}
              {current.id === coverId && <span className="text-xs font-semibold text-brand-fg">This is the cover photo</span>}
              <Button size="sm" icon={<ArrowLeft />} disabled={!canArrange || index === 0} onClick={() => move(index, index - 1)}>
                Move earlier
              </Button>
              <Button size="sm" icon={<ArrowRight />} disabled={!canArrange || index === media.length - 1} onClick={() => move(index, index + 1)}>
                Move later
              </Button>
              <span className="ml-auto text-xs text-ink-subtle">Drag thumbnails to rearrange. The first photo is the cover.</span>
            </div>
          )}
          {media.length > 1 && (
            <div className="scrollbar-thin flex gap-2 overflow-x-auto p-3">
              {media.map((m, i) => (
                <div
                  key={m.id}
                  draggable={canArrange}
                  onDragStart={() => setDragId(m.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId && dragId !== m.id) move(media.findIndex((x) => x.id === dragId), i);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                  className={cn("relative h-14 w-20 shrink-0", dragId === m.id && "opacity-40")}
                >
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative h-full w-full overflow-hidden rounded-sm border-2 transition-colors",
                      i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
                    )}
                    aria-label={`Show file ${i + 1}`}
                  >
                    {m.media_type === "video" ? (
                      <span className="flex h-full w-full items-center justify-center bg-black text-2xs font-bold text-white">VIDEO</span>
                    ) : (
                      <img src={m.file} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
                    )}
                  </button>
                  {m.id === coverId && (
                    <span className="pointer-events-none absolute left-1 top-1 rounded-sm bg-brand px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove this file?"
        description="It will be deleted from the listing."
        confirmLabel="Remove"
        tone="danger"
        loading={remove.isPending}
      />
    </Panel>
  );
}
