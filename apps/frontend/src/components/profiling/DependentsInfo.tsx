import { useForm } from "react-hook-form";
import { DependentFormData } from "./FormDataType";
import { dependentFormSchema } from "./ProfilingSchema";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

interface DependentInfoForm {
  onSubmit: (data: DependentFormData) => void;
  onBack: () => void;
  initialData?: DependentFormData;
}

export default function DependentsInfo({
  onSubmit, onBack,
  initialData,
}: DependentInfoForm) {
  const form = useForm<DependentFormData>({
    resolver: zodResolver(dependentFormSchema),
    defaultValues: initialData || {
      dependentFName: "",
      dependentLName: "",
      dependentMName: "",
      dependentSuffix: "",
      dependentDateOfBirth: "",
      dependentSex: "",
    },
  });

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="dependentLName"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dependentFName"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dependentMName"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Middle Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dependentSuffix"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Suffix</FormLabel>
                <FormControl>
                  <Input placeholder="Sfx." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dependentSex"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dependentDateOfBirth"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="mm/dd/yyyy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <button type="button" onClick={onBack}>Prev</button>
          <button type="submit">Register</button>
        </form>
      </Form>
    </div>
  );
}
