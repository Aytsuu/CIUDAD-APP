import { useRef } from "react";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";

const useToastControl = () => {
  const toastStates = useRef({
    archiveIncome: false,
    archiveDisbursement: false,
    deleteIncome: false,
    deleteDisbursement: false,
  });

  const showToast = (type: "archive" | "delete", isIncome: boolean, success: boolean, message: string) => {
    const key = `${type}${isIncome ? "Income" : "Disbursement"}` as keyof typeof toastStates.current;
    if (!toastStates.current[key]) {
      toastStates.current[key] = true;
      toast[success ? "success" : "error"](message, {
        icon: success ? <CircleCheck size={24} className="fill-green-500 stroke-white" /> : <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
        onAutoClose: () => {
          toastStates.current[key] = false;
        },
      });
    }
  };

  return { showToast };
};

export default useToastControl;