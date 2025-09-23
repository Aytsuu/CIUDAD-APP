"use client";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormHandleSubmit, Control, useWatch } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form/form";

// Reusable Form Component
interface VitalSignFormCardProps {
  title: string;
  control: Control<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  isReadOnly?: boolean;
}

export const VitalSignFormCard = ({ title, control, handleSubmit, onSubmit, onCancel, submitButtonText = "Save", cancelButtonText = "Cancel", isReadOnly = false }: VitalSignFormCardProps) => {
  // Watch the date field to check if it's today
  const date = useWatch({ control, name: "date" });
  const isTodayDate = date && new Date(date).toDateString() === new Date().toDateString();
  const shouldBeReadOnly = isReadOnly || isTodayDate;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit(onSubmit)} className="bg-green-600 px-3 py-1 text-xs hover:bg-green-700" disabled={shouldBeReadOnly}>
              {submitButtonText}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="px-3 py-1 text-xs">
              {cancelButtonText}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <FormInput control={control} name="date" label="Date" type="text" placeholder="Date" readOnly />
          <FormInput control={control} name="age" label="Age" type="text" placeholder="Age" readOnly />
          <FormInput control={control} name="ht" label="Height (cm)" type="number" placeholder="Enter height" readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
          <FormInput control={control} name="wt" label="Weight (kg)" type="number" placeholder="Enter weight" readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
          <FormInput control={control} name="temp" label="Temperature (°C)" type="number" placeholder="Enter temperature" readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
        </div>

        <FormField
          control={control}
          name="is_opt"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={shouldBeReadOnly} />
              </FormControl>
              <FormLabel className="text-sm font-medium text-gray-700">Are you going to use this weighing for OPT tracking reports?</FormLabel>
            </FormItem>
          )}
        />


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormTextArea control={control} name="remarks" label="Remarks" placeholder="Enter remarks" rows={2} readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
          <FormTextArea control={control} name="notes" label="Notes" placeholder="Enter notes" rows={2} readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormDateTimeInput control={control} name="followUpVisit" label="Follow-up date" type="date" readOnly={shouldBeReadOnly} />
          <FormTextArea control={control} name="follov_description" label="Follow-up reason" placeholder="Enter reason for follow-up" rows={2} readOnly={shouldBeReadOnly} className={shouldBeReadOnly ? "bg-gray-100" : ""} />
        </div>
      </div>
    </div>
  );
};

// View Mode Card
export const ViewCard = ({ data, onEdit }: { data: any; index: number; onEdit: () => void }) => {
  const isOpt = data.is_opt || false;
  const isTodayDate = data.date && new Date(data.date).toDateString() === new Date().toDateString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">Vital Signs - {data.date}</h4>
          {isOpt && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">OPT Tracking</span>}
          {isTodayDate && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Today</span>}
        </div>
        <Button size="sm" onClick={onEdit} className="px-3 py-1 text-xs" disabled={isOpt || isTodayDate}>
          {isOpt || isTodayDate ? "View Only" : "Edit"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-gray-600">Age</div>
          <div className="font-medium">{data.age || "N/A"}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-600">Temperature</div>
          <div className="font-medium">{data.temp ? `${data.temp} °C` : "-"}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-600">Height</div>
          <div className="font-medium">{data.ht ? `${data.ht} cm` : "-"}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-600">Weight</div>
          <div className="font-medium">{data.wt ? `${data.wt} kg` : "-"}</div>
        </div>
      </div>

      {data.remarks && (
        <div className="border-t pt-3">
          <div className="text-sm text-gray-600">Remarks</div>
          <p className="text-sm whitespace-pre-wrap">{data.remarks}</p>
        </div>
      )}

      {data.notes && (
        <div className="border-t pt-3">
          <div className="text-sm text-gray-600">Notes</div>
          <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}

      {data.followUpVisit && (
        <div className="border-t pt-3">
          <div className="text-sm text-gray-600">Follow-up</div>
          <div className="text-sm">
            {data.follov_description && <p>Reason: {data.follov_description}</p>}
            <p>
              Scheduled: {data.followUpVisit} ({data.followv_status || "N/A"})
            </p>
          </div>
        </div>
      )}

     
    </div>
  );
};

// Edit Mode Card
export const EditCard = ({ data, index, control, handleSubmit, onUpdate, onCancel }: { data: any; index: number; control: Control<any>; handleSubmit: UseFormHandleSubmit<any>; onUpdate: (index: number, values: any) => void; onCancel: () => void }) => {
  const isOpt = data.is_opt || false;
  const isTodayDate = data.date && new Date(data.date).toDateString() === new Date().toDateString();
  const isReadOnly = isOpt || isTodayDate;

  return <VitalSignFormCard title={`Editing - ${data.date}`} control={control} handleSubmit={handleSubmit} onSubmit={(formData) => onUpdate(index, formData)} onCancel={onCancel} submitButtonText="Save" cancelButtonText="Cancel" isReadOnly={isReadOnly} />;
};

interface VitalSignsCardViewProps {
  data: any[];
  editingRowIndex: number | null;
  editVitalSignFormControl: Control<any>;
  editVitalSignFormHandleSubmit: UseFormHandleSubmit<any>;
  onUpdateVitalSign: (index: number, values: any) => void;
  onStartEdit: (index: number, data: any) => void;
  onCancelEdit: () => void;
  editVitalSignFormReset: (data: any) => void;
}

export const VitalSignsCardView = ({ data, editingRowIndex, editVitalSignFormControl, editVitalSignFormHandleSubmit, onUpdateVitalSign, onStartEdit, onCancelEdit, editVitalSignFormReset }: VitalSignsCardViewProps) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isEditing = editingRowIndex === index;
        const isOpt = item.is_opt || false;
        const isTodayDate = item.date && new Date(item.date).toDateString() === new Date().toDateString();
        const canEdit = !isOpt && !isTodayDate;

        return (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {isEditing ? (
              <EditCard data={item} index={index} control={editVitalSignFormControl} handleSubmit={editVitalSignFormHandleSubmit} onUpdate={onUpdateVitalSign} onCancel={onCancelEdit} />
            ) : (
              <ViewCard
                data={item}
                index={index}
                onEdit={() => {
                  if (canEdit) {
                    onStartEdit(index, item);
                    editVitalSignFormReset({
                      date: item.date,
                      age: item.age,
                      wt: item.wt,
                      ht: item.ht,
                      temp: item.temp,
                      remarks: item.remarks || "",
                      follov_description: item.follov_description || "",
                      followUpVisit: item.followUpVisit || "",
                      notes: item.notes || "",
                      followv_status: item.followv_status || "",
                      followv_id: item.followv_id || "",
                      chvital_id: item.chvital_id || "",
                      is_opt: item.is_opt || false
                    });
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};