import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";

interface ChildHealthImmunizationCardProps {
    count: number;
  }
  
  export function ChildHealthImmunizationCard({ count }: ChildHealthImmunizationCardProps) {
    if (count <= 0) return null;
  
    return (
      <div className="p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg">
              <Pill className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Child Health Immunization
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600 bg-purple-200 px-2 py-1 rounded-md">
                  {count} Records forwarded
                </span>
              </div>
            </div>
          </div>
          <Link to="/forwarded-records/child-health-immunization">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-6 bg-white border-purple-300 text-purple-700 font-medium"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }