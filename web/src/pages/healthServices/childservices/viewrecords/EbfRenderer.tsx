import React from "react";
import { FieldConfig, ChildHealthHistoryRecord, EBFCheck } from "./types";
import { getValueByPath } from "./utils";
import { format, isValid, isSameDay } from "date-fns";

interface EbfRendererProps {
  field: FieldConfig;
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
}


export const EbfRenderer: React.FC<EbfRendererProps> = ({
  field,
  recordsToDisplay,
  chhistId,
}) => {
  return (
    <div
      className="grid gap-4 items-start w-full"
      style={{
        gridTemplateColumns: `minmax(150px, 1fr) repeat(${recordsToDisplay.length}, minmax(180px, 1fr))`,
      }}
    >
      <div className="font-bold text-gray-700 left-0 bg-white py-2 border-gray-100"></div>
      {recordsToDisplay.map((record, idx) => {
        const isCurrentRecord = record.chhist_id === chhistId;
        return (
          <div
            key={record.chhist_id}
            className="font-bold text-center text-gray-700 py-2 border-gray-100"
          >
            {isCurrentRecord ? "Current Record" : "Previous Record"}
            <br />
            <span className="text-sm font-normal text-gray-500">
              {format(new Date(record.created_at), "MMM dd, yyyy")}
            </span>
          </div>
        );
      })}
      <React.Fragment>
        <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white ">
          {field.label}
        </div>
        {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
          const valueInCurrentColumn = getValueByPath(
            recordInColumn,
            field.path
          );
          const displayValue = field.format
            ? field.format(valueInCurrentColumn)
            : valueInCurrentColumn;
          const isCurrentRecord = recordInColumnIdx === 0;

          return (
            <div
              key={recordInColumnIdx}
              className="text-center py-2 border-t border-gray-100"
            >
              {displayValue.length > 0 ? (
                <div className="space-y-1">
                  {displayValue.map((ebf: { id: number; date: string }) => {
                    const shouldHighlight =
                      isCurrentRecord &&
                      !recordsToDisplay[1]?.exclusive_bf_checks?.some(
                        (prevEbf: EBFCheck) =>
                          prevEbf.ebf_date &&
                          ebf.date &&
                          isSameDay(
                            new Date(prevEbf.ebf_date),
                            new Date(ebf.date)
                          )
                      );

                    return (
                      <div
                        key={ebf.id}
                        className={
                          shouldHighlight ? "text-red-500 font-semibold" : ""
                        }
                      >
                        {ebf.date}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-400">No EBF checks recorded</span>
              )}
            </div>
          );
        })}
      </React.Fragment>
    </div>
  );
};