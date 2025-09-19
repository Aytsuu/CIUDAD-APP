import { FormInput } from "@/components/ui/form/form-input";
export default function AccountRegistrationForm({form, prefix = ""} : {
  form: any
  prefix: string
}) {

  return (
    <div className="grid gap-4">
      <FormInput control={form.control} name={`${prefix}email`} label="Email (optional)" placeholder="Enter email (optional)"/>
      <FormInput control={form.control} name={`${prefix}phone`} label="Phone Number" placeholder="Enter phone number" type="number"/>
      <FormInput control={form.control} name={`${prefix}password`} label="Password" placeholder="Enter password" type="password"/>
      <FormInput control={form.control} name={`${prefix}confirm_password`} label="Confirm Password" placeholder="Re-enter password" type="password"/>
    </div>
  )
}