import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChildHealthFormSchema from "@/form-schema/chr-schema";

type Page2Schema = z.infer<typeof ChildHealthFormSchema>;

type Page2Props = {
  onPrevious4: () => void;
  onSubmitForm: () => void;
  updateFormData: (data: Partial<Page2Schema>) => void;
  formData: Partial<Page2Schema>;
};

const defaultVitalSign = {
  age: "",
  wt: "",
  ht: "",
  temp: "",
  findings: "",
  notes: "",
};

export default function ChildHRPageLast({
  onPrevious4,
  onSubmitForm,
  updateFormData,
  formData,
}: Page2Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<Page2Schema>({
    // resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      vitalSigns: formData?.vitalSigns || [],
    },
  });

  const dialogForm = useForm<Page2Schema>({
    // resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      vitalSigns: [defaultVitalSign],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "vitalSigns",
  });

  const handleSubmit = (data: Page2Schema) => {
    updateFormData(data);
    onSubmitForm();
  };

  const handleDialogSubmit = (data: any) => {
    const newVitalSign = {
      age: data.vitalSigns[0].age || "",
      wt: data.vitalSigns[0].wt || "",
      ht: data.vitalSigns[0].ht || "",
      temp: data.vitalSigns[0].temp || "",
      findings: data.vitalSigns[0].findings || "",
      notes: data.vitalSigns[0].notes || "",
    };
    
    append(newVitalSign);
    setIsDialogOpen(false);
    dialogForm.reset({
      vitalSigns: [defaultVitalSign],
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <h2 className="text-xl font-semibold mb-4">
            Child Health Information
          </h2>

          <Button 
            type="button" 
            onClick={() => setIsDialogOpen(true)}
          >
            Add Vital Signs
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Vital Signs</DialogTitle>
                <DialogDescription>
                  Enter the child's vital statistics and additional information
                </DialogDescription>
              </DialogHeader>
              
              <Form {...dialogForm}>
                <form className="space-y-4" onSubmit={dialogForm.handleSubmit(handleDialogSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={dialogForm.control}
                      name="vitalSigns.0.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dialogForm.control}
                      name="vitalSigns.0.wt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dialogForm.control}
                      name="vitalSigns.0.ht"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dialogForm.control}
                      name="vitalSigns.0.temp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={dialogForm.control}
                    name="vitalSigns.0.findings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Findings</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={dialogForm.control}
                    name="vitalSigns.0.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Display Added Data in Table */}
          {fields.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Age</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Height (cm)</TableHead>
                    <TableHead>Temperature (°C)</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.age}</TableCell>
                      <TableCell>{field.wt}</TableCell>
                      <TableCell>{field.ht}</TableCell>
                      <TableCell>{field.temp}</TableCell>
                      <TableCell>{field.findings}</TableCell>
                      <TableCell>{field.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onPrevious4}>
              Previous
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}