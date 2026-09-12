import { apiClient } from "@/lib/api-client";
import type { PropertyMedia } from "../types";

export async function uploadPropertyMedia(
  propertyId: string,
  file: File,
  order: number
): Promise<PropertyMedia> {
  const formData = new FormData();
  formData.append("property", propertyId);
  formData.append("file", file);
  formData.append("media_type", "photo");
  formData.append("order", String(order));

  const { data } = await apiClient.post<PropertyMedia>("/property-media/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deletePropertyMedia(mediaId: string): Promise<void> {
  await apiClient.delete(`/property-media/${mediaId}/`);
}
