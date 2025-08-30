import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";

interface ForwardedScheduledVaccinationCardProps {
  count: number;
}

export function ForwardedScheduledVaccinationCard({ count }: ForwardedScheduledVaccinationCardProps) {
  if (count <= 0) return null;

  return (
    <div className="p-4 rounded-lg border border-blue-200 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Scheduled Vaccination Records
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600 bg-blue-200 px-2 py-1 rounded-md">
                {count} Records scheduled
              </span>
            </div>
          </div>
        </div>
        <Link to="/forwarded-records/vaccine-waitlist">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-6 bg-white border-blue-300 text-blue-700 font-medium"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}