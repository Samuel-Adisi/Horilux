import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadPropertyMedia, deletePropertyMedia } from "../api/media";

export function useUploadPropertyMedia(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, order }: { file: File; order: number }) =>
      uploadPropertyMedia(propertyId, file, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeletePropertyMedia(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePropertyMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
