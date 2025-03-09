import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function ParentsForm({
    control,
    prefix,
    title,
  }: {
    control: any;
    prefix: string;
    title: string;
  })  {

  return (
    <div className="bg-white rounded-lg">
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
                  Last Name
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
                  First Name
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
                  Middle Name
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
                  Suffix
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Sfx." {...field} />
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
                <FormLabel className="text-black/65">
                  Marital Status
                </FormLabel>
                <SelectLayout
                  placeholder='Select'
                  className='w-full'
                  options={[
                    {id: "0", name: "Single"},
                    {id: "1", name: "Married"},
                    {id: "2", name: "Divorced"},
                    {id: "3", name: "Widowed"},
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
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
                  Date of Birth
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
          <FormField
            control={control}
            name={`${prefix}Birthplace`}
            render={({ field }) => (
              <FormItem className="col-span-2"> 
                <FormLabel className="text-black/65">
                  Place of Birth
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
          <FormField
            control={control}
            name={`${prefix}Religion`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Religion
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
                  Citizenship
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
                  Contact#
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}Philheath`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Philhealth ID
                </FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Philhealth ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}VacStatus`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Vaccination Status
                </FormLabel>
                <SelectLayout
                  placeholder='Select'
                  className='w-full'
                  options={[
                    {id: "0", name: "Not Vaccinated"},
                    {id: "1", name: "First Dose"},
                    {id: "2", name: "Second Dose"},
                    {id: "3", name: "Boosted"},
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${prefix}BloodType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/65">
                  Blood Type
                </FormLabel>
                <SelectLayout
                  placeholder='Select'
                  className='w-full'
                  options={[
                    {id: "0", name: "A+"},
                    {id: "1", name: "A-"},
                    {id: "2", name: "B+"},
                    {id: "3", name: "B-"},
                    {id: "4", name: "AB+"},
                    {id: "5", name: "AB-"},
                    {id: "6", name: "O+"},
                    {id: "7", name: "O-"},
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
