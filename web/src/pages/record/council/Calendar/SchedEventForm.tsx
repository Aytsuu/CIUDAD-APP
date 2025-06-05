// pages/record/council/Calendar/SchedEventForm.tsx
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
import { useAddCouncilEvent, useAddAttendee } from "./queries/addqueries";
import { useGetStaffList } from "./queries/fetchqueries";
import { format } from 'date-fns';
import { formatDate } from '@/helpers/dateFormatter';

function SchedEventForm() {
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);
  const [ceId, setCeId] = useState<number | null>(null);

  const { mutate: addEvent } = useAddCouncilEvent();
  const { mutate: addAttendee } = useAddAttendee();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      roomPlace: "",
      eventCategory: undefined, // Fix: Use undefined instead of ""
      eventTime: "",
      eventDescription: "",
      staffAttendees: [],
    },
  });

  const eventCategory = form.watch("eventCategory");

  const staffOptions = useMemo(() => {
    return staffList.map((staff) => ({
      id: staff.full_name,
      name: staff.full_name,
    }));
  }, [staffList]);

  function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
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
      staff_id: null,
    };

    addEvent(eventData, {
      onSuccess: (ce_id) => {
        setCeId(ce_id);
        if (eventCategory === "meeting" && values.staffAttendees.length > 0) {
          values.staffAttendees.forEach((atn_name) => {
            addAttendee({
              atn_name,
              atn_present_or_absent: "Present",
              ce_id: ce_id,
              staff_id: null,
            });
          });
        }
        form.reset();
      },
    });
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
      form.reset();
    } else if (allowModalOpen) {
      setIsModalOpen(true);
    }
  };

  const allAttendees = useMemo(() => {
    const attendees = new Map<string, string>();
    staffOptions.forEach((option) => {
      attendees.set(option.id, option.name);
    });
    return attendees;
  }, [staffOptions]);

  const staffAttendees = form.watch("staffAttendees");

  useEffect(() => {
    setSelectedAttendees(staffAttendees);
  }, [staffAttendees]);

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD EVENT</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>

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
              <Button type="submit" className="bg-blue hover:bg-blue/90">
                Schedule
              </Button>
            ) : (
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

export default SchedEventForm;