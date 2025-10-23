import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import {UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { usePostRaiseIssue } from "./api-operations/queries/complaintPostQueries";

export function RaiseIssueDialog({ complaintId }: { complaintId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending } = usePostRaiseIssue();

  const handleRaiseIssue = async () => {
    try {
      await mutateAsync(complaintId);
      toast.success("Issue raised successfully", {
        description: `Service Request created for Complaint ID: ${complaintId}`,
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to raise issue", {
        description: "Please try again later",
      });
    }
  };

  return (
    <DialogLayout
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          variant="outline"
          className="w-full h-full flex gap-2 border-0 font-normal justify-start shadow-none p-0"
        >
          <UploadIcon size={16} className="text-darkGray" />
          Raise Issue
        </Button>
      }
      title="Confirm Issue Raising"
      description="Are you sure you want to raise an issue for this complaint report?"
      mainContent={
        <>
          <p className="text-sm text-slate-600 mb-4">
            Complaint ID: <span className="font-medium">{complaintId}</span>
          </p>
          <p className="text-sm text-slate-600">
            This will notify the concerned authorities and automatically archive
            the complaint.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRaiseIssue}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </>
      }
    />
  );
}