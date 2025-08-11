import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { useFieldArray } from "react-hook-form";
import { SummonTimeSchemaArray } from "@/form-schema/summon-time-schema";

export default function SummonTimeSlot() {
  const form = useForm<z.infer<typeof SummonTimeSchemaArray>>({
    resolver: zodResolver(SummonTimeSchemaArray),
    defaultValues: {
      items: [{
        start_time: "",
        end_time: ""
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const handleAddTimeSlot = () => {
    append({ start_time: "", end_time: "" });
  };

  const handleRemoveTimeSlot = (index: number) => {
    remove(index);
  };

  return (
    <div>
      <Form {...form}>
        <form>
          {fields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border rounded-lg relative">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveTimeSlot(index)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormDateTimeInput
                  control={form.control}
                  label="Start Time"
                  type="time"
                  name={`items.${index}.start_time`}
                />

                <FormDateTimeInput
                  control={form.control}
                  label="End Time"
                  type="time"
                  name={`items.${index}.end_time`}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={handleAddTimeSlot}
          >
            <Plus size={16} className="mr-2" /> Add Time Slot
          </Button>
        </form>
      </Form>
    </div>
  );
}