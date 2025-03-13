import {
  Form,
} from "@/components/ui/form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ParentsForm from "./ParentsForm";
import { profilingFormSchema } from "@/form-schema/profiling-schema";

export default function ParentsFormLayout(
  { form, onSubmit, back}: {
    form: UseFormReturn<z.infer<typeof profilingFormSchema>>,
    onSubmit: () => void,
    back: () => void
  }) {

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-8">
        {/* Mother's Information */}
        <Form {...form}>
          <form>
            <ParentsForm 
              control={form.control} 
              prefix="motherInfo." 
              title="Mother's Information" 
            />
          </form>
        </Form>

        {/* Father's Information */}
        <Form {...form}>
          <form>
            <ParentsForm 
              control={form.control} 
              prefix="fatherInfo." 
              title="Father's Information" 
            />
          </form>
        </Form>
      </div>

      <div className="mt-8 flex justify-end gap-2 px-24 sm:gap-3">
        <Button variant="outline" className="w-full sm:w-32" onClick={back}>
          Prev
        </Button>
        <Button onClick={onSubmit} className="w-full sm:w-32">Next</Button>
      </div>
    </div>
  );
};