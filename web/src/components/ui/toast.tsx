import { CheckCircle2, CircleAlert } from "lucide-react";
import { toast } from "sonner";

export const showErrorToast = (message: string) => {
  toast(message, {
    icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
    style: {
      border: "1px solid rgb(225, 193, 193)",
      padding: "16px",
      color: "#b91c1c",
      background: "#fef2f2",
    },
  });
};

export const showSuccessToast = (message: string) => {
  toast(message, {
    icon: <CheckCircle2 size={24} className="fill-green-500 stroke-white" />,
    style: {
      border: "1px solid rgb(187, 247, 208)",
      padding: "16px",
      color: "#15803d",
      background: "#f0fdf4",
    },
  });
};
