import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Loader2 } from "lucide-react";

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: any; // You might want to create a proper type for your form
  isLoading: boolean;
  onSave: (formValues: any) => void;
}

export function NotesDialog({
  isOpen,
  onClose,
  form,
  isLoading,
  onSave,
}: NotesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormTextArea
              control={form.control}
              label="Clinical Notes"
              name="notes"
              placeholder="Enter clinical notes..."
              className="w-full min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <FormTextArea
              label="Follow-up Reason"
              control={form.control}
              name="follov_description"
              placeholder="Enter follow-up reason..."
              className="w-full min-h-[100px]"
            />
            <FormDateTimeInput
              control={form.control}
              name="followUpVisit"
              label="Follow-up date"
              type="date"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const formValues = form.getValues();
              onSave(formValues);
              onClose();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Notes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}