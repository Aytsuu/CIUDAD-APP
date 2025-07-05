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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="complainant.firstName"
          render={({ field }: any) => (
            <FormItem>
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
          name="complainant.lastName"
          render={({ field }: any) => (
            <FormItem>
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
          name="complainant.middleName"
          render={({ field }: any) => (
            <FormItem>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
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
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-black/70">
          Address Information *
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="complainant.address.street"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50 ">
                  Street *
                </FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="complainant.address.barangay"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50 ">
                  Barangay *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Barangay 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="complainant.address.city"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50 ">
                  City *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Cebu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="complainant.address.province"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50 ">
                  Province *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Cebu Province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>
      </div>
    </div>
  );
};
