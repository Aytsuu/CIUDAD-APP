// components/HealthHistoryTable.tsx
import { ChildHealthHistoryRecord, FieldConfig } from "@/pages/healthServices/childservices/viewrecords/types";
import { getValueByPath, getDiffClass } from "@/pages/healthServices/childservices/viewrecords/ChildHealthutils";
import { format, isValid } from "date-fns";
import {
  ClipboardList,
  User,
  AlertTriangle,
  HeartPulse,
  Soup,
  Syringe,
  Pill,
} from "lucide-react";
import {
  disabilitiesFields,
  exclusiveBfCheckFields,
  findingsFields,
  immunizationTrackingFields,
  notesFields,
  nutritionStatusesFields,
  recordOverviewFields,
  supplementsFields,
  vitalSignsFields,
} from "@/pages/healthServices/childservices/viewrecords/config";
import React from "react";

interface HealthHistoryTableProps {
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
  supplementStatusesFields: any[];
}

interface TableSection {
  title: string;
  icon: JSX.Element;
  fields: FieldConfig[];
}

export function HealthHistoryTable({
  recordsToDisplay,
  chhistId,
  supplementStatusesFields,
}: HealthHistoryTableProps) {
  const sections: TableSection[] = [
    {
      title: "TT status of the mother",
      icon: <ClipboardList className="h-4 w-4" />,
      fields: recordOverviewFields,
    },
    {
      title: "Exclusive Breastfeeding Checks",
      icon: <HeartPulse className="h-4 w-4" />,
      fields: exclusiveBfCheckFields,
    },
    {
      title: "Findings Details",
      icon: <User className="h-4 w-4" />,
      fields: findingsFields,
    },
    {
      title: "Disabilities",
      icon: <AlertTriangle className="h-4 w-4" />,
      fields: disabilitiesFields,
    },
    {
      title: "Vital Signs & Notes",
      icon: <HeartPulse className="h-4 w-4" />,
      fields: [...vitalSignsFields, ...notesFields],
    },
    {
      title: "Immunization",
      icon: <Syringe className="h-4 w-4" />,
      fields: immunizationTrackingFields,
    },
    {
      title: "Supplements & Supplement Status",
      icon: <Pill className="h-4 w-4" />,
      fields: [...supplementsFields, ...supplementStatusesFields],
    },
  ];

  const renderCellValue = (
    field: FieldConfig,
    record: ChildHealthHistoryRecord,
    recordIndex: number
  ) => {
    const valueInCurrentColumn = getValueByPath(record, field.path);
    const valueInPreviousRecord = recordsToDisplay[1]
      ? getValueByPath(recordsToDisplay[1], field.path)
      : undefined;

    let displayValue;

    if (field.format) {
      const formatted = field.format(valueInCurrentColumn, record);

      // Handle JSX elements array (like from findingsFields, notesFields, etc.)
      if (Array.isArray(formatted) && formatted.length > 0 && React.isValidElement(formatted[0])) {
        displayValue = formatted; // React can handle array of JSX elements
      }
      // Handle objects array (like from exclusiveBfCheckFields)
      else if (
        Array.isArray(formatted) &&
        formatted.length > 0 &&
        typeof formatted[0] === "object" &&
        !React.isValidElement(formatted[0]) &&
        "date" in formatted[0]
      ) {
        displayValue = formatted.map((item: any, index: number) => (
          <div key={`ebf-${index}`}>{item.date}</div>
        ));
      }
      // Handle empty arrays
      else if (Array.isArray(formatted) && formatted.length === 0) {
        displayValue = "N/A";
      }
      // Handle strings and other primitives
      else {
        displayValue = formatted;
      }
    } else {
      // Original logic for non-formatted values
      displayValue =
        valueInCurrentColumn !== undefined &&
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
    }

    const isCurrentRecord = recordIndex === 0;
    const diffClass = getDiffClass(valueInCurrentColumn, valueInPreviousRecord, isCurrentRecord);

    return <span className={diffClass}>{displayValue}</span>;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="relative">
          <table className="w-full border-collapse">
            {/* Table Header - Sticky */}
            <thead className="sticky top-0 z-30 bg-white">
              <tr>
                <th className="sticky left-0 z-40 bg-white border-r border-gray-200 p-4 text-left font-semibold text-gray-700 min-w-[250px] shadow-sm">
                  
                </th>
                {recordsToDisplay.map((record) => {
                  const isCurrentRecord = record.chhist_id === chhistId;
                  return (
                    <th
                      key={record.chhist_id}
                      className="bg-gray-50 border-b border-gray-200 p-4 text-center font-semibold text-gray-700 min-w-[180px] shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {isCurrentRecord ? "Current Record" : "Previous Record"}
                        </span>
                        <span className="text-xs font-normal text-gray-500 mt-1">
                          {format(new Date(record.created_at), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {sections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  {/* Section Header Row */}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="sticky left-0 z-20 bg-blue-50 border-r border-gray-200 p-4 font-bold text-blue-900 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">{section.icon}</div>
                        <span className="text-sm">{section.title}</span>
                      </div>
                    </td>
                    {recordsToDisplay.map((record) => (
                      <td
                        key={`section-${sectionIndex}-${record.chhist_id}`}
                        className="bg-blue-50 border-b border-gray-100 p-4"
                      >
                        {/* Empty cells for section header row */}
                      </td>
                    ))}
                  </tr>

                  {/* Field Rows */}
                  {section.fields.map((field, fieldIndex) => (
                    <tr
                      key={`${sectionIndex}-${fieldIndex}`}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 text-sm text-gray-700 align-top shadow-sm">
                        <div className="pl-6 font-medium">{field.label}</div>
                      </td>
                      {recordsToDisplay.map((record, recordIndex) => (
                        <td
                          key={`${record.chhist_id}-${fieldIndex}`}
                          className="border-b border-gray-100 p-3 text-center align-top"
                        >
                          <div className="break-words text-sm">
                            {renderCellValue(field, record, recordIndex)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Add spacing between sections */}
                  {sectionIndex < sections.length - 1 && (
                    <tr>
                      <td colSpan={recordsToDisplay.length + 1} className="h-2 bg-gray-25"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Updated HealthHistoryAccordions component to use table
interface HealthHistoryAccordionsProps {
  recordsToDisplay: ChildHealthHistoryRecord[];
  chhistId: string;
  supplementStatusesFields: any[];
}

export function HealthHistoryAccordions({
  recordsToDisplay,
  chhistId,
  supplementStatusesFields,
}: HealthHistoryAccordionsProps) {
  return (
    <HealthHistoryTable
      recordsToDisplay={recordsToDisplay}
      chhistId={chhistId}
      supplementStatusesFields={supplementStatusesFields}
    />
  );

}