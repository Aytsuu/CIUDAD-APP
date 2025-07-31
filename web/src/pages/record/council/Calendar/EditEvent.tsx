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
import { useGetStaffList, useGetAttendees } from "./queries/fetchqueries";
import  { EventCategory, Staff, EditEventFormProps } from "./ce-att-types";
import { formatDate } from "@/helpers/dateHelper";
import { Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteCouncilEvent } from "./queries/delqueries";
import { Archive } from "lucide-react";

const normalizeString = (str: string) => str.trim().toLowerCase();

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
  const { data: attendees = [], isLoading: isAttendeesLoading } = useGetAttendees(ceId);
  const { mutate: deleteCouncilEvent, isPending: isArchiving } = useDeleteCouncilEvent();

  const initialStaffIds = useMemo(() => {
    if (!attendees.length || !staffList.length) return [];
    return attendees
      .map((attendee) => {
        const staff = staffList.find(
          (s) =>
            normalizeString(s.full_name) === normalizeString(attendee.atn_name) &&
            normalizeString(s.position_title) === normalizeString(attendee.atn_designation)
        );
        if (!staff) {
          console.warn(`No staff found for attendee: ${attendee.atn_name} (${attendee.atn_designation})`);
        }
        return staff?.staff_id;
      })
      .filter((id): id is string => id !== undefined);
  }, [attendees, staffList]);

  console.log("Attendees from API:", attendees);
  console.log("Staff list:", staffList);
  console.log("Computed initialStaffIds:", initialStaffIds);

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
      staffAttendees: [],
    },
  });

  useEffect(() => {
    if (!isStaffLoading && !isAttendeesLoading) {
      console.log("Updating form with initialStaffIds:", initialStaffIds);
      form.reset({
        ...form.getValues(),
        staffAttendees: initialStaffIds,
      });
    }
  }, [initialStaffIds, isStaffLoading, isAttendeesLoading, form]);

  const eventCategory = form.watch("eventCategory");
  const staffAttendees = useWatch({ control: form.control, name: "staffAttendees" });

  console.log("Form staffAttendees:", staffAttendees);

  const staffOptions = useMemo(() => {
    return staffList.map((staff) => ({
      id: staff.staff_id,
      name: `${staff.full_name} (${staff.position_title})`,
      original: staff,
    }));
  }, [staffList]);

  const selectedAttendeeDetails = useMemo(() => {
    return attendees.map((attendee) => ({
      name: attendee.atn_name,
      designation: attendee.atn_designation,
      present_or_absent: attendee.atn_present_or_absent,
    }));
  }, [attendees]);

  const getStaffById = (id: string): Staff | undefined => {
    const normalizedId = String(id).toUpperCase().trim();
    return staffList.find((s) => s.staff_id === normalizedId);
  };

  useEffect(() => {
    if (isEditMode) {
      console.log("staffAttendees in edit mode:", staffAttendees);
      const newAttendees = staffAttendees
        .map((id) => {
          const staff = getStaffById(id);
          if (!staff) {
            console.warn(`Staff with ID ${id} not found`);
            return null;
          }
          const existingAttendee = selectedAttendeeDetails.find(
            (a) =>
              normalizeString(a.name) === normalizeString(staff.full_name) &&
              normalizeString(a.designation) === normalizeString(staff.position_title)
          );
          return {
            name: staff.full_name,
            designation: staff.position_title || "No Designation",
            present_or_absent: existingAttendee?.present_or_absent,
          };
        })
        .filter((item): item is { name: string; designation: string; present_or_absent?: string } => item !== null);

      setSelectedAttendees(newAttendees);
    } else {
      setSelectedAttendees(selectedAttendeeDetails);
    }
  }, [staffAttendees, staffList, isEditMode, selectedAttendeeDetails]);

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
      ce_type: values.eventCategory || "meeting",
      ce_description: values.eventDescription.trim(),
      ce_is_archive: false,
      ...(values.staffAttendees[0] && { staff_id: values.staffAttendees[0] }),
    };

    updateEvent(
      { ce_id: ceId, eventInfo },
      {
        onSuccess: () => {
          if (staffAttendees.length) {
            updateAttendees({
              ce_id: ceId,
              attendees: staffAttendees.map((id) => {
                const staff = getStaffById(id);
                return {
                  atn_name: staff?.full_name || "Unknown",
                  atn_designation: staff?.position_title || "No Designation",
                  atn_present_or_absent:
                    selectedAttendees.find(
                      (a) =>
                        normalizeString(a.name) === normalizeString(staff?.full_name || "") &&
                        normalizeString(a.designation) === normalizeString(staff?.position_title || "")
                    )?.present_or_absent || "Present",
                  ce_id: ceId,
                };
              }),
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

  const displayedEventCategory =
    eventCategory?.charAt(0).toUpperCase() + (eventCategory?.slice(1) || "");

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
      eventCategory: (["meeting", "activity"].includes(initialValues.ce_type)
        ? initialValues.ce_type
        : undefined) as EventCategory,
      eventTime: initialValues.ce_time || "",
      eventDescription: initialValues.ce_description || "",
      staffAttendees: initialStaffIds,
    });
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
                  isStaffLoading || isAttendeesLoading ? (
                    <div>Loading attendees...</div>
                  ) : (
                    <div>
                      <FormComboCheckbox
                        control={form.control}
                        name="staffAttendees"
                        label="BARANGAY STAFF"
                        options={staffOptions}
                        readOnly={!isEditMode || isArchived}
                        maxDisplayValues={2}
                      />
                    </div>
                  )
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
                  className="bg-white text-black hover:bg-gray-200"
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
              <>
                {!isArchived && (
                  <ConfirmationModal
                    trigger={
                      <Button
                        type="button"
                        className="bg-white text-red-500 hover:bg-gray-100"
                        disabled={isArchiving}
                      >
                        {isArchiving ? (
                          <>
                            Archiving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
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
                )}
                {eventCategory === "meeting" && (
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
                {!isArchived && (
                  <Button
                    type="button"
                    className=""
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditEventForm;