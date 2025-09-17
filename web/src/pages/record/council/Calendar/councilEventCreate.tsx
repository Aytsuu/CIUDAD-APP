import { useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import AddEventFormSchema from "@/form-schema/council/addevent-schema";
import AttendanceSheetView from "./AttendanceSheetView";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useAddCouncilEvent } from "./queries/councilEventaddqueries";
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
  const [numberOfRows, setNumberOfRows] = useState<number>(0);
  const { mutate: addEvent } = useAddCouncilEvent();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      roomPlace: "",
      eventTime: "",
      eventDescription: "",
    },
  });

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
      ce_description: values.eventDescription,
      ce_is_archive: false,
      ce_rows: numberOfRows,
      staff: user?.staff?.staff_id || null,
    };

    addEvent(eventData, {
      onSuccess: (ce_id) => {
        setCeId(ce_id);
        form.reset();
        setNumberOfRows(0);
        setSelectedAttendees([]);
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

  const handleNumberOfRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setNumberOfRows(value);
    
    // Generate empty attendees based on the number of rows
    const emptyAttendees = Array.from({ length: value }, (_, index) => ({
      name: `Attendee ${index + 1}`,
      designation: "To be filled",
    }));
    setSelectedAttendees(emptyAttendees);
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

            <FormInput
              control={form.control}
              name="roomPlace"
              label="Room / Place"
              placeholder="Enter Room / Place"
              readOnly={false}
            />

            <FormTextArea
              control={form.control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter Event Description"
              readOnly={false}
            />

            <div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Expected number of attendees
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={numberOfRows}
                  onChange={handleNumberOfRowsChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of rows needed"
                />
                <p className="text-sm text-gray-500">
                  This will create empty rows for attendees to fill out manually
                </p>
              </div>
            </div>
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
              className="w-full max-w-[1000px] h-full flex flex-col overflow-auto scrollbar-custom"
              title="Attendance Sheet Preview"
              description="Review the attendance sheet before downloading"
              mainContent={
                <AttendanceSheetView
                  ce_id={ceId}
                  selectedAttendees={selectedAttendees}
                  numberOfRows={numberOfRows}
                  activity={form.watch("eventTitle")}
                  date={form.watch("eventDate")}
                  time={form.watch("eventTime")}
                  place={form.watch("roomPlace")}
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
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SchedEventForm;