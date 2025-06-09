import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementViewSchema from "@/form-schema//Announcement/announcement-view";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateAnnouncement } from "./queries/announcementUpdateQueries";
import { useGetAnnouncement } from "./queries/announcementFetchQueries";


type AnnouncementViewProps = {
  ann_id: number;
  onSaveSuccess?: () => void;
};

function AnnouncementView({ ann_id, onSaveSuccess }: AnnouncementViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: announcements } = useGetAnnouncement();
  const { mutate: updateAnnouncement, isPending } = useUpdateAnnouncement();

  // Find the specific announcement
  const announcement = announcements?.find((a) => a.ann_id === ann_id);

  const form = useForm<z.infer<typeof AnnouncementViewSchema>>({
    resolver: zodResolver(AnnouncementViewSchema),
    defaultValues: {
      ann_title: announcement?.ann_title || "",
      ann_details: announcement?.ann_details || "",
      ann_start_at: typeof announcement?.ann_start_at === "string"
        ? announcement.ann_start_at
        : new Date().toISOString().split("T")[0],
      ann_end_at:
        typeof announcement?.ann_end_at === "string"
          ? announcement.ann_end_at
          : new Date().toISOString().split("T")[0],
      ann_type: announcement?.ann_type || "General",
      // staff: announcement?.staff || 0, // Assuming staff is a number, adjust as necessary
    },
  });

  const handleConfirmSave = () => {
    const values = form.getValues();
    // Convert string dates to Date objects if necessary
    const announcementInfo = {
      ...values,
      ann_id: Number(ann_id),
      ann_created_at: values.ann_created_at ? new Date(values.ann_created_at) : undefined,
      ann_start_at: values.ann_start_at ? new Date(values.ann_start_at) : undefined,
      ann_end_at: values.ann_end_at ? new Date(values.ann_end_at) : undefined,
    };
    updateAnnouncement(
      { ann_id, announcementInfo },
      {
        onSuccess: () => {
          setIsEditing(false);
          if (onSaveSuccess) onSaveSuccess();
        },
      }
    );
  };

  if (!announcement) {
    return <div className="text-center py-8">Loading announcement details...</div>;
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">ANNOUNCEMENT DETAILS</h2>
        <p className="text-xs text-black/50">View or edit announcement details</p>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-4">
          {/* Announcement Title */}
          <FormInput
            control={form.control}
            name="ann_title"
            label="Announcement Title"
            placeholder="Enter announcement title"
            readOnly={!isEditing}
          />
          {/* Announcement Details */}
          <FormInput
            control={form.control}
            name="ann_details"
            label="Announcement Details"
            placeholder="Enter announcement details"
            readOnly={!isEditing}
          />

          {/* Announcement Start Date */}
          <FormDateTimeInput
            control={form.control}
            name="ann_start_at"
            label="Start Date"
            readOnly={!isEditing}
            type={"time"}
          />

          {/* Announcement End Date */}
          <FormDateTimeInput
            control={form.control}
            name="ann_end_at"
            label="End Date"
            readOnly={!isEditing}
            type={"date"}
          />

          {/* Announcement Type */}
          <FormSelect
            control={form.control}
            name="ann_type"
            label="Type"
            options={[
              { id: "General", name: "General" },
              { id: "Urgent", name: "Urgent" },
            ]}
            readOnly={!isEditing}
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
            readOnly={!isEditing}
          /> */}
          {/* Staff
          <FormSelect
            control={form.control}
            name="staff"
            label="Staff"
            options={[
              { id: "Staff 1", name: "Staff 1" },
              { id: "Staff 2", name: "Staff 2" },
            ]}
            readOnly={!isEditing}
          /> */}

          {/* Edit/Save Button */}
          <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>

                <ConfirmationModal
                  trigger={
                    <Button
                      type="button"
                      className="bg-blue hover:bg-blue/90"
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  }
                  title="Confirm Save"
                  description="Are you sure you want to save the changes?"
                  actionLabel="Confirm"
                  onClick={handleConfirmSave}
                />
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue hover:bg-blue/90"
              >
                Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AnnouncementView;