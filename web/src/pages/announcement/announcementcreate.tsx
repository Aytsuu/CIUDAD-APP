import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementCreateSchema from "@/form-schema/Announcement/announcement-create";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useAddAnnouncement } from "./queries/announcementAddQueries";

interface AnnouncementCreateFormProps {
  onSuccess?: () => void; // Add this prop type
}

function AnnouncementCreateForm({ onSuccess }: AnnouncementCreateFormProps) {
  const form = useForm<z.infer<typeof AnnouncementCreateSchema>>({
    resolver: zodResolver(AnnouncementCreateSchema),
    defaultValues: {
      // don_num: 0,
      ann_title: "",  
      ann_details: "",
      ann_start_at: new Date().toISOString().split("T")[0],
      ann_end_at: new Date().toISOString().split("T")[0],
      ann_type: "General",
      // staff: 0, // Assuming staff is a number, adjust as necessary
    },
  });

  const { mutate: addAnnouncement, isPending } = useAddAnnouncement();

  const onSubmit = (values: z.infer<typeof AnnouncementCreateSchema>) => {
    const toastId = toast.loading('Submitting entry...', {
      duration: Infinity  
    });

    // Ensure ann_created_at is always a Date
    const payload = {
      ...values,
      ann_created_at: values.ann_created_at
        ? new Date(values.ann_created_at)
        : new Date(),
      ann_start_at: values.ann_start_at ? new Date(values.ann_start_at) : new Date(),
      ann_end_at: values.ann_end_at ? new Date(values.ann_end_at) : new Date(),
    };

    addAnnouncement(payload, {
      onSuccess: () => {
        toast.success('Announcement entry recorded successfully', {
          id: toastId,
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000,
          onAutoClose: () => {
            if (onSuccess) onSuccess();
          }
        });
      },
      onError: (error) => {
        toast.error(
          "Failed to submit announcement. Please check the input data and try again.",
          {
            id: toastId,
            duration: 2000
          }
        );
        console.error("Error submitting announcement", error);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD ANNOUNCEMENT</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Announcement Title */}
            <FormInput  
              control={form.control}
              name="ann_title"
              label="Announcement Title"
              placeholder="Enter announcement title"
              readOnly={false}
            />

            {/* Announcement Details */}
            <FormInput
              control={form.control}
              name="ann_title"
              label="Announcement Title"
              placeholder="Enter announcement title"
              readOnly={false}
            />

            {/* Announcement Details */}
            <FormInput
              control={form.control}
              name="ann_details"
              label="Announcement Details"
              placeholder="Enter announcement details"
              readOnly={false}
            />

            {/* Announcement Start Date */}
            <FormDateTimeInput
              control={form.control}
              name="ann_start_at"
              label="Start Date"
              readOnly={false} type={"time"}            />

            {/* Announcement End Date */}
            <FormDateTimeInput
              control={form.control}
              name="ann_end_at"
              label="End Date"
              readOnly={false} type={"date"}            />

            {/* Announcement Type */}
            <FormSelect
              control={form.control}
              name="ann_type"
              label="Type"
              options={[
                { id: "General", name: "General" },
                { id: "Urgent", name: "Urgent" },
              ]}
              readOnly={false}
            />
            {/* Staff
            <FormSelect
              control={form.control}
              name="staff"
              label="Staff"
              options={[
                { id: "Staff 1", name: "Staff 1" },
                { id: "Staff 2", name: "Staff 2" },
              ]}
              readOnly={false}
            /> */}


            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
            <Button
                type="submit"
                className="bg-blue hover:bg-blue/90"
                disabled={isPending} // Disable button during submission
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AnnouncementCreateForm;