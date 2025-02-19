import React from 'react';
import { useFieldArray, useForm } from "react-hook-form";
import { DependentFormData } from "../Schema/ProfilingDataType";
import { dependentFormSchema } from "../Schema/ProfilingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { X } from "lucide-react";

interface DependentInfoForm {
  onSubmit: (data: DependentFormData) => void;
  onBack: () => void;
  initialData?: DependentFormData;
}

export default function DependentsInfo({
  onSubmit,
  onBack,
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
      additionalDependents: []
    },
  });

  const { fields, append, remove } = useFieldArray<DependentFormData>({
    control: form.control,
    name: "additionalDependents"
  });

  const DependentFields = ({ index, isMain = false }: { index: number; isMain?: boolean }) => (
    <div className="relative border rounded-lg p-6 mb-6">
      {!isMain && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => remove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <h3 className="text-lg font-medium mb-4">
        {isMain ? "Primary Dependent" : `Additional Dependent ${index + 1}`}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={isMain ? "dependentLName" : `additionalDependents.${index}.dependentLName`}
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
          control={form.control}
          name={isMain ? "dependentFName" : `additionalDependents.${index}.dependentFName`}
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
          control={form.control}
          name={isMain ? "dependentMName" : `additionalDependents.${index}.dependentMName`}
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
          control={form.control}
          name={isMain ? "dependentSuffix" : `additionalDependents.${index}.dependentSuffix`}
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
          control={form.control}
          name={isMain ? "dependentSex" : `additionalDependents.${index}.dependentSex`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <FormControl>
                <Input placeholder="Enter Sex" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={isMain ? "dependentDateOfBirth" : `additionalDependents.${index}.dependentDateOfBirth`}
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
      </div>
    </div>
  );

  const addNewDependent = () => {
    append({
      dependentFName: "",
      dependentLName: "",
      dependentMName: "",
      dependentSuffix: "",
      dependentDateOfBirth: "",
      dependentSex: "",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dependent Information</h2>
          <Button
            type="button"
            onClick={addNewDependent}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Add Dependent
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DependentFields index={0} isMain={true} />
            
            {fields.map((field, index) => (
              <DependentFields
                key={field.id}
                index={index}
                isMain={false}
              />
            ))}

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-32 bg-white border-2 border-blue/50 text-black/75 hover:bg-blue hover:text-white"
              >
                Prev
              </Button>
              <Button type="submit" className="w-32 bg-blue hover:bg-darkBlue2">
                Register
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}