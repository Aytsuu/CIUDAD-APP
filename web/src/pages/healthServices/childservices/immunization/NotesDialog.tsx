import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  isLoading: boolean;
  onSave: (formValues: any) => void;
  editingData?: any;
  historicalNotes?: any[]; // Add historicalNotes prop back
}

export function NotesDialog({ isOpen, onClose, form, isLoading, onSave, editingData, historicalNotes = [] }: NotesDialogProps) {
  // When dialog opens, autofill with historical notes AND current form values
  useEffect(() => {
    if (isOpen && editingData) {
      const currentDate = editingData.date;
      
      // Filter historical notes for the current date
      const filteredNotes = historicalNotes.filter((note) => 
        new Date(note.date).toISOString().split("T")[0] === currentDate
      );

      // Get the latest historical note
      const latestHistoricalNote = filteredNotes.length > 0 ? filteredNotes[0] : null;

      // Get current form values
      const currentFormValues = form.getValues();

      // Priority: Current form values > Latest historical note > Editing data
      const formData = {
        ...currentFormValues, // Keep all current form values
        notes: currentFormValues.notes || latestHistoricalNote?.notes || editingData.notes || "",
        follov_description: currentFormValues.follov_description || latestHistoricalNote?.follov_description || editingData.follov_description || "",
        followUpVisit: currentFormValues.followUpVisit || latestHistoricalNote?.followUpVisit || editingData.followUpVisit || "",
        followv_status: currentFormValues.followv_status || latestHistoricalNote?.followv_status || editingData.followv_status || "pending",
        date: editingData.date || new Date().toISOString().split("T")[0],
        chnotes_id: latestHistoricalNote?.chnotes_id || editingData.chnotes_id || ""
      };

      form.reset(formData);

      console.log("Autofill data:", {
        currentFormValues,
        latestHistoricalNote,
        editingData,
        finalFormData: formData
      });
    }
  }, [isOpen, editingData, form, historicalNotes]);

  if (!isOpen) return null;

  const handleSave = () => {
    const formValues = form.getValues();
    console.log("Saving notes with values:", formValues);
    onSave(formValues);
  };

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
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Notes"}
          </Button>
        </div>
      </div>
    </div>
  );
}