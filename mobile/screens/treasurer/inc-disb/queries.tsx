import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  archiveIncomeImage,
  restoreIncomeImage,
  deleteIncomeImage,
  permanentDeleteIncomeImage,
  archiveDisbursementImage,
  restoreDisbursementImage,
  deleteDisbursementImage,
  permanentDeleteDisbursementImage,
  getIncomeImages,
  getDisbursementImages,
  createFolder,
  updateDisbursementFolder,
  updateIncomeFolder,
  permanentDeleteDisbursementFolder,
  permanentDeleteIncomeFolder,
} from "./requests";
import { useToastContext } from "@/components/ui/toast";
import { api } from "@/api/api";
import { router } from "expo-router";
import {
  CreateFolderFormValues,
  CreateFolderResponse,
  IncomeImage,
  DisbursementImage,
  IncomeFolder,
  DisbursementFolder,
} from "./inc-disc-types";

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (
      data: CreateFolderFormValues
    ): Promise<CreateFolderResponse> => {
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
      const previousImages = queryClient.getQueryData<IncomeImage[]>([
        "incomeImages",
      ]);

      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.map((image) =>
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
    },
  });
};

export const useRestoreIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: restoreIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>([
        "incomeImages",
      ]);

      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.map((image) =>
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
    },
  });
};

export const useDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: deleteIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>([
        "incomeImages",
      ]);

      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.filter((image) => image.infi_num !== infi_num)
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
    },
  });
};

export const usePermanentDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: permanentDeleteIncomeImage,
    onMutate: async (infi_num) => {
      await queryClient.cancelQueries({ queryKey: ["incomeImages"] });
      const previousImages = queryClient.getQueryData<IncomeImage[]>([
        "incomeImages",
      ]);

      queryClient.setQueryData<IncomeImage[]>(["incomeImages"], (old = []) =>
        old.filter((image) => image.infi_num !== infi_num)
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
    },
  });
};

export const useArchiveDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); 

  return useMutation({
    mutationFn: archiveDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>([
        "disbursementImages",
      ]);

      queryClient.setQueryData<DisbursementImage[]>(
        ["disbursementImages"],
        (old = []) =>
          old.map((image) =>
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
    },
  });
};

export const useRestoreDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: restoreDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>([
        "disbursementImages",
      ]);

      queryClient.setQueryData<DisbursementImage[]>(
        ["disbursementImages"],
        (old = []) =>
          old.map((image) =>
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
    },
  });
};

export const useDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: deleteDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>([
        "disbursementImages",
      ]);

      queryClient.setQueryData<DisbursementImage[]>(
        ["disbursementImages"],
        (old = []) => old.filter((image) => image.disf_num !== disf_num)
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
    },
  });
};

export const usePermanentDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); // Use toast directly from context

  return useMutation({
    mutationFn: permanentDeleteDisbursementImage,
    onMutate: async (disf_num) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementImages"] });
      const previousImages = queryClient.getQueryData<DisbursementImage[]>([
        "disbursementImages",
      ]);

      queryClient.setQueryData<DisbursementImage[]>(
        ["disbursementImages"],
        (old = []) => old.filter((image) => image.disf_num !== disf_num)
      );

      return { previousImages };
    },
    onError: (error: Error, _disf_num) => {
    },
    onSuccess: () => {
      toast.success("Disbursement image permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    },
  });
};

export const useGetIncomeImages = (
  archive: boolean = false,
  folderId: number | undefined = undefined
) => {
  return useQuery<IncomeImage[], Error>({
    queryKey: ["incomeImages", archive, folderId],
    queryFn: () =>
      getIncomeImages(archive, folderId).catch((error) => {
        console.error("Error fetching income images:", error);
        throw error;
      }),
    enabled: folderId === undefined || !!folderId, // Enable for all cases (null for all images, specific ID for folder)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDisbursementImages = (
  archive: boolean = false,
  folderId: number | undefined = undefined
) => {
  return useQuery<DisbursementImage[], Error>({
    queryKey: ["disbursementImages", archive, folderId],
    queryFn: () =>
      getDisbursementImages(archive, folderId).catch((error) => {
        console.error("Error fetching disbursement images:", error);
        throw error;
      }),
    enabled: folderId === undefined || !!folderId, // Enable for all cases
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetIncomeFolder = (inf_num: number | null) => {
  return useQuery<IncomeFolder, Error>({
    queryKey: ["incomeFolder", inf_num],
    queryFn: () =>
      api
        .get(`treasurer/income-tab/folders/${inf_num}/`)
        .then((res) => res.data),
    enabled: !!inf_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDisbursementFolder = (dis_num: number | null) => {
  return useQuery<DisbursementFolder, Error>({
    queryKey: ["disbursementFolder", dis_num],
    queryFn: () =>
      api
        .get(`treasurer/disbursement-tab/folders/${dis_num}/`)
        .then((res) => res.data),
    enabled: !!dis_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({
      id,
      type,
      data,
    }: {
      id: number;
      type: "income" | "disbursement";
      data: { name: string; year: string; desc?: string };
    }) => {
      const updateFn =
        type === "income" ? updateIncomeFolder : updateDisbursementFolder;
      const payload =
        type === "income"
          ? {
              inf_name: data.name,
              inf_year: data.year,
              inf_desc: data.desc,
            }
          : {
              dis_name: data.name,
              dis_year: data.year,
              dis_desc: data.desc,
            };
      return await updateFn(id, payload as any);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [`${variables.type}Folders`],
      });

      const previousFolders = queryClient.getQueryData([
        `${variables.type}Folders`,
      ]);

      queryClient.setQueryData([`${variables.type}Folders`], (old: any) => {
        return old?.map((folder: any) =>
          folder[`${variables.type === "income" ? "inf_num" : "dis_num"}`] ===
          variables.id
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
        queryClient.setQueryData(
          [`${variables.type}Folders`],
          context.previousFolders
        );
      }
      toast.error(`Failed to update folder: ${error.message}`);
    },
    onSettled: (data, error, variables) => {
      // Ensure we have fresh data after mutation completes
      queryClient.invalidateQueries({ queryKey: [`${variables.type}Folders`] });
      router.push("/(treasurer)/inc-disbursement/inc-disb-main");
    },
  });
};

export const useUploadImages = (isIncome: boolean) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      inf_num?: number;
      dis_num?: number;
      files: Array<{
        name: string;
        type: string;
        file: string; // Base64 data URL
      }>;
    }) => {
      const endpoint = isIncome
        ? "treasurer/income-tab/images/"
        : "treasurer/disbursement-tab/images/";

      return api.post(endpoint, data);
    },
    onSuccess: (response, variables) => {
      const type = isIncome ? "income" : "disbursement";
      queryClient.invalidateQueries({ queryKey: [`${type}Images`] });
      queryClient.invalidateQueries({ queryKey: [`${type}Folders`] });
      
      const uploadedCount = response.data?.uploaded_count || variables.files.length;
      toast.success(`${uploadedCount} images uploaded successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Image upload failed: ${error.message}`);
    },
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
    },
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
    },
  });
};