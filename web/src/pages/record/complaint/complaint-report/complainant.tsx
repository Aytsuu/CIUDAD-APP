import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Phone, Mail } from "lucide-react";

export const ComplainantInfo = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
        <h3 className="text-base font-semibold text-black/70">
          Personal Information *
        </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={control}
          name="complainant.firstName"
          render={({ field }: any) => (
            <FormItem className="col-span-4">
              <FormLabel className="font-semibold text-black/50 ">
                First Name *
              </FormLabel>
              <FormControl>
                <Input placeholder="Juan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complainant.middleName"
          render={({ field }: any) => (
            <FormItem className="col-span-4">
              <FormLabel className="font-semibold text-black/50 ">
                Middle Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Santos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complainant.lastName"
          render={({ field }: any) => (
            <FormItem className="col-span-3">
              <FormLabel className="font-semibold text-black/50 ">
                Last Name *
              </FormLabel>
              <FormControl>
                <Input placeholder="Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complainant.suffix"
          render={({ field }: any) => (
            <FormItem className="col-span-1">
              <FormLabel className="font-semibold text-black/50 ">
                Suffix
              </FormLabel>
              <FormControl>
                <Input placeholder="Jr." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <FormField
          control={control}
          name="complainant.contactNumber"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50 ">
                Contact Number *
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-5 w-5 text-darkGray" />
                </div>
                <Input placeholder="09123456789" className="pl-10" {...field} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complainant.email"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50 ">
                Email
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-darkGray" />
                </div>
                <Input
                  placeholder="juan@example.com"
                  className="pl-10"
                  {...field}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        /> */}
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-black/70">
          Address Information *
        </h3>
        
        {/* Address fields in single line with separators */}
        <div className="space-y-2">
          <FormLabel className="font-semibold text-black/50">
            Sitio / Barangay / Municipality / Province * 
          </FormLabel>
          <div className="flex items-center border-2 border-gray-300 rounded-lg p-1 bg-white ">
            <FormField
              control={control}
              name="complainant.address.street"
              render={({ field }: any) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="123 Main St" 
                      {...field} 
                      className="border-none shadow-none p-0 h-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="mx-2 text-gray-400 font-medium">/</span>
            <FormField
              control={control}
              name="complainant.address.barangay"
              render={({ field }: any) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Barangay 1" 
                      {...field} 
                      className="border-none shadow-none p-0 h-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="mx-2 text-gray-400 font-medium">/</span>
            <FormField
              control={control}
              name="complainant.address.city"
              render={({ field }: any) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Cebu" 
                      {...field} 
                      className="border-none shadow-none p-0 h-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <span className="mx-2 text-gray-400 font-medium">/</span>
            <FormField
              control={control}
              name="complainant.address.province"
              render={({ field }: any) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Province" 
                      {...field} 
                      className="border-none shadow-none  p-0 h-8"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {/* Show validation messages for address fields */}
          <div className="space-y-1">
            <FormField
              control={control}
              name="complainant.address.street"
              render={() => <FormMessage />}
            />
            <FormField
              control={control}
              name="complainant.address.barangay"
              render={() => <FormMessage />}
            />
            <FormField
              control={control}
              name="complainant.address.city"
              render={() => <FormMessage />}
            />
            <FormField
              control={control}
              name="complainant.address.province"
              render={() => <FormMessage />}
            />
          </div>
        </div>

        {/* Sitio field on its own line */}
        {/* <div>
          <FormField
            control={control}
            name="complainant.address.sitio"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50 ">
                  Sitio/Purok
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sitio 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}
      </div>
    </div>
  );
};