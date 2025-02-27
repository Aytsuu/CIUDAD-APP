import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { PersonalFormData } from "../../../form-schema/profiling-schema/ProfilingDataType";
import { personalFormSchema } from "../../../form-schema/profiling-schema/ProfilingSchema";
import { Link } from "react-router";

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
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      {" "}
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-2 sm:px-6 md:px-12 lg:px-24"
        >
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="lg:col-span-4">
                  <FormLabel className="font-medium text-black/65">
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="lg:col-span-4">
                  <FormLabel className="font-medium text-black/65">
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-3">
                  <FormLabel className="font-medium text-black/65">
                    Middle Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="font-medium text-black/65">
                    Suffix <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Sfx." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sex, Status, DOB, Birth Place */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
                  <FormLabel className="font-medium text-black/65">
                    Sex <span className="text-red-500">*</span>
                  </FormLabel>
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
                  <FormLabel className="font-medium text-black/65">
                    Marital Status <span className="text-red-500">*</span>
                  </FormLabel>
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
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
                  <FormLabel className="font-medium text-black/65">
                    Date of Birth <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="Date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-6">
                  <FormLabel className="font-medium text-black/65">
                    Place of Birth <span className="text-red-500">*</span>
                  </FormLabel>
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

          {/* Citizenship, Religion, Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="citizenship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-black/65">
                    Citizenship <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Citizenship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-black/65">
                    Religion <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Religion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-black/65">
                    Contact# <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8 sm:mt-auto">
            <div className="p-4 flex flex-col sm:flex-row justify-end gap-4 sm:gap-x-4 bg-white">
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="w-full sm:w-auto">
                Next
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
