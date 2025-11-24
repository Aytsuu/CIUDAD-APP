import {
  CheckCircle2,
  CircleAlert,
  X,
  Bell,
  FileText,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
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
    action: {
      label: (
        <X
          size={18}
          className="text-black/30 hover:text-black/70 transition-colors"
        />
      ),
      onClick: () => toast.dismiss(),
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
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
    action: {
      label: <X size={18} className="text-black" />,
      onClick: () => toast.dismiss(),
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
    },
  });
};

export const showPlainToast = (message: string) => {
  toast(message, {
    style: {
      padding: "16px",
      color: "#ffffff",
      background: "#5b5b5b",
    },
    action: {
      label: <X size={18} className="text-white" />,
      onClick: () => toast.dismiss(),
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
    },
  });
};

interface NotificationToastProps {
  title: string;
  description?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  timestamp?: string;
  onClick?: () => void;
  notif_type?: "REQUEST" | "REMINDER" | "INFO" | "REPORT" | "SUCCESS" | string;
}

const getTypeConfig = (type?: string) => {
  const baseClass = "w-10 h-10 rounded-full flex items-center justify-center";
  switch (type) {
    case "REQUEST":
      return (
        <div className={`${baseClass} bg-blue-100`}>
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
      );
    case "REMINDER":
      return (
        <div className={`${baseClass} bg-amber-100`}>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      );
    case "INFO":
      return (
        <div className={`${baseClass} bg-indigo-100`}>
          <Info className="w-5 h-5 text-indigo-600" />
        </div>
      );
    case "REPORT":
      return (
        <div className={`${baseClass} bg-red-100`}>
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
      );
    default:
      return (
        <div className={`${baseClass} bg-gray-100`}>
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      );
  }
};

export const showNotificationToast = ({
  title,
  description,
  timestamp,
  onClick,
  notif_type,
}: NotificationToastProps) => {
  const iconElement = getTypeConfig(notif_type);

  toast.custom(
    (t: any) => (
      <div
        onClick={() => {
          if (onClick) {
            onClick();
            toast.dismiss(t.id);
          }
        }}
        className={`
          relative flex items-start gap-3 rounded-lg bg-white border border-gray-200 
          shadow-lg p-4 w-[380px] transition-all duration-300
          ${onClick ? "cursor-pointer hover:shadow-xl" : ""}
          ${
            t.visible
              ? "animate-in fade-in slide-in-from-top-5"
              : "animate-out fade-out slide-out-to-top-5"
          }
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {iconElement}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                  {description}
                </p>
              )}
              {timestamp && (
                <p className="text-xs text-gray-400 mt-2">{timestamp}</p>
              )}
            </div>

            {/* Three dots menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    }
  );
};