import React from "react";
import { FieldConfig, ChildHealthHistoryRecord } from "../../pages/healthServices/childservices/viewrecords/types";
import { getValueByPath, getDiffClass } from "../../pages/healthServices/childservices/viewrecords/utils";
import { format, isValid, parseISO, isSameDay } from "date-fns";

interface SectionRendererProps {
  fields: FieldConfig[];
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  fields,
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
      <div className="font-bold text-gray-700 sticky left-0 bg-white py-2 border-gray-100"></div>
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
      {fields.map((field, fieldIdx) => (
        <React.Fragment key={fieldIdx}>
          <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white ">
            {field.label}
          </div>
          {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
            const valueInCurrentColumn = getValueByPath(
              recordInColumn,
              field.path
            );
            const valueInPreviousRecord = recordsToDisplay[1]
              ? getValueByPath(recordsToDisplay[1], field.path)
              : undefined;
            const displayValue = field.format
              ? field.format(valueInCurrentColumn, recordInColumn)
              : valueInCurrentColumn !== undefined &&
                valueInCurrentColumn !== null &&
                valueInCurrentColumn !== ""
              ? typeof valueInCurrentColumn === "string" &&
                valueInCurrentColumn.match(/^\d{4}-\d{2}-\d{2}/)
                ? isValid(new Date(valueInCurrentColumn))
                  ? format(new Date(valueInCurrentColumn), "PPP")
                  : "N/A"
                : Array.isArray(valueInCurrentColumn)
                ? valueInCurrentColumn.length > 0
                  ? valueInCurrentColumn
                      .map(
                        (item: any) =>
                          item.name ||
                          item.disability_details?.disability_name ||
                          JSON.stringify(item)
                      )
                      .join(", ")
                  : "N/A"
                : valueInCurrentColumn
              : "N/A";

            const isCurrentRecord = recordInColumnIdx === 0;

            return (
              <div
                key={recordInColumnIdx}
                className="text-center py-2 border-t border-gray-100 break-words"
              >
                <span
                  className={getDiffClass(
                    valueInCurrentColumn,
                    valueInPreviousRecord,
                    isCurrentRecord
                  )}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};