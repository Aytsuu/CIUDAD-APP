import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { MotherFormData, FatherFormData } from "../Schema/FormDataType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motherFormSchema, fatherFormSchema } from "../Schema/ProfilingSchema";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

interface ParentsInfoFormProps {
  onSubmit: (motherData: MotherFormData, fatherData: FatherFormData) => void;
  onBack: () => void;
  initialData: {
    motherInfo: MotherFormData;
    fatherInfo: FatherFormData;
  };
}

const ParentsForm = ({ onSubmit, onBack, initialData }: ParentsInfoFormProps) => {
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

  // Common form fields component
  const ParentFormFields = ({ 
    control, 
    prefix 
  }: { 
    control: any; 
    prefix: "Mother" | "Father" 
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <FormField
          control={control}
          name={`${prefix}LName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Last Name" {...field} />
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
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter First Name" {...field} />
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
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Middle Name" {...field} />
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
              <FormLabel>Suffix</FormLabel>
              <FormControl>
                <Input placeholder="Sfx." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name={`${prefix}DateOfBirth`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}Status`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status</FormLabel>
              <FormControl>
                <Input placeholder="Marital Status" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}Religion`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Religion</FormLabel>
              <FormControl>
                <Input placeholder="eg; Catholic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${prefix}EdAttainment`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Educational Attainment</FormLabel>
              <FormControl>
                <Input placeholder="*College Graduate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Mother's Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Mother's Information</h2>
          <Form {...motherForm}>
            <form>
              <ParentFormFields control={motherForm.control} prefix="Mother" />
            </form>
          </Form>
        </div>

        {/* Father's Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Father's Information</h2>
          <Form {...fatherForm}>
            <form>
              <ParentFormFields control={fatherForm.control} prefix="Father" />
            </form>
          </Form>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="w-32 bg-white border-2 border-blue/50 text-black/75 hover:bg-blue hover:text-white"
        >
          Prev
        </Button>
        <Button 
          onClick={handleSubmit}
          className="w-32 bg-blue hover:bg-darkBlue2"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ParentsForm;