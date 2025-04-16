import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import ReferralFormSchema from "@/form-schema/ReferralFormSchema"
import { patient, referral, bitedetails } from "./postrequest"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"

type ReferralFormModalProps = {
  onClose: () => void
  onAddPatient?: (patient: any) => void
}

const TextField = ({ name, label, ...rest }: { name: any; label: string; [key: string]: any }) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Input {...field} {...rest} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

const TextAreaField = ({ name, label }: { name: any; label: string }) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Textarea {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

const SelectField = ({ name, label, options }: { name: any; label: string; options: string[] }) => (
  <FormField
    name={name}
    render={({ field }) => (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
            <SelectContent>
              {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export default function ReferralFormModal({ onClose, onAddPatient }: ReferralFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof ReferralFormSchema>>({
    resolver: zodResolver(ReferralFormSchema),
    defaultValues: {
      receiver: "", sender: "", date: "", transient: false,
      p_lname: "", p_fname: "", p_mname: "", p_address: "",
      p_age: 0, p_gender: "", exposure_type: "", exposure_site: "",
      biting_animal: "", p_actions: "", p_referred: ""
    }
  })

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const values = form.getValues()
    setIsSubmitting(true)
    setError(null)

    try {
      const patientId = await patient(values)
      if (!patientId) throw new Error("Patient creation failed.")

      const referralId = await referral(values, patientId)
      if (!referralId) throw new Error("Referral creation failed.")

      const biteDetailsId = await bitedetails(values, referralId)
      if (!biteDetailsId) throw new Error("Bite details creation failed.")

      onAddPatient?.({
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
        actions: values.p_actions || "No actions recorded"
      })

      onClose()
    } catch (err: any) {
      console.error("❌ Error during submission:", err)
      setError(err?.message || "Failed to save record. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-3">
      <h2 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-2">Animal Bites Referral Form</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField name="receiver" label="Receiver" />
            <TextField name="sender" label="Sender" />
            <TextField name="date" label="Date" type="date" />
            <FormField
              name="transient"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Transient</Label>
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["p_lname", "p_fname", "p_mname"].map((field, i) => (
                <TextField key={field} name={field} label={["Last", "First", "Middle"][i] + " Name"} />
              ))}
              <TextAreaField name="p_address" label="Address" />
              <TextField name="p_age" label="Age" type="number" />
              <SelectField name="p_gender" label="Gender" options={["Male", "Female", "Other"]} />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Animal Bite Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <SelectField name="exposure_type" label="Type of Exposure" options={["bite", "non-bite"]} />
              <TextField name="exposure_site" label="Site of Exposure" />
              <TextField name="biting_animal" label="Biting Animal" />
              <TextAreaField name="p_actions" label="Actions Taken" />
              <TextField name="p_referred" label="Referred by" />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
