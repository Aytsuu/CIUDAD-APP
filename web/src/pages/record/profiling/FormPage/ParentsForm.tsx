import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { MotherFormData, FatherFormData } from "../_types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motherFormSchema, fatherFormSchema } from "@/form-schema/ProfilingSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

interface ParentsInfoFormProps {
  onSubmit: (motherData: MotherFormData, fatherData: FatherFormData) => void;
  onBack: () => void;
  initialData: {
    motherInfo: MotherFormData;
    fatherInfo: FatherFormData;
  };
}

const ParentsForm = ({
  onSubmit,
  onBack,
  initialData,
}: ParentsInfoFormProps) => {
  const motherForm = useForm<MotherFormData>({
    resolver: zodResolver(motherFormSchema),
    defaultValues: initialData.motherInfo || {
      MotherLName: "",
      MotherFName: "",
      MotherMName: "",
      MotherSuffix: "",
      MotherDateOfBirth: "",
      MotherStatus: "",
      MotherReligion: "",
      MotherEdAttainment: "",
    },
  });

  const fatherForm = useForm<FatherFormData>({
    resolver: zodResolver(fatherFormSchema),
    defaultValues: initialData.fatherInfo || {
      FatherLName: "",
      FatherFName: "",
      FatherMName: "",
      FatherSuffix: "",
      FatherDateOfBirth: "",
      FatherStatus: "",
      FatherReligion: "",
      FatherEdAttainment: "",
    },
  });

  const handleSubmit = () => {
    const isMotherValid = motherForm.trigger();
    const isFatherValid = fatherForm.trigger();

    Promise.all([isMotherValid, isFatherValid]).then(
      ([motherValid, fatherValid]) => {
        if (motherValid && fatherValid) {
          onSubmit(motherForm.getValues(), fatherForm.getValues());
        }
      }
    );
  };

  // Form section for each parent
  const ParentFormSection = ({
    control,
    prefix,
    title,
  }: {
    control: any;
    prefix: "Mother" | "Father";
    title: string;
  }) => (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>

      <div className="px-24">
        {/* Name row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <FormField
            control={control}
            name={`${prefix}LName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Last Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder={`Enter Last Name`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}FName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder={`Enter First Name`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}MName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Middle Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder={`Enter Middle Name`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}Suffix`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Suffix <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Sfx." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Status and Date of Birth row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <FormField
            control={control}
            name={`${prefix}Status`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Marital Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}DateOfBirth`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Date of Birth <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="w-full" 
                    placeholder="dd/mm/yyyy" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <FormField
              control={control}
              name={`${prefix}Birthplace`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Place of Birth <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      className="w-full" 
                      placeholder="Street/Barangay/Municipality/Province/City" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Religion, Citizenship, and Contact row */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name={`${prefix}Religion`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Religion <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Religion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}Citizenship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Citizenship <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Citizenship" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}Contact`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Contact# <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-8">
        {/* Mother's Information */}
        <Form {...motherForm}>
          <form>
            <ParentFormSection 
              control={motherForm.control} 
              prefix="Mother" 
              title="Mother's Information" 
            />
          </form>
        </Form>

        {/* Father's Information */}
        <Form {...fatherForm}>
          <form>
            <ParentFormSection 
              control={fatherForm.control} 
              prefix="Father" 
              title="Father's Information" 
            />
          </form>
        </Form>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={onBack}>
          Prev
        </Button>
        <Button onClick={handleSubmit}>Next</Button>
      </div>
    </div>
  );
};

export default ParentsForm;