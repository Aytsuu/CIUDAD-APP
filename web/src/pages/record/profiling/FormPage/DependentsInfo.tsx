import React from 'react';
import { useFieldArray, useForm } from "react-hook-form";
import { DependentFormData } from "../_types";
import { dependentFormSchema } from "@/form-schema/ProfilingSchema";
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
} from "@/components/ui/form/form";
import { X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

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
    <div className="relative bg-white p-6 mb-6">
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
      
      <h2 className="font-semibold text-lg">
        {isMain ? "Dependent Information" : `Dependent Information (${index + 1})`}
      </h2>
      <p className="text-black/65 text-sm mb-6">Fill out all necessary fields</p>
      
      <div className="px-4 md:px-8 lg:px-24">
        {/* Name row - now 3 columns, responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <FormField
            control={form.control}
            name={isMain ? "dependentLName" : `additionalDependents.${index}.dependentLName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Last Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Enter Last Name" {...field} />
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
                <FormLabel className="text-black/65">
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Enter First Name" {...field} />
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
                <FormLabel className="text-black/65">
                  Middle Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Enter Middle Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Second row - now 3 columns, responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={isMain ? "dependentSuffix" : `additionalDependents.${index}.dependentSuffix`}
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
          <FormField
            control={form.control}
            name={isMain ? "dependentSex" : `additionalDependents.${index}.dependentSex`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Sex <span className="text-red-500">*</span>
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
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={isMain ? "dependentDateOfBirth" : `additionalDependents.${index}.dependentDateOfBirth`}
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
        </div>
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Dependent Information</h2>
        <Button
          onClick={addNewDependent}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus/>Dependent
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

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-32"
            >
              Prev
            </Button>
            <Button type="submit" className="w-full sm:w-32">
              Register
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}