import { useState, useMemo } from "react";
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
import {
  useUpdateCouncilEvent,
} from "./queries/councilEventupdatequeries";
import { EditEventFormProps } from "./councilEventTypes";
import { formatDate } from "@/helpers/dateHelper";
import { Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteCouncilEvent } from "./queries/councilEventdelqueries";
import { Archive } from "lucide-react";

function EditEventForm({ initialValues, onClose }: EditEventFormProps) {
  const isArchived = initialValues.ce_is_archive || false;
  const [isEditMode, setIsEditMode] = useState(false && !isArchived);
  const [selectedAttendees, setSelectedAttendees] = useState<{ name: string; designation: string; present_or_absent?: string }[]>(initialValues.attendees || []);
  const [numberOfRows, setNumberOfRows] = useState<number>(initialValues.ce_rows || initialValues.attendees?.length || 0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);
  const ceId = useMemo(() => initialValues?.ce_id, [initialValues]);
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateCouncilEvent();
  const { mutate: deleteCouncilEvent, isPending: isArchiving } = useDeleteCouncilEvent();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: initialValues.ce_title || "",
      eventDate: initialValues.ce_date || "",
      roomPlace: initialValues.ce_place || "",
      eventTime: initialValues.ce_time || "",
      eventDescription: initialValues.ce_description || "",
    },
  });

  function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
    const [hour, minute] = values.eventTime.split(":");
    const formattedTime = `${hour}:${minute}:00`;

    const formattedDate = formatDate(values.eventDate);
    if (formattedDate === null) {
      form.setError("eventDate", { message: "Invalid date format" });
      return;
    }

    const eventInfo = {
      ce_title: values.eventTitle.trim(),
      ce_place: values.roomPlace.trim(),
      ce_date: formattedDate,
      ce_time: formattedTime,
      ce_description: values.eventDescription.trim(),
      ce_is_archive: false,
      ce_rows: numberOfRows,
    };

    updateEvent(
      { ce_id: ceId, eventInfo },
      {
        onSuccess: () => {
          setIsEditMode(false);
          if (onClose) onClose();
        },
      }
    );
  }

  const handleNextClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setAllowModalOpen(true);
      setIsModalOpen(true);
    } else {
      setAllowModalOpen(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
    } else if (allowModalOpen) {
      setIsModalOpen(true);
    }
  };

  const handleArchive = () => {
    deleteCouncilEvent(
      { ce_id: ceId, permanent: false },
      {
        onSuccess: () => {
          if (onClose) onClose();
        },
      }
    );
  };

  const handleConfirmPreview = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    if (isArchived) return;
    e.preventDefault();
    e.stopPropagation();
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    form.reset({
      eventTitle: initialValues.ce_title || "",
      eventDate: initialValues.ce_date || "",
      roomPlace: initialValues.ce_place || "",
      eventTime: initialValues.ce_time || "",
      eventDescription: initialValues.ce_description || "",
    });
    // Reset to the original values from the database
    const originalRows = initialValues.ce_rows || initialValues.attendees?.length || 0;
    setNumberOfRows(originalRows);
    setSelectedAttendees(initialValues.attendees || []);
  };

  const handleNumberOfRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setNumberOfRows(value);
    
    // Generate empty/placeholder attendees based on the number of rows
    if (value > selectedAttendees.length) {
      const additionalAttendees = Array.from(
        { length: value - selectedAttendees.length }, 
        (_, index) => ({
          name: `Attendee ${selectedAttendees.length + index + 1}`,
          designation: "To be filled",
        })
      );
      setSelectedAttendees([...selectedAttendees, ...additionalAttendees]);
    } else if (value < selectedAttendees.length) {
      setSelectedAttendees(selectedAttendees.slice(0, value));
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      {isArchived && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 rounded-md text-center">
          This event is archived and cannot be modified
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4">
            <FormInput
              control={form.control}
              name="eventTitle"
              label="Event Title"
              placeholder="Enter Event Title"
              readOnly={!isEditMode || isArchived}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="eventDate"
                type="date"
                label="Event Date"
                readOnly={!isEditMode || isArchived}
              />

              <FormDateTimeInput
                control={form.control}
                name="eventTime"
                type="time"
                label="Event Time"
                readOnly={!isEditMode || isArchived}
              />
            </div>

            <FormInput
              control={form.control}
              name="roomPlace"
              label="Room / Place"
              placeholder="Enter Room / Place"
              readOnly={!isEditMode || isArchived}
            />

            <FormTextArea
              control={form.control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter Event Description"
              readOnly={!isEditMode || isArchived}
            />

            <div>
              {isEditMode && !isArchived ? (
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
                    This will create rows for attendees to fill out manually
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expected Attendees
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-700">
                    {numberOfRows > 0 ? (
                      <p className="font-medium">{numberOfRows}</p>
                    ) : (
                      "No attendees expected"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>
                <ConfirmationModal
                  trigger={
                    <Button type="button" className="" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          Saving{" "}
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  }
                  title="Confirm Changes"
                  description="Are you sure you want to save these changes?"
                  actionLabel="Confirm"
                  onClick={form.handleSubmit(onSubmit)}
                />
              </>
            ) : (
              !isArchived && (
                <>
                  <ConfirmationModal
                    trigger={
                      <Button
                        type="button"
                        className="bg-red-500 text-white hover:bg-red-600"
                        disabled={isArchiving}
                      >
                        {isArchiving ? (
                          <>
                            Archiving{" "}
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <Archive size={16} />
                        )}
                      </Button>
                    }
                    title="Confirm Archive"
                    description={`Are you sure you want to archive the event "${initialValues.ce_title}"? It will be moved to the archived events list.`}
                    actionLabel="Archive"
                    onClick={handleArchive}
                  />
                  <DialogLayout
                    trigger={
                      <Button
                        type="button"
                        className="bg-white text-black hover:bg-gray-100"
                        onClick={handleNextClick}
                      >
                        Preview
                      </Button>
                    }
                    className="w-full max-w-[1000px] h-full flex flex-col overflow-auto scrollbar-custom"
                    title="Attendance Sheet Preview"
                    description="Review the attendance sheet"
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
                    isOpen={isModalOpen}
                    onOpenChange={handleModalOpenChange}
                  />
                  <Button type="button" className="" onClick={handleEditClick}>
                    Edit
                  </Button>
                </>
              )
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditEventForm;