import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IncomeImage, DisbursementImage } from "./fetchqueries";
import { 
  archiveIncomeImage,
  restoreIncomeImage,
  deleteIncomeImage,
  permanentDeleteIncomeImage,
  archiveDisbursementImage,
  restoreDisbursementImage,
  deleteDisbursementImage,
  permanentDeleteDisbursementImage,
} from "../api/delreq";
import useToastControl from "./toastcontrol";

export const useArchiveIncomeImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("archive", true, false, `Failed to archive income image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("archive", true, true, "Income image archived successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const useRestoreIncomeImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("archive", true, false, `Failed to restore income image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("archive", true, true, "Income image restored successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const useDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("delete", true, false, `Failed to delete income image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("delete", true, true, "Income image deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

export const usePermanentDeleteIncomeImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("delete", true, false, `Failed to permanently delete income image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("delete", true, true, "Income image permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeImages"] });
    }
  });
};

// Disbursement Image Mutations
export const useArchiveDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("archive", false, false, `Failed to archive disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("archive", false, true, "Disbursement image archived successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const useRestoreDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("archive", false, false, `Failed to restore disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("archive", false, true, "Disbursement image restored successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const useDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("delete", false, false, `Failed to delete disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("delete", false, true, "Disbursement image deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};

export const usePermanentDeleteDisbursementImage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastControl();

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
      showToast("delete", false, false, `Failed to permanently delete disbursement image: ${error.message}`);
    },
    onSuccess: () => {
      showToast("delete", false, true, "Disbursement image permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementImages"] });
    }
  });
};