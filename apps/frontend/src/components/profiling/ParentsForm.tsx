import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { MotherFormData, FatherFormData } from "./FormDataType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motherFormSchema, fatherFormSchema } from "./ProfilingSchema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ParentsInfoFormProps {
  onSubmit: (motherData: MotherFormData, fatherData: FatherFormData) => void;
  onBack: () => void;
  initialData: {
    motherInfo: MotherFormData;
    fatherInfo: FatherFormData;
  };
}

const ParentsForm = (
  { onSubmit,onBack, initialData }: ParentsInfoFormProps,
) => {

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

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-8">
        {/* Mother's Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mother's Information</h2>
          <Form {...motherForm}>
            <form className="space-y-4">
              <FormField
                control={motherForm.control}
                name="MotherLName"
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
              {/* Repeat for other mother fields */}
              <FormField
                control={motherForm.control}
                name="MotherFName"
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
                control={motherForm.control}
                name="MotherMName"
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
                control={motherForm.control}
                name="MotherSuffix"
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
              <FormField
                control={motherForm.control}
                name="MotherDateOfBirth"
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
                control={motherForm.control}
                name="MotherStatus"
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
                control={motherForm.control}
                name="MotherReligion"
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
                control={motherForm.control}
                name="MotherEdAttainment"
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
            </form>
          </Form>
        </div>

        {/* Father's Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Father's Information</h2>
          <Form {...fatherForm}>
            <form className="space-y-4">
              <FormField
                control={fatherForm.control}
                name="FatherLName"
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
                control={fatherForm.control}
                name="FatherFName"
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
                control={fatherForm.control}
                name="FatherMName"
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
                control={fatherForm.control}
                name="FatherSuffix"
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
              <FormField
                control={fatherForm.control}
                name="FatherDateOfBirth"
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
                control={fatherForm.control}
                name="FatherStatus"
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
                control={fatherForm.control}
                name="FatherReligion"
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
                control={fatherForm.control}
                name="FatherEdAttainment"
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
            </form>
          </Form>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={onBack}>Back</Button>
        <Button onClick={handleSubmit}>Next</Button>
      </div>
    </div>
  );
};

export default ParentsForm;
