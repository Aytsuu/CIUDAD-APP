import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";

export function NoRecordsCard() {
  return (
    <div className="bg-white p-8 rounded-md shadow-md flex justify-center flex-col items-center text-center">
      <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
        <Frown className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No Forwarded Records</h3>
      <p className="text-sm text-gray-500 mb-4">There are currently no forwarded records to display.</p>
      <Link to="/main-forwarded-records">
        <Button variant="outline" size="sm" className="h-10 px-6 bg-white border-blue-300 text-blue-700 font-medium">
          Refresh Records
        </Button>
      </Link>
    </div>
  );
}
