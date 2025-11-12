import { CheckCircle2, CircleAlert, X, Bell } from "lucide-react";
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
      label: <X size={18} className="text-black/30 hover:text-black/70 transition-colors"/>,
      onClick: () => toast.dismiss()
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
    }
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
      label: <X size={18} className="text-black"/>,
      onClick: () => toast.dismiss()
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
    }
  });
};

export const showPlainToast = (message: string) => {
  toast(message, {
    style: {
      padding: "16px",
      color: "#ffffff",
      background: "#5b5b5b"
    },
    action: {
      label: <X size={18} className="text-white"/>,
      onClick: () => toast.dismiss()
    },
    actionButtonStyle: {
      background: "transparent",
      border: "none",
      padding: "4px",
    }
  })
}

interface NotificationToastProps {
  title: string;
  description?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  timestamp?: string;
  onClick?: () => void;
}

export const showNotificationToast = ({
  title,
  description,
  avatarSrc,
  avatarFallback = "S",
  timestamp,
  onClick,
}: NotificationToastProps) => {
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
          flex items-start gap-3 rounded-lg border shadow-lg p-4 w-[400px] 
          transition-all duration-300 backdrop-blur-sm
          ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''}
          ${t.visible ? "animate-in fade-in slide-in-from-top-5" : "animate-out fade-out slide-out-to-top-5"}
          bg-white border-gray-200
        `}
      >
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {avatarSrc ? (
            <div className="relative">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="h-12 w-12 rounded-full ring-2 ring-blue-100 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow-md">
                <Bell className="text-white" size={12} />
              </div>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-blue-100 shadow-md">
              <span className="text-white font-semibold text-sm">
                {avatarFallback.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm leading-snug">
              {title}
            </p>
            {timestamp && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                {timestamp}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 leading-snug line-clamp-2">
              {description}
            </p>
          )}

          {/* Action hint */}
          {onClick && (
            <p className="text-xs text-blue-600 mt-2 font-medium">
              Click to view →
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    }
  );
};