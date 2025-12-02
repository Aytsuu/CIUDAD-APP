// components/HealthHistoryTable.tsx
import { getValueByPath } from "@/pages/healthServices/childservices/viewrecords/ChildHealthutils";
import { format, isValid } from "date-fns";
import {  User, HeartPulse, Syringe, Pill } from "lucide-react";
import { exclusiveBfCheckFields, findingsFields, immunizationTrackingFields, notesFields, supplementsFields, vitalSignsFields } from "@/pages/healthServices/childservices/viewrecords/config";
import React from "react";

interface HealthHistoryTableProps {
  recordsToDisplay: any[];
  // supplementStatusesFields: any[];
  chhistId: string | number; // Added chhistId to props
}

interface TableSection {
  title: string;
  icon: JSX.Element;
  fields: any[];
}

export function HealthHistoryTable({ recordsToDisplay, chhistId }: HealthHistoryTableProps) {
  const sections: TableSection[] = [
    {
      title: "Exclusive Breastfeeding Checks",
      icon: <HeartPulse className="h-5 w-5 text-blue-600" />,
      fields: exclusiveBfCheckFields
    },
    {
      title: "Findings Details",
      icon: <User className="h-5 w-5 text-blue-600" />,
      fields: findingsFields
    },
    {
      title: "Vital Signs & Notes",
      icon: <HeartPulse className="h-5 w-5 text-blue-600" />,
      fields: [...vitalSignsFields, ...notesFields]
    },
    {
      title: "Immunization",
      icon: <Syringe className="h-5 w-5 text-blue-600" />,
      fields: immunizationTrackingFields
    },
    {
      title: "Medicine Given and Health Status (anemic/low birth weight)",
      icon: <Pill className="h-5 w-5 text-blue-600" />,
      fields: [...supplementsFields]
    }
  ];

  const renderCellValue = (field: any, record: any) => {
    const valueInCurrentColumn = getValueByPath(record, field.path);

    let displayValue;

    if (field.format) {
      const formatted = field.format(valueInCurrentColumn, record);

      if (Array.isArray(formatted) && formatted.length > 0 && React.isValidElement(formatted[0])) {
        displayValue = formatted;
      } else if (Array.isArray(formatted) && formatted.length > 0 && typeof formatted[0] === "object" && !React.isValidElement(formatted[0]) && "date" in formatted[0]) {
        displayValue = formatted.map((item: any, index: number) => <div key={`ebf-${index}`}>{item.date}</div>);
      } else if (Array.isArray(formatted) && formatted.length === 0) {
        displayValue = "N/A";
      } else {
        displayValue = formatted;
      }
    } else {
      displayValue =
        valueInCurrentColumn !== undefined && valueInCurrentColumn !== null && valueInCurrentColumn !== ""
          ? typeof valueInCurrentColumn === "string" && valueInCurrentColumn.match(/^\d{4}-\d{2}-\d{2}/)
            ? isValid(new Date(valueInCurrentColumn))
              ? format(new Date(valueInCurrentColumn), "PPP")
              : "N/A"
            : Array.isArray(valueInCurrentColumn)
            ? valueInCurrentColumn.length > 0
              ? valueInCurrentColumn.map((item: any) => item.name || item.disability_details?.disability_name || JSON.stringify(item)).join(", ")
              : "N/A"
            : valueInCurrentColumn
          : "N/A";
    }


    return <span>{displayValue}</span>;
  };

  return (
    <div className="w-full p-4  rounded-lg shadow-md overflow-x-auto ">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            {section.icon}
            <h2 className="text-lg font-bold text-blue-900">{section.title}</h2>
          </div>

          {/* Horizontal Scrollable Records */}
          <div className="flex gap-4">
            {recordsToDisplay.map((record) => {
              const isCurrentRecord = record.chhist_id === chhistId;
              return (
                <div
                  key={record.chhist_id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-300 min-w-[300px] flex-shrink-0"
                >
                  <div className="flex flex-col mb-4">
                    <span className="text-sm">
                      {isCurrentRecord ? "Current Record" : "Previous Record"}
                    </span>
                    <span className="text-xs font-normal text-gray-500 mt-1">
                      {format(new Date(record.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {section.fields.map((field, fieldIndex) => (
                    <div key={`${fieldIndex}-${record.chhist_id}`} className="mb-2">
                      <span className="block text-sm font-semibold text-gray-700">
                        {field.label}
                      </span>
                      <span className="block text-sm text-gray-800">
                        {renderCellValue(field, record)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Updated HealthHistoryAccordions component to use table
interface HealthHistoryAccordionsProps {
  recordsToDisplay: any[];
}

export function HealthHistoryAccordions({ recordsToDisplay }: HealthHistoryAccordionsProps) {
  const chhistId = recordsToDisplay[0]?.chhist_id || ""; // Default to first record's ID or empty string

  return <HealthHistoryTable recordsToDisplay={recordsToDisplay} chhistId={chhistId}  />;
}


