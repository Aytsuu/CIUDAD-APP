import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GADActivityFormSchema from "@/form-schema/gad-activity-schema";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/AuthContext";
import { Activity, Users, MapPin, Calendar } from "lucide-react";


type GADActivityFormData = z.infer<typeof GADActivityFormSchema>;

interface GADActivityFormProps {
  onSuccess?: () => void;
}

function GADActivityForm({ onSuccess }: GADActivityFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const form = useForm<GADActivityFormData>({
    resolver: zodResolver(GADActivityFormSchema),
    defaultValues: {
      activityTitle: "",
      activityDate: "",
      activityTime: "",
      venue: "",
      description: "",
      expectedParticipants: "",
    },
  });

  const handleSubmitActivity = async (values: GADActivityFormData) => {
    setIsSubmitting(true);
    
    // Mock API call - replace with actual API
    const activityData = {
      title: values.activityTitle,
      date: values.activityDate,
      time: values.activityTime,
      venue: values.venue,
      description: values.description,
      expectedParticipants: parseInt(values.expectedParticipants),
      staff: user?.staff?.staff_id || null,
      status: "upcoming",
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("GAD Activity created:", activityData);
      
      form.reset();
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating GAD activity:", error);
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsPreviewOpen(true);
    }
  };

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(handleSubmitActivity)();
    }
  };

  const handleConfirmPreview = () => {
    setIsPreviewOpen(false);
    handleSave();
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <div className="grid gap-4">
            <FormInput
              control={form.control}
              name="activityTitle"
              label="Activity Title"
              placeholder="Enter GAD Activity Title"
              readOnly={false}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="activityDate"
                type="date"
                label="Activity Date"
                readOnly={false}
              />

              <FormDateTimeInput
                control={form.control}
                name="activityTime"
                type="time"
                label="Activity Time"
                readOnly={false}
              />
            </div>

            <FormInput
              control={form.control}
              name="venue"
              label="Venue"
              placeholder="Enter venue or location"
              readOnly={false}
            />

            <FormInput
              control={form.control}
              name="expectedParticipants"
              label="Expected Participants"
              placeholder="Enter number of expected participants"
              type="number"
              readOnly={false}
            />

            <FormTextArea
              control={form.control}
              name="description"
              label="Activity Description"
              placeholder="Enter detailed description of the GAD activity"
              readOnly={false}
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <DialogLayout
              trigger={
                <Button
                  type="button"
                  className="bg-white text-black hover:bg-gray-100"
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              }
              className="w-full max-w-[800px] h-full flex flex-col overflow-auto scrollbar-custom"
              title="GAD Activity Preview"
              description="Review the activity details before saving"
              mainContent={
                <div className="w-full h-full p-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {form.watch("activityTitle") || "Activity Title"}
                      </h2>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Date & Time:</span>
                          <span>{form.watch("activityDate")} at {form.watch("activityTime")}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Venue:</span>
                          <span>{form.watch("venue")}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Users className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Expected Participants:</span>
                          <span>{form.watch("expectedParticipants")}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description:</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {form.watch("description")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmPreview}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Confirm & Save"}
                    </Button>
                  </div>
                </div>
              }
              isOpen={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
            />
            
            <ConfirmationModal
              trigger={
                <Button
                  type="button"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Activity"}
                </Button>
              }
              title="Save GAD Activity"
              description="Are you sure you want to create this Gender and Development activity?"
              actionLabel="Confirm"
              onClick={form.handleSubmit(handleSubmitActivity)}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

export default GADActivityForm;