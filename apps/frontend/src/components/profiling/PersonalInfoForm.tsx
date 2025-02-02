import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Button } from "@/components/ui/button";
import { PersonalFormData } from "../profiling/FormDataType";
import { personalFormSchema } from "../profiling/ProfilingSchema";

interface PersonalInfoFormProps {
  onSubmit: (data: PersonalFormData) => void;
  initialData?: Partial<PersonalFormData>;
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
      birthPlace: "",
      citizenship: "",
      religion: "",
      contact: "",
    },
  });

  return (
    <div className="p-4">
      {/* <ProfilingTable/> */}
      <div className="flex pb-10 justify-between">
        <h1 className="text-center font-bold">Personal Information</h1>
        {/* Progress */}
        <div className="flex gap-x-4">
          <div className="rounded-full w-8 h-8 bg-[#263D67] flex items-center justify-center">
            <User className="text-white" />
          </div>
          <div className="rounded-full w-8 h-8 bg-[#263D67]"></div>
          <div className="rounded-full w-8 h-8 bg-[#263D67]"></div>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-4 gap-4"
        >
          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Enter Last Name"
                    {...field}
                  />
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
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Enter First Name"
                    {...field}
                  />
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
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    placeholder="Enter Middle Name"
                    {...field}
                  />
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
              <FormItem>
                <FormLabel>Suffix</FormLabel>
                <FormControl>
                  <Input className="col-span-1" placeholder="Sfx." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Sex */}
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>Status</FormLabel>
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
          {/* Place of Birth */}
          <FormField
            control={form.control}
            name="birthPlace"
            render={({ field }) => (
              <FormItem>
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
                <FormLabel>Citizenship</FormLabel>
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
                <FormLabel>Citizenship</FormLabel>
                <FormControl>
                  <Input placeholder="Contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit Button */}
          <div className="col-span-4 flex justify-end mt-4">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
