import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { useUpdateCouncilEvent, useUpdateAttendees } from "./queries/updatequeries";
import { useGetStaffList, useGetAttendees, Staff } from "./queries/fetchqueries";
import { formatDate } from "@/helpers/dateFormatter";
import { Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

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
    attendees?: { name: string; designation: string; present_or_absent?: string }[];
  };
  onClose: () => void;
}

type EventCategory = "meeting" | "activity" | undefined;

function EditEventForm({ initialValues, onClose }: EditEventFormProps) {
  const isArchived = initialValues.ce_is_archive || false;
  const [isEditMode, setIsEditMode] = useState(false && !isArchived);
  const [selectedAttendees, setSelectedAttendees] = useState<
    { name: string; designation: string; present_or_absent?: string }[]
  >(initialValues.attendees || []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);
  const ceId = useMemo(() => initialValues?.ce_id, [initialValues]);

  const { mutate: updateEvent, isPending: isUpdating } = useUpdateCouncilEvent();
  const { mutate: updateAttendees } = useUpdateAttendees();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const { data: attendees = [] } = useGetAttendees(ceId);
  

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: initialValues.ce_title || "",
      eventDate: initialValues.ce_date || "",
      roomPlace: initialValues.ce_place || "",
      eventCategory: (["meeting", "activity"].includes(initialValues.ce_type)
        ? initialValues.ce_type
        : undefined) as EventCategory,
      eventTime: initialValues.ce_time || "",
      eventDescription: initialValues.ce_description || "",
      staffAttendees: initialValues.staff_id ? [initialValues.staff_id] : [],
    },
  });

  const eventCategory = form.watch("eventCategory");

  const staffOptions = useMemo(() => {
    return staffList.map((staff) => ({
      id: staff.staff_id,
      name: `${staff.full_name} (${staff.position_title})`,
      original: staff
    }));
  }, [staffList]);

  const staffAttendees = useWatch({ control: form.control, name: "staffAttendees" });

  const selectedAttendeeDetails = useMemo(() => {
    return attendees.map((attendee) => ({
      name: attendee.atn_name,
      designation: attendee.atn_designation,
      present_or_absent: attendee.atn_present_or_absent,
    }));
  }, [attendees]);

  const getStaffById = (id: string): Staff | undefined => {
    const normalizedId = String(id).toUpperCase().trim();
    return staffList.find(s => s.staff_id === normalizedId);
  };

  useEffect(() => {
    if (isEditMode) {
      const newAttendees = staffAttendees
        .map((id: string) => {
          const staff = getStaffById(id);
          if (!staff) {
            console.warn(`Staff with ID ${id} not found`);
            return null;
          }
          return {
            name: staff.full_name,
            designation: staff.position_title || "No Designation",
            present_or_absent: "Present"
          };
        })
        .filter(Boolean);
      
      setSelectedAttendees(newAttendees.length ? newAttendees : selectedAttendeeDetails);
    } else {
      setSelectedAttendees(selectedAttendeeDetails);
    }
  }, [staffAttendees, staffList, isEditMode, selectedAttendeeDetails]);

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
          if (selectedAttendees.length) {
            updateAttendees({
              ce_id: ceId,
              attendees: selectedAttendees.map((a) => ({
                atn_name: a.name,
                atn_designation: a.designation,
                atn_present_or_absent: a.present_or_absent || "Present",
                ce_id: ceId,
              })),
            });
          }
          setIsEditMode(false);
          if (onClose) onClose();
        },
      }
    );
  }

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

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(onSubmit)();
    }
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const handleConfirmPreview = () => {
    setIsPreviewOpen(false);
    handleSave();
  };

  const displayedEventCategory =
    eventCategory?.charAt(0).toUpperCase() + (eventCategory?.slice(1) || "");

    const handleEditClick = (e: React.MouseEvent) => {
    if (isArchived) return; // Prevent editing if archived
    e.preventDefault();
    e.stopPropagation();
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    form.reset();
  };

return (
  <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
    {isArchived && (
      <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 rounded-md text-center">
        This event is archived and cannot be modified
      </div>
    )}

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              readOnly={!isEditMode || isArchived}
            />
          </div>

          <FormTextArea
            control={form.control}
            name="eventDescription"
            label="Event Description"
            placeholder="Enter Event Description"
            readOnly={!isEditMode || isArchived}
          />

          {eventCategory === "meeting" && (
            <div>
              <h1 className="flex justify-center font-bold text-[20px] text-[#394360] py-4">
                ATTENDEES
              </h1>
              {isEditMode && !isArchived ? (
                <FormComboCheckbox
                  control={form.control}
                  name="staffAttendees"
                  label="BARANGAY STAFF"
                  options={staffOptions}
                  readOnly={!isEditMode || isArchived}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Barangay Staff
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-700">
                    {selectedAttendees.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {selectedAttendees.map((attendee, index) => (
                          <li key={index}>{attendee.name} ({attendee.designation})</li>
                        ))}
                      </ul>
                    ) : (
                      "No attendees selected"
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          {isEditMode ? (
            <>
              <Button
                type="button"
                className="bg-gray-500 text-black hover:bg-gray-600"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className=""
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        Saving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
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
              <Button
                type="button"
                className=""
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )
          )}
          {!isEditMode && eventCategory === "meeting" && !isArchived && (
            <DialogLayout
              trigger={
                <Button
                  type="button"
                  className="bg-gray-500 text-black hover:bg-gray-600"
                  onClick={handleNextClick}
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