import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import ReferralFormSchema from "@/form-schema/ReferralFormSchema";

type ReferralFormModalProps = {
  onClose: () => void;
  onAddPatient?: (patient: any) => void; // Add this line
};

export default function ReferralFormModal({ onClose, onAddPatient }: ReferralFormModalProps) {
  function onSubmit(values: z.infer<typeof ReferralFormSchema>) {
    console.log("Form submitted:", values);
    if (onAddPatient) onAddPatient(values); // Ensure patient data is sent
    onClose();
  }
  const form = useForm<z.infer<typeof ReferralFormSchema>>({
    resolver: zodResolver(ReferralFormSchema),
    defaultValues: {
      receiver: "",
      sender: "",
      date: "",
      transient: false,
      p_lname: "",
      p_fname: "",
      p_mname: "",
      p_address: "",
      p_age: 0,
      p_gender: "",
      p_exposure: "",
      p_siteofexposure: "",
      p_bitinganimal: "",
      p_lab_exam: "",
      p_actions: "",
      p_referred: "",
    },
  });

  return (
    <div className="p-6">
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-2">
        Animal Bites Referral Form
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Receiver */}
          <FormField
            control={form.control}
            name="receiver"
            render={({ field }) => (
              <FormItem>
                <Label>Receiver:</Label>
                <FormControl>
                  <Input placeholder="Enter recipient" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sender */}
          <FormField
            control={form.control}
            name="sender"
            render={({ field }) => (
              <FormItem>
                <Label>Sender:</Label>
                <FormControl>
                  <Input placeholder="Enter sender" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <Label>Date:</Label>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transient Checkbox */}
          <FormField
            control={form.control}
            name="transient"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <Label>Transient</Label>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 🔹 Patient Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>

            {/* Last Name */}
            <FormField
              control={form.control}
              name="p_lname"
              render={({ field }) => (
                <FormItem>
                  <Label>Last Name:</Label>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="p_fname"
              render={({ field }) => (
                <FormItem>
                  <Label>First Name:</Label>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Middle Name */}
            <FormField
              control={form.control}
              name="p_mname"
              render={({ field }) => (
                <FormItem>
                  <Label>Middle Name:</Label>
                  <FormControl>
                    <Input placeholder="Enter middle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="p_address"
              render={({ field }) => (
                <FormItem>
                  <Label>Address:</Label>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age */}
            <FormField
              control={form.control}
              name="p_age"
              render={({ field }) => (
                <FormItem>
                  <Label>Age:</Label>
                  <FormControl>
                    <Input type="number" placeholder="Enter age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="p_gender"
              render={({ field }) => (
                <FormItem>
                  <Label>Gender:</Label>
                  <FormControl>
                    <Input placeholder="Enter gender" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 🔹 Animal Bite Details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Animal Bite Details</h3>

            {/* Exposure Type */}
            <FormField
              control={form.control}
              name="p_exposure"
              render={({ field }) => (
                <FormItem>
                  <Label>Type of Exposure:</Label>
                  <FormControl>
                    <Input placeholder="Enter exposure type (e.g., Bite, Scratch)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Site of Exposure */}
            <FormField
              control={form.control}
              name="p_siteofexposure"
              render={({ field }) => (
                <FormItem>
                  <Label>Site of Exposure:</Label>
                  <FormControl>
                    <Input placeholder="Enter body part affected" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Biting Animal */}
            <FormField
              control={form.control}
              name="p_bitinganimal"
              render={({ field }) => (
                <FormItem>
                  <Label>Biting Animal:</Label>
                  <FormControl>
                    <Input placeholder="Enter animal type (e.g., Dog, Cat)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 🔹 Additional Actions */}
          <FormField
            control={form.control}
            name="p_actions"
            render={({ field }) => (
              <FormItem>
                <Label>Actions Taken:</Label>
                <FormControl>
                  <Textarea placeholder="Describe the required actions..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" className="bg-red-600 hover:bg-red-800 text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-800 text-white">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
