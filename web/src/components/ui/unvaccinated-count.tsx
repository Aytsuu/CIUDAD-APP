import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import CardLayout from "@/components/ui/card/card-layout";

interface VaccineCountCardsProps {
  vaccineCounts: Record<string, number>;
}

export const VaccineCountCards: React.FC<VaccineCountCardsProps> = ({
  vaccineCounts,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const vaccineEntries = Object.entries(vaccineCounts);
  const hasMoreThanTwo = vaccineEntries.length > 3;
  const displayedEntries = vaccineEntries.slice(0, 3);
  const totalUnvaccinated = vaccineEntries.reduce((sum, [, count]) => sum + count, 0);

  if (vaccineEntries.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow-sm text-center">
        <p className="text-gray-500">No unvaccinated residents data available</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Vaccine Count Cards Grid - Only show first 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
        {displayedEntries.map(([vaccine, count]) => (
          <CardLayout
        key={vaccine}
        title={
          <h4
            className="text-base font-semibold text-red-600 truncate"
            title={vaccine}
          >
            {vaccine}
          </h4>
        }
        description={
          <h3
            className="text-sm  text-gray-700 truncate"
            title={vaccine}
          >
            Not Received
          </h3>
        }
        content={
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{count}</p>
            <p className="text-sm text-gray-500">
          {count === 1 ? "resident" : "residents"}
            </p>
          </div>
        }
          />
        ))}
      </div>

      {/* See More Button with Dialog - Shows when more than 2 vaccines */}
      {hasMoreThanTwo && (
        <div className="flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="text-sky-600 font-medium">
                  See More ({vaccineEntries.length - 3} more vaccines)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users size={20} />
                  All Vaccination Gaps
                </DialogTitle>
                <DialogDescription>
                  Complete list of vaccines and number of unvaccinated residents
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {/* Summary */}
                <div className="bg-red-50 p-4 rounded-lg mb-4 border-l-4 border-red-500">
                  <h3 className="font-semibold text-gray-800">Summary</h3>
                  <p className="text-sm text-gray-600">
                    {totalUnvaccinated} total residents missing {vaccineEntries.length} different vaccines
                  </p>
                </div>
                
                {/* All Vaccines List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vaccineEntries
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .map(([vaccine, count], index) => (
                      <div
                        key={vaccine}
                        className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">{count}</div>
                            <div className="text-xs text-gray-500">
                              {count === 1 ? "resident" : "residents"}
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{vaccine}</h4>
                        <div className="bg-gray-100 rounded-full h-2 mb-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(count / totalUnvaccinated) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          {((count / totalUnvaccinated) * 100).toFixed(1)}% of total gaps
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};