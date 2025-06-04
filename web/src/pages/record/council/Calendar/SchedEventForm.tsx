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
import { useAddCouncilEvent } from "./queries/addqueries.tsx";
import { format } from 'date-fns';

function AddEvent() {
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allowModalOpen, setAllowModalOpen] = useState<boolean>(false);

  const { mutate: addEvent } = useAddCouncilEvent();

  const form = useForm<z.infer<typeof AddEventFormSchema>>({
    resolver: zodResolver(AddEventFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      roomPlace: "",
      eventCategory: "",
      eventTime: "",
      eventDescription: "",
      barangayCouncil: [],
      gadCommittee: [],
      wasteCommittee: [],
    },
  });

  const eventCategory = form.watch("eventCategory");

  const CouncilCategory = [
    { id: "HON. HANNAH SHEEN OBEJERO", name: "HON. HANNAH SHEEN OBEJERO" },
    { id: "HON. SARAH MAE DUTS", name: "HON. SARAH MAE DUTS" },
    { id: "HON. JARLENE S. GARCIA", name: "HON. JARLENE S. GARCIA" },
    { id: "HON. WATIS L. LOVE", name: "HON. WATIS L. LOVE" },
    { id: "HON. HOWLAN H. HOUSING", name: "HON. HOWLAN H. HOUSING" },
  ];

  const GADCategory = [
    { id: "GAD SECRETARY BABEL", name: "GAD SECRETARY BABEL" },
    { id: "GAD TREASURER MABLE", name: "GAD TREASURER MABLE" },
    { id: "GAD LOREM IPSUM", name: "GAD LOREM IPSUM" },
    { id: "HON. PAYN I. SGAIN", name: "HON. PAYN I. SGAIN" },
    { id: "HON. COME J. HOUQUINE", name: "HON. COME J. HOUQUINE" },
    { id: "ESCUHAS LAS PALABRAS", name: "ESCUHAS LAS PALABRAS" },
  ];

  const WasteCategory = [
    { id: "WASTE SECRETARY BABEL", name: "WASTE SECRETARY BABEL" },
    { id: "WASTE TREASURER MABLE", name: "WASTE TREASURER MABLE" },
    { id: "WASTE LOREM IPSUM", name: "WASTE LOREM IPSUM" },
    { id: "INDA MIDDLE OFTHE", name: "INDA MIDDLE OFTHE" },
  ];

function onSubmit(values: z.infer<typeof AddEventFormSchema>) {
  // Convert "HH:mm" string to a full "HH:mm:ss"
  const [hour, minute] = values.eventTime.split(":");
  const formattedTime = `${hour}:${minute}:00`;

  const formattedValues = {
    ...values,
    eventTime: formattedTime,
  };

  addEvent(formattedValues);
  form.reset();
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

  const allAttendees = useMemo(() => {
    const attendees = new Map<string, string>();
    [...CouncilCategory, ...GADCategory, ...WasteCategory].forEach((option) => {
      attendees.set(option.id, option.name);
    });
    return attendees;
  }, []);

  const barangayCouncil = form.watch("barangayCouncil");
  const gadCommittee = form.watch("gadCommittee");
  const wasteCommittee = form.watch("wasteCommittee");

  useEffect(() => {
    const selectedIds = [
      ...(barangayCouncil || []),
      ...(gadCommittee || []),
      ...(wasteCommittee || []),
    ];
    const selectedNames = selectedIds
      .map((id) => allAttendees.get(id))
      .filter(Boolean) as string[];
    setSelectedAttendees(selectedNames);
  }, [barangayCouncil, gadCommittee, wasteCommittee, allAttendees]);

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
              <>
                <h1 className="flex justify-center font-bold text-[20px] text-[#394360] py-4">
                  ATTENDEES
                </h1>

                <FormComboCheckbox
                  control={form.control}
                  name="staffAttendees"
                  label="BARANGAY STAFF"
                  options={CouncilCategory}
                />
              </>
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
                    selectedAttendees={selectedAttendees}
                    activity={form.watch("eventTitle")}
                    date={form.watch("eventDate")}
                    time={form.watch("eventTime")}
                    place={form.watch("roomPlace")}
                    category={form.watch("eventCategory")}
                    description={form.watch("eventDescription")}
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

export default AddEvent;