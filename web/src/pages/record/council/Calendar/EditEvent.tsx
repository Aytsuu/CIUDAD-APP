import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import AddEventFormSchema from "@/form-schema/council/addevent-schema";
import AttendanceSheetView from "./AttendanceSheetView";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useUpdateCouncilEvent } from "./queries/updatequeries";
import { useDeleteCouncilEvent } from "./queries/delqueries";
import { useGetStaffList } from "./queries/fetchqueries";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatDate } from "@/helpers/dateFormatter";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Loader2 } from "lucide-react";

interface EditEventFormProps {
  initialValues: {
    ce_id: number;
    ce_title: string;
    ce_date: string;
    ce_time: string;
    ce_place: string;
    ce_type: string;
    ce_description: string;
    ce_is_archive?: boolean;
    staff_id?: string | null;
  };
  onClose: () => void;
}

type EventCategory = "meeting" | "activity" | undefined;

function EditEventForm({ initialValues, onClose }: EditEventFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<{ name: string; designation: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);
  const [ceId] = useState<number>(initialValues.ce_id);

  const { mutate: updateEvent, isPending: isUpdating } = useUpdateCouncilEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteCouncilEvent();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: initialValues.ce_title || "",
      eventDate: initialValues.ce_date || "",
      roomPlace: initialValues.ce_place || "",
      eventCategory: (["meeting", "activity"].includes(initialValues.ce_type) ? initialValues.ce_type : undefined) as EventCategory,
      eventTime: initialValues.ce_time || "",
      eventDescription: initialValues.ce_description || "",
      staffAttendees: initialValues.staff_id ? [initialValues.staff_id] : [],
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
      const staff = staffList.find((s) => s.staff_id.toLowerCase() === staffId.toLowerCase());
      return {
        name: staff ? staff.full_name : `Unknown (ID: ${staffId})`,
        designation: staff ? staff.position_title || "No Designation" : "No Designation",
      };
    });

    return details;
  }, [staffAttendees, staffList]);

  useEffect(() => {
    setSelectedAttendees(selectedAttendeeDetails);
  }, [selectedAttendeeDetails]);

  function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
    console.log("Form submitted");
    const [hour, minute] = values.eventTime.split(":");
    const formattedTime = `${hour}:${minute}:00`;

    const eventInfo = {
      ce_title: values.eventTitle.trim(),
      ce_place: values.roomPlace.trim(),
      ce_date: formatDate(values.eventDate),
      ce_time: formattedTime,
      ce_type: values.eventCategory || "meeting",
      ce_description: values.eventDescription.trim(),
      ce_is_archive: false,
      ...(values.staffAttendees[0] && { staff_id: values.staffAttendees[0] }),
    };

    console.log("Submitting event info to updateEvent:", eventInfo);
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

  const handleDelete = () => {
    deleteEvent(ceId, {
      onSuccess: () => {
        if (onClose) onClose();
      },
    });
  };

  const handleNextClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      console.log("Form is valid, values:", form.getValues());
      setAllowModalOpen(true);
      setIsModalOpen(true);
    } else {
      console.log("Form is invalid, errors:", form.formState.errors);
      setAllowModalOpen(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false);
      form.reset();
    } else if (allowModalOpen) {
      setIsModalOpen(true);
    }
  };

  const displayedEventCategory =
    eventCategory?.charAt(0).toUpperCase() + (eventCategory?.slice(1) || "");

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default form action
    e.stopPropagation(); // Stop event from bubbling up
    console.log("Edit button clicked");
    setIsEditMode(true);
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4">
            <FormInput
              control={form.control}
              name="eventTitle"
              label="Event Title"
              placeholder="Enter Event Title"
              readOnly={!isEditMode}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDateTimeInput
                control={form.control}
                name="eventDate"
                type="date"
                label="Event Date"
                readOnly={!isEditMode}
              />

              <FormDateTimeInput
                control={form.control}
                name="eventTime"
                type="time"
                label="Event Time"
                readOnly={!isEditMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Event Category
                </label>
                <div className="text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-700">
                  {displayedEventCategory}
                </div>
              </div>

              <FormInput
                control={form.control}
                name="roomPlace"
                label="Room / Place"
                placeholder="Enter Room / Place"
                readOnly={!isEditMode}
              />
            </div>

            <FormTextArea
              control={form.control}
              name="eventDescription"
              label="Event Description"
              placeholder="Enter Event Description"
              readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {isEditMode ? (
              <Button type="submit" className="bg-blue hover:bg-blue/90" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    Saving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-blue hover:bg-blue/90"
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )}
            <ConfirmationModal
              trigger={
                <Button
                  type="button"
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      Deleting <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              }
              title="Confirm Delete"
              description="Are you sure you want to delete this event? This action cannot be undone."
              actionLabel="Confirm"
              onClick={handleDelete}
            />
            {eventCategory === "meeting" && (
              <DialogLayout
                trigger={
                  <Button
                    type="button"
                    className="bg-blue hover:bg-blue/90"
                    onClick={handleNextClick}
                  >
                    Next
                  </Button>
                }
                className="max-w-[1000px] max-h-full flex flex-col overflow-auto scrollbar-custom"
                title="Attendance Details"
                description="Please review upon submitting."
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
                    onConfirm={() => setIsModalOpen(false)}
                  />
                }
                isOpen={isModalOpen}
                onOpenChange={handleModalOpenChange}
              />
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditEventForm;