import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Button } from "../../ui/button";
import { PersonalFormData } from "../Schema/FormDataType";
import { personalFormSchema } from "../Schema/ProfilingSchema";


interface PersonalInfoFormProps {
  onSubmit: (data: PersonalFormData) => void;
  initialData?: PersonalFormData;
}

const PersonalInfoForm = ({ onSubmit, initialData }: PersonalInfoFormProps) => {
  const form = useForm<PersonalFormData>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: initialData || {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      sex: "",
      status: "",
      dateOfBirth: "",
      birthPlace: "",
      citizenship: "",
      religion: "",
      contact: "",
    },
  });

  return (
    <div className="p-4 border-2 mx-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormLabel className="font-medium text-gray-500">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
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
            {/* Middle Name */}
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Suffix */}
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Suffix</FormLabel>
                  <FormControl>
                    <Input placeholder="Sfx." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Sex */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Sex</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Marital Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Street/Barangay/Municipality/Province/City"
                      type="Date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Place of Birth */}
            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem className="col-span-6">
                  <FormLabel>Place of Birth</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Street/Barangay/Municipality/Province/City"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            {/* Citizenship */}
            <FormField
              control={form.control}
              name="citizenship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Citizenship</FormLabel>
                  <FormControl>
                    <Input placeholder="Citizenship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Religion */}
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <FormControl>
                    <Input placeholder="Religion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Contact */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">Contact#</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Submit Button */}
          <div className="col-span-4 flex justify-end mt-4 align-bottom gap-x-4">
            <Button
              type="button"
              className="bg-white text-black hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
