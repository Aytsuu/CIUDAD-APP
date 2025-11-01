import { WasteEvent } from "./queries/wasteEventQueries";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";

interface WasteEventViewProps {
  event: WasteEvent;
  onClose?: () => void;
}

export default function WasteEventView({ event }: WasteEventViewProps) {
  const isArchived = event.we_is_archive || false;

  // Format date for date input (YYYY-MM-DD format)
  const formattedDate = event.we_date 
    ? event.we_date
    : "";

  // Format time for time input (HH:mm format)
  const formattedTime = event.we_time 
    ? event.we_time.slice(0, 5) // Extract HH:mm from HH:mm:ss
    : "";

  const form = useForm({
    defaultValues: {
      eventName: event.we_name || "",
      eventDate: formattedDate,
      eventTime: formattedTime,
      location: event.we_location || "",
      organizer: event.we_organizer || "",
      eventDescription: event.we_description || "",
    },
  });

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      {isArchived && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 rounded-md text-center">
          This event is archived and cannot be modified
        </div>
      )}

      <Form {...form}>
        <form className="flex flex-col gap-4">
          <div className="grid gap-4">
            <FormInput
              control={form.control}
              name="eventName"
              label="Event Name"
              placeholder="Enter Event Name"
              readOnly={true}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="eventDate"
                type="date"
                label="Event Date"
                readOnly={true}
              />

              <FormDateTimeInput
                control={form.control}
                name="eventTime"
                type="time"
                label="Event Time"
                readOnly={true}
              />
            </div>

            <FormInput
              control={form.control}
              name="location"
              label="Location"
              placeholder="Enter Location"
              readOnly={true}
            />

            <FormInput
              control={form.control}
              name="organizer"
              label="Organizer"
              placeholder="Enter Organizer"
              readOnly={true}
            />

            <FormTextArea
              control={form.control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter Event Description"
              readOnly={true}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

