import { useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  createIncomeImage,
  createDisbursementImage,
  archiveIncomeImage,
  restoreIncomeImage,
  deleteIncomeImage,
  permanentDeleteIncomeImage,
  archiveDisbursementImage,
  restoreDisbursementImage,
  deleteDisbursementImage,
  permanentDeleteDisbursementImage,
  getIncomeImages,
  getDisbursementImages, createFolder,
  updateDisbursementFolder, updateIncomeFolder,
  updateDisbursementImage, updateIncomeImage,
  restoreDisbursementFolder, restoreIncomeFolder,
  permanentDeleteDisbursementFolder, permanentDeleteIncomeFolder
} from "./requests";
import { useToastContext } from "@/components/ui/toast";
import { api } from "@/api/api";
import { router } from "expo-router";

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: CreateFolderFormValues): Promise<CreateFolderResponse> => {
      const folderData = await createFolder(data);
      return folderData;
    },
    onSuccess: (data: CreateFolderResponse) => {
      const type = data.type === "income" ? "income" : "disbursement";
      queryClient.invalidateQueries({ queryKey: [`${type}Folders`] });
      toast.success(`Folder created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });
};

export const useArchiveIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: archiveIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>(["incomeImages"]);
      
      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.map(image => 
          image.infi_num === infi_num 
            ? { ...image, infi_is_archive: true } 
            : image
        )
      );
      
      return { previousImages };
    },
    onError: (error: Error, _infi_num) => {
      toast.error(`Failed to archive income image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Income image archived successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const useRestoreIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: restoreIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>(["incomeImages"]);
      
      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.map(image => 
          image.infi_num === infi_num 
            ? { ...image, infi_is_archive: false } 
            : image
        )
      );
      
      return { previousImages };
    },
    onError: (error: Error, _infi_num) => {
      toast.error(`Failed to restore income image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Income image restored successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const useDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: deleteIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>(["incomeImages"]);
      
      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.filter(image => image.infi_num !== infi_num)
      );
      
      return { previousImages };
    },
    onError: (error: Error, _infi_num) => {
      toast.error(`Failed to delete income image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Income image deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const usePermanentDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: permanentDeleteIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>(["incomeImages"]);
      
      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.filter(image => image.infi_num !== infi_num)
      );
      
      return { previousImages };
    },
    onError: (error: Error, _infi_num) => {
      // toast.error(`Failed to permanently delete income image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Income image permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

// Disbursement Image Mutations
export const useArchiveDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: archiveDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>(["disbursementImages"]);
      
      queryClient.setQueryData<DisbursementImage[]>(["disbursementImages"], (old = []) =>
        old.map(image => 
          image.disf_num === disf_num 
            ? { ...image, disf_is_archive: true } 
            : image
        )
      );
      
      return { previousImages };
    },
    onError: (error: Error, _disf_num) => {
      toast.error(`Failed to archive disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Disbursement image archived successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const useRestoreDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: restoreDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>(["disbursementImages"]);
      
      queryClient.setQueryData<DisbursementImage[]>(["disbursementImages"], (old = []) =>
        old.map(image => 
          image.disf_num === disf_num 
            ? { ...image, disf_is_archive: false } 
            : image
        )
      );
      
      return { previousImages };
    },
    onError: (error: Error, _disf_num) => {
      toast.error(`Failed to restore disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Disbursement image restored successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const useDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: deleteDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>(["disbursementImages"]);
      
      queryClient.setQueryData<DisbursementImage[]>(["disbursementImages"], (old = []) =>
        old.filter(image => image.disf_num !== disf_num)
      );
      
      return { previousImages };
    },
    onError: (error: Error, _disf_num) => {
      toast.error(`Failed to delete disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Disbursement image deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const usePermanentDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: permanentDeleteDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>(["disbursementImages"]);
      
      queryClient.setQueryData<DisbursementImage[]>(["disbursementImages"], (old = []) =>
        old.filter(image => image.disf_num !== disf_num)
      );
      
      return { previousImages };
    },
    onError: (error: Error, _disf_num) => {
      // toast.error(`Failed to permanently delete disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Disbursement image permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export type Album = {
  id: number;
  type: "income" | "disbursement";
  year: string;
  images: ImageItem[];
  staff_names: string[];
  is_archive: boolean; 
  inf_name?: string;
  dis_name?: string;
};

export type ImageItem =
  | (IncomeImage & { type: "income" })
  | (DisbursementImage & { type: "disbursement" });

export type IncomeImage = {
  infi_num: number;
  infi_upload_date: string;
  infi_type: string;
  infi_name: string; 
  infi_path: string; 
  infi_url: string; 
  inf_num: number;
  staff_name?: string;
  inf_year: string;
  infi_is_archive: boolean;
  inf_name: string;
};

export type DisbursementImage = {
  disf_num: number;
  disf_upload_date: string;
  disf_type: string; 
  disf_name: string; 
  disf_path: string; 
  disf_url: string; 
  dis_num: number;
  staff_name?: string;
  dis_year: string;
  disf_is_archive: boolean;
  dis_name: string;
};

export const useGetIncomeImages = (archive: boolean = false, folderId: number | undefined = undefined) => {
  return useQuery<IncomeImage[], Error>({
    queryKey: ["incomeImages", archive, folderId],
    queryFn: () => getIncomeImages(archive, folderId).catch((error) => {
      console.error("Error fetching income images:", error);
      throw error;
    }),
    enabled: folderId === undefined || !!folderId, // Enable for all cases (null for all images, specific ID for folder)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDisbursementImages = (archive: boolean = false, folderId: number | undefined = undefined) => {
  return useQuery<DisbursementImage[], Error>({
    queryKey: ["disbursementImages", archive, folderId],
    queryFn: () => getDisbursementImages(archive, folderId).catch((error) => {
      console.error("Error fetching disbursement images:", error);
      throw error;
    }),
    enabled: folderId === undefined || !!folderId, // Enable for all cases
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export type IncomeFolder = {
  inf_num: number;
  inf_year: string;
  inf_name: string;
  inf_is_archive: boolean;
};

export type DisbursementFolder = {
  dis_num: number;
  dis_year: string;
  dis_name: string;
  dis_is_archive: boolean;
};

// Define the expected response type from useCreateFolder mutation
export interface CreateFolderResponse {
  id: number;
  type: "income" | "disbursement";
  name: string;
  year: number;
  is_archive: boolean;
  dis_num: number;
  inf_num: number;
}

// Define the form values type to match the schema
export interface CreateFolderFormValues {
  type: "income" | "disbursement";
  name: string;
  year: string;
}

export const useGetIncomeFolder = (inf_num: number | null) => {
  return useQuery<IncomeFolder, Error>({
    queryKey: ["incomeFolder", inf_num],
    queryFn: () => api.get(`treasurer/income-tab/folders/${inf_num}/`).then(res => res.data),
    enabled: !!inf_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDisbursementFolder = (dis_num: number | null) => {
  return useQuery<DisbursementFolder, Error>({
    queryKey: ["disbursementFolder", dis_num],
    queryFn: () => api.get(`treasurer/disbursement-tab/folders/${dis_num}/`).then(res => res.data),
    enabled: !!dis_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ id, type, data }: { id: number; type: "income" | "disbursement"; data: { name: string; year: string } }) => {
      const updateFn = type === "income" ? updateIncomeFolder : updateDisbursementFolder;
      const payload = type === "income"
        ? {
            inf_name: data.name,
            inf_year: data.year,
          }
        : {
            dis_name: data.name,
            dis_year: data.year,
          };
      return await updateFn(id, payload as any);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [`${variables.type}Folders`] });

      // Snapshot the previous value
      const previousFolders = queryClient.getQueryData([`${variables.type}Folders`]);

      // Optimistically update to the new value
      queryClient.setQueryData([`${variables.type}Folders`], (old: any) => {
        return old?.map((folder: any) => 
          folder[`${variables.type === "income" ? "inf_num" : "dis_num"}`] === variables.id
            ? { ...folder, ...variables.data }
            : folder
        );
      });

      return { previousFolders };
    },
    onSuccess: (data, variables) => {
      // Invalidate to ensure we have fresh data
      queryClient.invalidateQueries({ queryKey: [`${variables.type}Folders`] });
      toast.success(`Updated successfully`);
    },
    onError: (error, variables, context) => {
      // Rollback the optimistic update
      if (context?.previousFolders) {
        queryClient.setQueryData([`${variables.type}Folders`], context.previousFolders);
      }
      toast.error(`Failed to update folder: ${error.message}`);
    },
    onSettled: (data, error, variables) => {
      // Ensure we have fresh data after mutation completes
      queryClient.invalidateQueries({ queryKey: [`${variables.type}Folders`] });
      router.push("/treasurer/inc-disbursement/inc-disb-main");
    }
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext()

  return useMutation({
    mutationFn: async ({ id, type, data }: { id: number; type: "income" | "disbursement"; data: Partial<IncomeImage> | Partial<DisbursementImage> }) => {
      const updateFn = type === "income" ? updateIncomeImage : updateDisbursementImage
      const payload = type === "income"
        ? {
            infi_url: (data as Partial<IncomeImage>).infi_url ?? undefined,
            infi_path: (data as Partial<IncomeImage>).infi_path ?? undefined,
            infi_is_archive: (data as Partial<IncomeImage>).infi_is_archive ?? false,
          }
        : {
            disf_url: (data as Partial<DisbursementImage>).disf_url ?? undefined,
            disf_path: (data as Partial<DisbursementImage>).disf_path ?? undefined,
            disf_is_archive: (data as Partial<DisbursementImage>).disf_is_archive ?? false,
          };
      const res = await updateFn(id, payload)
      return { ...res, type, id }
    },
    onSuccess: (data) => {
      const type = data.type
      queryClient.invalidateQueries({ queryKey: [`${type}Images`] })
      toast.success(`Image updated successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to update image: ${error.message}`)
    },
  })
}


export const useUploadImage = (isIncome: boolean) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      upload_date: string;
      type: string;
      name: string;
      path: string;
      url: string;
      folder: number;
    }) => {
      const payload = isIncome
        ? {
            infi_upload_date: data.upload_date,
            infi_type: data.type,
            infi_name: data.name,
            infi_path: data.path,
            infi_url: data.url,
            inf_num: data.folder,
          }
        : {
            disf_upload_date: data.upload_date,
            disf_type: data.type,
            disf_name: data.name,
            disf_path: data.path,
            disf_url: data.url,
            dis_num: data.folder,
          };

      const endpoint = isIncome 
        ? 'treasurer/income-tab/images/' 
        : 'treasurer/disbursement-tab/images/';
      
      return api.post(endpoint, payload);
    },
    onSuccess: () => {
      const type = isIncome ? "income" : "disbursement";
      queryClient.invalidateQueries({ queryKey: [`${type}Images`] });
      toast.success("Image uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Image upload failed: ${error.message}`);
    }
  });
};

export const usePermanentDeleteIncomeFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: permanentDeleteIncomeFolder,
    onSuccess: () => {
      toast.success("Income folder and all images deleted");
      queryClient.invalidateQueries({ queryKey: ["incomeFolders"] });
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete income folder: ${error.message}`);
    }
  });
};

export const usePermanentDeleteDisbursementFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: permanentDeleteDisbursementFolder,
    onSuccess: () => {
      toast.success("Disbursement folder and all images deleted");
      queryClient.invalidateQueries({ queryKey: ["disbursementFolders"] });
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete disbursement folder: ${error.message}`);
    }
  });
};

export const useRestoreIncomeFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: restoreIncomeFolder,
    onSuccess: () => {
      toast.success("Income folder and all images restored");
      queryClient.invalidateQueries({ queryKey: ["incomeFolders"] });
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore income folder: ${error.message}`);
    }
  });
};

export const useRestoreDisbursementFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: restoreDisbursementFolder,
    onSuccess: () => {
      toast.success("Disbursement folder and all images restored");
      queryClient.invalidateQueries({ queryKey: ["disbursementFolders"] });
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore disbursement folder: ${error.message}`);
    }
  });
};