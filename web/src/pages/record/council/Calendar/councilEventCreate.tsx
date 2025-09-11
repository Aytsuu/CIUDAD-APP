import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import AddEventFormSchema from "@/form-schema/council/addevent-schema";
import AttendanceSheetView from "./AttendanceSheetView";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useAddCouncilEvent, useAddAttendee } from "./queries/councilEventaddqueries";
import { useGetStaffList } from "./queries/councilEventfetchqueries";
import { formatDate } from "@/helpers/dateHelper";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SchedEventFormProps } from "./councilEventTypes";
import { useAuth } from "@/context/AuthContext";

function SchedEventForm({ onSuccess }: SchedEventFormProps) {
  const { user } = useAuth();
  const [selectedAttendees, setSelectedAttendees] = useState<{ name: string; designation: string }[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [ceId, setCeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: addEvent } = useAddCouncilEvent();
  const { mutate: addAttendee } = useAddAttendee();
  const { data: staffList = []} = useGetStaffList();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      roomPlace: "",
      eventCategory: undefined,
      eventTime: "",
      eventDescription: "",
      staffAttendees: [],
    },
  });

  const eventCategory = form.watch("eventCategory");

  const staffOptions = useMemo(() => {
    return staffList.map((staff) => ({
      id: staff.staff_id,
      name: staff.full_name,
    }));
  }, [staffList]);

  const staffAttendees = form.watch("staffAttendees");

  const selectedAttendeeDetails = useMemo(() => {
    const details = staffAttendees.map((staffId) => {
      const staff = staffList.find(
        (s) => s.staff_id.toLowerCase() === staffId.toLowerCase()
      );
      return {
        name: staff ? staff.full_name : `Unknown (ID: ${staffId})`,
        designation: staff
          ? staff.position_title || "No Designation"
          : "No Designation",
      };
    });
    return details;
  }, [staffAttendees, staffList]);

  useEffect(() => {
    setSelectedAttendees(selectedAttendeeDetails);
  }, [selectedAttendeeDetails]);

  const handleSubmitEvent = async (
    values: z.infer<typeof AddEventFormSchema>
  ) => {
    setIsSubmitting(true);
    const [hour, minute] = values.eventTime.split(":");
    const formattedTime = `${hour}:${minute}:00`;

    const eventData = {
      ce_title: values.eventTitle,
      ce_place: values.roomPlace,
      ce_date: formatDate(values.eventDate),
      ce_time: formattedTime,
      ce_type: values.eventCategory,
      ce_description: values.eventDescription,
      ce_is_archive: false,
      staff: user?.staff?.staff_id || null,
    };

    addEvent(eventData, {
      onSuccess: (ce_id) => {
        setCeId(ce_id);
        if (eventCategory === "meeting" && values.staffAttendees.length > 0) {
          values.staffAttendees.forEach((staffId) => {
            const staff = staffList.find(
              (s) => s.staff_id.toLowerCase() === staffId.toLowerCase()
            );
            addAttendee({
              staff_id: staff ? staff.staff_id : null,
              atn_present_or_absent: "Present",
              ce_id: ce_id,
              atn_name: staff ? staff.full_name : "Unknown",
              atn_designation: staff
                ? staff.position_title || "No Designation"
                : "No Designation",
            });
          });
        }
        form.reset();
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
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
      form.handleSubmit(handleSubmitEvent)();
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
              name="eventTitle"
              label="Event Title"
              placeholder="Enter Event Title"
              readOnly={false}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="eventDate"
                type="date"
                label="Event Date"
                readOnly={false}
              />

              <FormDateTimeInput
                control={form.control}
                name="eventTime"
                type="time"
                label="Event Time"
                readOnly={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="eventCategory"
                label="Event Category"
                options={[
                  { id: "meeting", name: "Meeting" },
                  { id: "activity", name: "Activity" },
                ]}
                readOnly={false}
              />

              <FormInput
                control={form.control}
                name="roomPlace"
                label="Room / Place"
                placeholder="Enter Room / Place"
                readOnly={false}
              />
            </div>

            <FormTextArea
              control={form.control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter Event Description"
              readOnly={false}
            />

            {eventCategory === "meeting" && (
              <div>
                <h1 className="flex justify-center font-bold text-[20px] text-[#394360] py-4">
                  ATTENDEES
                </h1>

                <FormComboCheckbox
                  control={form.control}
                  name="staffAttendees"
                  label="BARANGAY STAFF"
                  options={staffOptions}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {eventCategory === "activity" ? (
              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className=""
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                }
                title="Save Event"
                description="Proceed to scheduling the event?"
                actionLabel="Confirm"
                onClick={form.handleSubmit(handleSubmitEvent)}
              />
            ) : (
              <>
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
                  className="w-full max-w-[1000px] h-full flex flex-col overflow-auto scrollbar-custom"
                  title="Attendance Sheet Preview"
                  description="Review the attendance sheet before downloading"
                  mainContent={
                    <AttendanceSheetView
                      ce_id={ceId}
                      selectedAttendees={selectedAttendees}
                      activity={form.watch("eventTitle")}
                      date={form.watch("eventDate")}
                      time={form.watch("eventTime")}
                      place={form.watch("roomPlace")}
                      category={form.watch("eventCategory")}
                      description={form.watch("eventDescription")}
                      onConfirm={handleConfirmPreview}
                    />
                  }
                  isOpen={isPreviewOpen}
                  onOpenChange={setIsPreviewOpen}
                />
               <ConfirmationModal
                  trigger={
                    <Button
                      type="button"
                      className=""
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  }
                  title="Save Event"
                  description="Proceed to scheduling the event?"
                  actionLabel="Confirm"
                  onClick={form.handleSubmit(handleSubmitEvent)}
                />
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SchedEventForm;
