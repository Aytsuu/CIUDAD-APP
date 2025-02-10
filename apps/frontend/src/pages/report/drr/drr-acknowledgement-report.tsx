// Import necessary components and icons
import Card from "@/components/ui/card"; // Card component
import { DataTable } from "@/components/ui/table/data-table"; // DataTable component
import { SelectLayout } from "@/components/ui/select/select-layout"; // Dropdown component
import { ColumnDef } from "@tanstack/react-table"; // Type for table column definitions
import { CalendarRange, Users, FolderPlus } from "lucide-react"; // Icons for cards

// Define the type for the Report object
type Report = {
    id: string; // Unique identifier for the report
    incidentActivity: string; // Name of the incident/activity
    location: string; // Location of the incident/activity
    sitio: string; // Sitio (specific area) of the incident/activity
    date: string; // Date of the incident/activity
    status: "Unsigned" | "Signed"; // Status of the report (either Unsigned or Signed)
};

// Define the columns for the DataTable
export const columns: ColumnDef<Report>[] = [
    {
        accessorKey: "incidentActivity", // Key for incident/activity data
        header: "Incident/Activity", // Column header
    },
    {
        accessorKey: "location", // Key for location data
        header: "Location", // Column header
    },
    {
        accessorKey: "sitio", // Key for sitio data
        header: "Sitio", // Column header
    },
    {
        accessorKey: "date", // Key for date data
        header: "Date", // Column header
    },
    {
        accessorKey: "status", // Key for status data
        header: "Status", // Column header
    },
    {
        accessorKey: "action", // Key for action column (empty for now)
        header: "Action", // Column header
    },
];

// Sample data for the reports
export const reports: Report[] = [
    {
        id: "Lorem",
        incidentActivity: "Lorem",
        location: "Lorem",
        sitio: "Lorem",
        date: "Lorem",
        status: "Signed",
    },
];

// Main component for the DRR Acknowledgement Report
export default function DRRAcknowledgementReport() {
    const data = reports; // Assign sample data to `data`

    return (
        // Main container for the page
        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            {/* Container for the table and cards */}
            <div className="w-full sm:w-[70%] h-full sm:h-4/5 flex flex-col-reverse sm:flex-row gap-3">
                {/* Left Section: Contains the table and year dropdown */}
                <div className="w-full h-full bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-3">
                    {/* Year selection dropdown */}
                    <div className="w-full">
                        <SelectLayout
                            placeholder="Year"
                            label=""
                            className=""
                            options={[]} // No options provided (can be populated dynamically)
                            value=""
                            onChange={() => {}} // Placeholder for onChange handler
                        />
                    </div>

                    {/* DataTable component to display the reports */}
                    <DataTable columns={columns} data={data} />
                </div>

                {/* Right Section: Contains cards for navigation */}
                <div className="w-0 sm:w-[20%] h-0 sm:h-full bg-white sm:border sm:border-gray flex flex-col rounded-[5px] sm:p-3 gap-3 overflow-auto">
                    {/* Card for Weekly AR */}
                    <Card
                        icon={<CalendarRange className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Weekly AR"
                        actionText="View reports"
                        className=""
                    />

                    {/* Card for Create Report */}
                    <Card
                        icon={<FolderPlus className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Create Report"
                        actionText="Create"
                        className=""
                    />

                    {/* Card for Staff Record */}
                    <Card
                        icon={<Users className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Staff Record"
                        actionText="View staffs"
                        className=""
                    />
                </div>
            </div>
        </div>
    );
}