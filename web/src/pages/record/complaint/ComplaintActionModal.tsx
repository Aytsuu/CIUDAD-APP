import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MdCheckCircle,
  MdCancel,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md";
import { AlertCircle } from "lucide-react";

type ActionType = "accept" | "reject" | "raise";

interface ComplaintActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType | null;
  complaintId: string;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

export function ComplaintActionModal({
  isOpen,
  onClose,
  actionType,
  onConfirm,
  isLoading = false,
}: ComplaintActionModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    // Validate rejection reason
    if (actionType === "reject" && !reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    // Call the confirm handler with reason if applicable
    onConfirm(actionType === "reject" ? reason : undefined);
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const getModalConfig = () => {
    switch (actionType) {
      case "accept":
        return {
          icon: <MdCheckCircle className="text-green-500" size={48} />,
          title: "Accept Complaint Request",
          description:
            "You are about to accept this blotter request. Please confirm that you have reviewed all the information.",
          confirmText: "Yes, Accept",
          confirmClass: "bg-green-500 hover:bg-green-600",
          showTextarea: false,
        };
      case "reject":
        return {
          icon: <MdCancel className="text-red-500" size={48} />,
          title: "Reject Complaint Request",
          description:
            "You are about to reject this blotter request. Please provide a reason for the rejection.",
          confirmText: "Confirm Rejection",
          confirmClass: "bg-red-500 hover:bg-red-600",
          showTextarea: true,
        };
      case "raise":
        return {
          icon: <MdTrendingUp className="text-blue-500" size={48} />,
          title: "Raise/Forward Complaint",
          description:
            "You are about to raise this complaint to the next level. This action will forward the case for further action.",
          confirmText: "Yes, Raise Issue",
          confirmClass: "bg-blue-500 hover:bg-blue-600",
          showTextarea: false,
        };
      default:
        return null;
    }
  };

  const config = getModalConfig();

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="space-y-0">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
              {config.icon}
            </div>
            <DialogTitle className="text-xl text-center">
              {config.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center text-base">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Textarea for rejection reason */}
          {config.showTextarea && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed reason for rejecting this complaint..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                rows={4}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Warning message for accept action */}
          {actionType === "accept" && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <MdWarning className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-yellow-800">
                Please ensure all complaint details have been thoroughly reviewed before accepting.
              </p>
            </div>
          )}

          {/* Info message for raise action */}
          {actionType === "raise" && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-blue-800">
                This complaint will be escalated to the appropriate authority for further investigation and action.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto ${config.confirmClass} text-white`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              config.confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}