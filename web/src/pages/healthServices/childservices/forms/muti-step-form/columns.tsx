import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import type {
  VitalSignType,
  NutritionalStatusType,
} from "@/form-schema/chr-schema/chr-schema";
import { Medicine } from "./types";
import type { CHSSupplementStat } from "./types";
import type { Control, UseFormHandleSubmit } from "react-hook-form";

export const NUTRITIONAL_STATUS_DESCRIPTIONS = {
  wfa: {
    N: "Normal",
    UW: "Underweight",
    SUW: "Severely Underweight",
  },
  lhfa: {
    N: "Normal",
    ST: "Stunted",
    SST: "Severely Stunted",
    T: "Tall",
    OB: "Obese",
  },
  wfh: {
    N: "Normal",
    W: "Wasted",
    SW: "Severely Wasted",
    OW: "Overweight",
  },
  muac: {
    N: "Normal",
    MAM: "Moderate Acute Malnutrition",
    SAM: "Severe Acute Malnutrition",
  },
};

// Historical Nutritional Status Columns
export const createHistoricalNutritionalStatusColumns =
  (): ColumnDef<NutritionalStatusType>[] => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        row.original.date
          ? new Date(row.original.date).toLocaleDateString()
          : "N/A",
    },
    {
      accessorKey: "wfa",
      header: "WFA",
      cell: ({ row }) => {
        const status = row.original.wfa;
        const description =
          NUTRITIONAL_STATUS_DESCRIPTIONS.wfa[
            status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfa
          ] || "Unknown";
        return `${status} - ${description}`;
      },
    },
    {
      accessorKey: "lhfa",
      header: "LHFA",
      cell: ({ row }) => {
        const status = row.original.lhfa;
        const description =
          NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa[
            status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa
          ] || "Unknown";
        return `${status} - ${description}`;
      },
    },
    {
      accessorKey: "wfh",
      header: "WFH",
      cell: ({ row }) => {
        const status = row.original.wfh;
        const description =
          NUTRITIONAL_STATUS_DESCRIPTIONS.wfh[
            status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfh
          ] || "Unknown";
        return `${status} - ${description}`;
      },
    },
    {
      accessorKey: "muac",
      header: "MUAC",
      cell: ({ row }) => row.original.muac ?? "N/A",
    },
    {
      accessorKey: "muac_status",
      header: "MUAC Status",
      cell: ({ row }) => {
        const status = row.original.muac_status;
        const description =
          NUTRITIONAL_STATUS_DESCRIPTIONS.muac[
            status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.muac
          ] || "Unknown";
        return `${status} - ${description}`;
      },
    },
    {
      accessorKey: "edemaSeverity",
      header: "Edema",
      cell: ({ row }) => row.original.edemaSeverity || "N/A",
    },
  ];

// Historical Vital Signs Columns (Read-only)
export const createHistoricalVitalSignsColumns =
  (): ColumnDef<VitalSignType>[] => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date || "N/A",
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => row.original.age || "N/A",
    },
    {
      accessorKey: "wt",
      header: "Weight (kg)",
      cell: ({ row }) => row.original.wt || "N/A",
    },
    {
      accessorKey: "ht",
      header: "Height (cm)",
      cell: ({ row }) => row.original.ht || "N/A",
    },
    {
      accessorKey: "temp",
      header: "Temp (°C)",
      cell: ({ row }) => row.original.temp || "N/A",
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="max-w-[200px] text-left">
            <p className="whitespace-pre-wrap">
              {row.original.notes || "No notes for this entry."}
            </p>
            {row.original.followUpVisit && (
              <p className="mt-1 flex flex-col text-xs text-gray-500">
                <span>
                  Follow Up: {row.original.followUpVisit} (
                  {row.original.follov_description || "N/A"})
                </span>
                <span className="font-medium text-green-800">
                  Status: {row.original.followv_status}
                </span>
              </p>
            )}
          </div>
        </div>
      ),
    },
  ];

// Today's Entry Vital Signs Columns (Editable)
export const createTodaysVitalSignsColumns = (
  editingRowIndex: number | null,
  editVitalSignFormControl: Control<VitalSignType>,
  editVitalSignFormHandleSubmit: UseFormHandleSubmit<VitalSignType>,
  onUpdateVitalSign: (index: number, values: VitalSignType) => void,
  onStartEdit: (index: number, data: VitalSignType) => void,
  onCancelEdit: () => void,
  editVitalSignFormReset: (data: VitalSignType) => void
): ColumnDef<VitalSignType>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <FormDateTimeInput
            control={editVitalSignFormControl}
            name="date"
            label=""
            type="date"
            readOnly
          />
        );
      }
      return row.original.date;
    },
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <FormInput
            control={editVitalSignFormControl}
            name="age"
            label=""
            type="text"
            placeholder="Age"
            readOnly
          />
        );
      }
      return row.original.age;
    },
  },
  {
    accessorKey: "ht",
    header: "Height (cm)",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <FormInput
            control={editVitalSignFormControl}
            name="ht"
            label=""
            type="number"
            placeholder="Height"
            className="w-full"
          />
        );
      }
      return row.original.ht || "-";
    },
  },
  {
    accessorKey: "wt",
    header: "Weight (kg)",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <FormInput
            control={editVitalSignFormControl}
            name="wt"
            label=""
            type="number"
            placeholder="Weight"
            className="w-full"
          />
        );
      }
      return (
        <div className="flex justify-center">{row.original.wt || "-"}</div>
      );
    },
  },
  {
    accessorKey: "temp",
    header: "Temp (°C)",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <FormInput
            control={editVitalSignFormControl}
            name="temp"
            label=""
            type="number"
            placeholder="Temperature"
            className="w-full"
          />
        );
      }
      return (
        <div className="flex justify-center">{row.original.temp || "-"}</div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <div className="min-w-[250px] space-y-2">
            <FormTextArea
              control={editVitalSignFormControl}
              name="notes"
              label="Notes"
              placeholder="Enter notes"
              rows={3}
            />
            <FormTextArea
              control={editVitalSignFormControl}
              name="follov_description"
              label="Follow-up reason"
              placeholder="Follow-up reason"
              className="w-full"
              rows={3}
              readOnly={!!row.original.followv_id}
            />
            <FormDateTimeInput
              control={editVitalSignFormControl}
              name="followUpVisit"
              label="Follow-up date"
              type="date"
              readOnly={!!row.original.followv_id}
            />
          </div>
        );
      }
      const displayNotes = row.original.notes || "No notes for this entry.";
      return (
        <div className="flex justify-center ">
          <div className="max-w-[200px] text-left">
            <p className="whitespace-pre-wrap">{displayNotes}</p>
            {row.original.followUpVisit && (
              <p className="mt-1 flex flex-col  text-xs text-gray-500">
                {row.original.follov_description && (
                  <span>Follow up reason {row.original.follov_description}</span>
                )}
                <span>
                  Schedule on{row.original.followUpVisit} (
                  {row.original.followv_status || "N/A"})
                </span>
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const isEditing = editingRowIndex === row.index;
      if (isEditing) {
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={editVitalSignFormHandleSubmit((data) => {
                onUpdateVitalSign(row.index, data);
              })}
              className="bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
              className="px-2 py-1 text-xs"
            >
              Cancel
            </Button>
          </div>
        );
      }
      return (
        <Button
          size="sm"
          onClick={() => {
            onStartEdit(row.index, row.original);
            editVitalSignFormReset({
              date: row.original.date,
              age: row.original.age,
              wt: row.original.wt,
              ht: row.original.ht,
              temp: row.original.temp,
              follov_description: row.original.follov_description || "",
              followUpVisit: row.original.followUpVisit || "",
              notes: row.original.notes || "",
            });
          }}
          className="px-2 py-1"
          title="Edit vital sign"
        >
          Update
        </Button>
      );
    },
  },
];

// Historical Medicine Columns
export const createHistoricalMedicineColumns = (): ColumnDef<Medicine>[] => [
  {
    accessorKey: "name",
    header: "Medicine Name",
    cell: ({ row }) => {
      const { name, dosage, dosageUnit, form } = row.original;
      return name
        ? `${name} (${dosage || "N/A"} ${dosageUnit || ""}, ${form || "N/A"})`
        : "N/A";
    },
  },
  {
    accessorKey: "medrec_qty",
    header: "Quantity",
    cell: ({ row }) => row.original.medrec_qty,
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => row.original.reason || "N/A",
  },
];



export const createHistoricalSupplementStatusColumns = (
  editingAnemiaIndex: number | null,
  editingBirthWeightIndex: number | null,
  supplementStatusEditFormControl: Control<{ 
    date_completed: string | null;
  }>,
  supplementStatusEditFormHandleSubmit: UseFormHandleSubmit<{
    date_completed: string | null;
  }>,
  onSaveAnemiaDate: (index: number, date: string | null) => void,
  onSaveBirthWeightDate: (index: number, date: string | null) => void,
  onStartEditAnemia: (index: number, currentDate: string | null) => void,
  onStartEditBirthWeight: (index: number, currentDate: string | null) => void,
  onCancelEditAnemia: () => void,
  onCancelEditBirthWeight: () => void,
  supplementStatusEditFormReset: (data: {
    date_completed: string | null;
  }) => void
): ColumnDef<CHSSupplementStat>[] => [
  {
    accessorKey: "created_at",
    header: "Record Date",
    cell: ({ row }) =>
      row.original.created_at
        ? new Date(row.original.created_at).toLocaleDateString()
        : "N/A",
  },
  {
    accessorKey: "status_type",
    header: "Status Type",
    cell: ({ row }) => row.original.status_type || "N/A",
  },
  {
    accessorKey: "birthwt",
    header: "Birth Weight",
    cell: ({ row }) => row.original.birthwt || "N/A",
  },
  {
    accessorKey: "date_seen",
    header: "Date Seen",
    cell: ({ row }) =>
      row.original.date_seen
        ? new Date(row.original.date_seen).toLocaleDateString()
        : "N/A",
  },
  {
    accessorKey: "date_given_iron",
    header: "Date Iron Given",
    cell: ({ row }) => {
      return row.original.date_given_iron
        ? new Date(row.original.date_given_iron).toLocaleDateString()
        : "N/A";
    },
  },
  {
    accessorKey: "date_completed",
    header: "Date Completed",
    cell: ({ row }) => {
      const isEditingAnemia =
        editingAnemiaIndex === row.index &&
        row.original.status_type === "anemic";
      const isEditingBirthWeight =
        editingBirthWeightIndex === row.index &&
        row.original.status_type === "birthwt";
      if (isEditingAnemia || isEditingBirthWeight) {
        return (
          <FormDateTimeInput
            control={supplementStatusEditFormControl}
            name="date_completed"
            label=""
            type="date"
          />
        );
      }
      return row.original.date_completed
        ? new Date(row.original.date_completed).toLocaleDateString()
        : "N/A";
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isAnemic = row.original.status_type === "anemic";
      const isBirthWeight = row.original.status_type === "birthwt";
      const isEditingAnemia = editingAnemiaIndex === row.index && isAnemic;
      const isEditingBirthWeight = editingBirthWeightIndex === row.index && isBirthWeight;
      const hasDateCompleted = !!row.original.date_completed;

      if (isEditingAnemia) {
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={supplementStatusEditFormHandleSubmit((data) =>
                onSaveAnemiaDate(
                  row.index, 
                  data.date_completed || null
                )
              )}
              className="bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEditAnemia}
              className="px-2 py-1 text-xs"
            >
              Cancel
            </Button>
          </div>
        );
      } else if (isEditingBirthWeight) {
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={supplementStatusEditFormHandleSubmit((data) =>
                onSaveBirthWeightDate(
                  row.index, 
                  data.date_completed || null
                )
              )}
              className="bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEditBirthWeight}
              className="px-2 py-1 text-xs"
            >
              Cancel
            </Button>
          </div>
        );
      } else if ((isAnemic || isBirthWeight) && !hasDateCompleted) {
        return (
          <Button
            size="sm"
            onClick={() => {
              supplementStatusEditFormReset({
                date_completed: row.original.date_completed || null
              });
              if (isAnemic) {
                onStartEditAnemia(
                  row.index,
                  row.original.date_completed || null
                );
              } else {
                onStartEditBirthWeight(
                  row.index,
                  row.original.date_completed || null
                );
              }
            }}
            className="px-2 py-1"
            title="Update supplement status"
          >
            Update
          </Button>
        );
      }
      return null;
    },
  },
];