import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import GADActivityForm from "./gadActivityCreate.tsx";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


const mockGADActivities = [
  {
    id: 1,
    title: "Women's Health Seminar",
    date: "2024-01-15",
    time: "09:00",
    place: "Community Center",
    description: "Educational seminar on women's health and wellness",
    participants: 50,
    status: "upcoming"
  },
  {
    id: 2,
    title: "Gender Sensitivity Training",
    date: "2024-01-20",
    time: "14:00",
    place: "Municipal Hall",
    description: "Training session for municipal employees",
    participants: 25,
    status: "upcoming"
  },
  {
    id: 3,
    title: "Youth Development Program",
    date: "2024-01-10",
    time: "10:00",
    place: "Youth Center",
    description: "Skills development program for young adults",
    participants: 30,
    status: "completed"
  },
  {
    id: 4,
    title: "Gender Equality Workshop",
    date: "2024-01-25",
    time: "08:30",
    place: "Conference Room",
    description: "Workshop on promoting gender equality in the workplace",
    participants: 40,
    status: "upcoming"
  }
];

function GADActivityPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading] = useState(false);

  // Prepare calendar sources for GAD activities
  const calendarSources = [
    {
      name: "GAD Activities",
      data: mockGADActivities,
      columns: [], // Empty columns array for now
      titleAccessor: "title",
      dateAccessor: "date",
      timeAccessor: "time",
      defaultColor: "#8b5cf6", // purple for GAD
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <Skeleton className="h-8 w-32 opacity-30" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <Skeleton className="h-[500px] w-full opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GAD Activities Calendar</h1>
          </div>
        </div>
        
        <DialogLayout
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          trigger={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Activity
            </Button>
          }
          className="max-w-[90%] sm:max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title="Add GAD Activity"
          description="Create a new Gender and Development activity"
          mainContent={
            <div className="w-full h-full">
              <GADActivityForm onSuccess={() => setIsAddDialogOpen(false)} />
            </div>
          }
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <EventCalendar
          sources={calendarSources}
          legendItems={[
            { label: "GAD Activities", color: "#8b5cf6" },
          ]}
        />
      </div>
    </div>
  );
}

export default GADActivityPage;