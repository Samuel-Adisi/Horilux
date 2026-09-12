import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { usePropertyDetail } from "../hooks/use-property-detail";
import { useUploadPropertyMedia, useDeletePropertyMedia } from "../hooks/use-property-media";

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const BACK_ICON = "M19 12H5M12 19l-7-7 7-7";
const PIN_ICON = "M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z";
const UPLOAD_ICON = "M12 16V4M7 9l5-5 5 5M5 20h14";
const TRASH_ICON = "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12Z";
const CHEVRON_LEFT = "M15 18l-6-6 6-6";
const CHEVRON_RIGHT = "M9 18l6-6-6-6";
const HOME_ICON = "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5";
const TAG_ICON = "M20.5 13.5 13 21l-9-9V4h8l8.5 9.5ZM7.5 7.5h.01";
const BED_ICON = "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V7a1 1 0 0 1 1-1h6v4";
const BATH_ICON = "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 3-1.7M6 19v2M18 19v2";
const RULER_ICON = "M4 15 15 4l5 5-11 11H4v-5Zm9-6 3 3M8 12l2 2";
const BUILDING_ICON = "M6 21V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v17M6 21h13M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1M16 21v-6h4v6";
const CHECK_CIRCLE_ICON = "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const GAUGE_ICON = "M12 20a8 8 0 1 0-8-8M12 20v-4M12 12l4-4";

function Field({ label, value, icon }: { label: string; value: React.ReactNode; icon?: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11.5px] text-[#8A8578]">
        {icon && <Icon d={icon} width={12} height={12} className="text-[#B5AF9E]" />}
        {label}
      </p>
      <p className="mt-0.5 text-[13.5px] font-medium text-[#17131F]">{value ?? "—"}</p>
    </div>
  );
}

function HeroCarousel({ media, title }: { media: { id: string; file: string }[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = media.length;

  if (count === 0) {
    return <div className="h-[460px] w-full bg-[#EFEDE6]" />;
  }

  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  return (
    <div className="group/hero relative h-[460px] w-full overflow-hidden bg-[#17131F]">
      <img
        key={media[index].id}
        src={media[index].file}
        alt={title}
        className="h-full w-full object-cover"
      />

      {count > 1 && (
        <>
          {/* gradient so controls stay legible over bright photos */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#17131F] shadow-md transition-colors hover:bg-white"
            >
              <Icon d={CHEVRON_LEFT} width={16} height={16} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#17131F] shadow-md transition-colors hover:bg-white"
            >
              <Icon d={CHEVRON_RIGHT} width={16} height={16} />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
            {media.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[11.5px] font-medium text-white">
            {index + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoGallery({ propertyId, media }: { propertyId: string; media: { id: string; file: string }[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPropertyMedia(propertyId);
  const remove = useDeletePropertyMedia(propertyId);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    try {
      let order = media.length;
      for (const file of Array.from(files)) {
        await upload.mutateAsync({ file, order });
        order += 1;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-b border-[#EFEDE6] px-5 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[12px] font-medium text-[#3E3A31]">Photos</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-1.5 rounded-[6px] border border-[#D8D3C6] px-3 py-1.5 text-[12.5px] font-medium text-[#3E3A31] hover:bg-[#F7F6F3] disabled:opacity-50"
        >
          <Icon d={UPLOAD_ICON} width={13} height={13} />
          {upload.isPending ? "Uploading…" : "Add photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mb-2 text-[12.5px] text-[#8A2E2E]">{error}</p>}

      {media.length === 0 ? (
        <p className="text-[13px] text-[#8A8578]">No photos yet — add some to make this listing stand out.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-[6px] bg-[#EFEDE6]">
              <img src={m.file} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove.mutate(m.id)}
                disabled={remove.isPending}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <Icon d={TRASH_ICON} width={12} height={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading, isError } = usePropertyDetail(id);

  return (
    <AdminLayout>
      <button
        onClick={() => navigate("/properties")}
        className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-[#3E3A31] hover:text-[#240270]"
      >
        <Icon d={BACK_ICON} width={14} height={14} />
        Back to properties
      </button>

      {isLoading ? (
        <p className="text-[13px] text-[#8A8578]">Loading property…</p>
      ) : isError || !property || !id ? (
        <p className="text-[13px] text-[#8A2E2E]">Couldn't load this property.</p>
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#E4E1D9] bg-white">
          <HeroCarousel media={property.media} title={property.title} />

          <div className="border-b border-[#EFEDE6] px-5 py-4">
            <h2 className="text-[18px] font-semibold text-[#17131F]">{property.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#8A8578]">
              <Icon d={PIN_ICON} width={13} height={13} />
              {property.location}
            </p>
            <p className="mt-2.5 text-[18px] font-semibold text-[#240270]">
              {Number(property.price).toLocaleString(undefined, {
                style: "currency",
                currency: property.currency || "GHS",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-[#EFEDE6] px-5 py-4 sm:grid-cols-4">
            <Field icon={HOME_ICON} label="Type" value={<span className="capitalize">{property.property_type}</span>} />
            <Field icon={TAG_ICON} label="Listing" value={<span className="capitalize">{property.listing_type}</span>} />
            <Field icon={BED_ICON} label="Bedrooms" value={property.bedrooms} />
            <Field icon={BATH_ICON} label="Bathrooms" value={property.bathrooms} />
            <Field icon={RULER_ICON} label="Land size" value={property.land_size} />
            <Field icon={BUILDING_ICON} label="Building size" value={property.building_size} />
            <Field
              icon={CHECK_CIRCLE_ICON}
              label="Status"
              value={<span className="capitalize">{property.status.replace(/_/g, " ")}</span>}
            />
            <Field icon={GAUGE_ICON} label="Completion" value={`${property.completion_percent}%`} />
          </div>

          <PhotoGallery propertyId={id} media={property.media} />

          <div className="border-b border-[#EFEDE6] px-5 py-4">
            <p className="mb-2 text-[12px] font-medium text-[#3E3A31]">Description</p>
            <p className="text-[13.5px] leading-relaxed text-[#3E3A31]">
              {property.description || "No description provided."}
            </p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="border-b border-[#EFEDE6] px-5 py-4">
              <p className="mb-2 text-[12px] font-medium text-[#3E3A31]">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-[#E4E1D9] bg-[#FAF9F6] px-2.5 py-1 text-[11.5px] font-medium capitalize text-[#3E3A31]"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 py-4">
            <p className="mb-2 text-[12px] font-medium text-[#3E3A31]">Owner</p>
            <p className="text-[13.5px] font-medium text-[#17131F]">{property.owner_detail.name}</p>
            <p className="text-[13px] text-[#8A8578]">
              {property.owner_detail.phone}
              {property.owner_detail.email ? ` · ${property.owner_detail.email}` : ""}
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}