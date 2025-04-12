

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import ReferralFormSchema from "@/form-schema/ReferralFormSchema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useState } from "react"
import { patient, referral, bitedetails } from "./postrequest"

type ReferralFormModalProps = {
  onClose: () => void
  onAddPatient?: (patient: any) => void
}

export default function ReferralFormModal({ onClose, onAddPatient }: ReferralFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

    if (onAddPatient) {
      const newPatient = {
        id: Date.now(),
        receiver: values.receiver,
        sender: values.sender,
        transient: values.transient,
        lname: values.p_lname,
        fname: values.p_fname,
        midname: values.p_mname,
        address: values.p_address,
        age: values.p_age.toString(),
        gender: values.p_gender,
        date: values.date,
        exposure: values.p_exposure,
        siteOfExposure: values.p_siteofexposure,
        bitingAnimal: values.p_bitinganimal,
        actions: values.p_actions || "No actions recorded",
        referred: values.p_referred
      };

      console.log("Adding new patient:", newPatient);
      onAddPatient(newPatient);

      onClose();
    } else {
      console.log("❌ onAddPatient function is missing!");
    }
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
      exposure_type: "",
      exposure_site: "",
      biting_animal: "",
      p_actions: "",
      p_referred: "",
    },
  })
  async function onSubmit() {
    const isValid = form.trigger()

    if (!isValid) {
      return
    }

    const values = form.getValues()
    console.log("Form submitted with values:", values);

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Creating patient...");
      const patientId = await patient(values);
      console.log("Patient created with ID:", patientId);

      console.log("Creating referral...");
      const referralId = await referral(values, patientId);
      console.log("Referral created with ID:", referralId);

      console.log("Creating bite details...");
      const biteDetailsId = await bitedetails(values, referralId);
      console.log("Bite details created with ID:", biteDetailsId);

      if (onAddPatient) {
        const newPatient = {
          id: referralId,
          lname: values.p_lname,
          fname: values.p_fname,
          mname: values.p_mname,
          address: values.p_address,
          age: values.p_age.toString(),
          gender: values.p_gender,
          date: values.date,
          transient: values.transient,
          exposure: values.exposure_type,
          siteOfExposure: values.exposure_site,
          bitingAnimal: values.biting_animal,
          actions: values.p_actions || "No actions recorded",
        };
        console.log("Adding patient to state:", newPatient);
        onAddPatient(newPatient);
      }

      console.log("All data saved successfully");
      onClose();
    } catch (err) {
      console.error("Failed to save record:", err);
      setError("Failed to save record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className="p-3">
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-2">Animal Bites Referral Form</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Checkbox
                      className="mt-3 border border-black"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label>Transient</Label>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Patient Information Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <FormField
                control={form.control}
                name="p_gender"
                render={({ field }) => (
                  <FormItem>
                    <Label>Gender:</Label>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Animal Bite Details Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Bite Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Exposure Type */}
              <FormField
                control={form.control}
                name="exposure_type"
                render={({ field }) => (
                  <FormItem>
                    <Label>Type of Exposure:</Label>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bite">Bite</SelectItem>
                          <SelectItem value="non-bite">Non-bite</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Site of Exposure */}
              <FormField
                control={form.control}
                name="exposure_site"
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
                name="biting_animal"
                render={({ field }) => (
                  <FormItem>
                    <Label>Biting Animal:</Label>
                    <FormControl>
                      <Input placeholder="e.g., Dog, Cat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions Taken */}
              <FormField
                control={form.control}
                name="p_actions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <Label>Actions Taken:</Label>
                    <FormControl>
                      <Textarea placeholder="Describe the required actions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="p_referred"
                render={({ field }) => (
                  <FormItem>
                    <Label>Referred by:</Label>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
