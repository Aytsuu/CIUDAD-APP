import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function ChildVaccines() {
  const plannedVaccines = [
    {
      name: "BCG",
      totalDoses: "1 Dose/s",
    },
    {
      name: "Hepatitis B",
      totalDoses: "2 Dose/s",
    },
  ];


  return (
    <div>
      {/* Planned Vaccines Section */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-red-500" aria-label="Calendar" />
            Planned Vaccines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {plannedVaccines.map((vaccine, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {vaccine.name}
                  </span>
                  <Badge variant="outline">{vaccine.totalDoses}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}