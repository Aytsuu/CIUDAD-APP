import { FormInput } from "@/components/ui/form/form-input";
export default function AccountRegistrationForm({form, prefix = ""} : {
  form: any
  prefix: string
}) {

  return (
    <div className="grid gap-4">
      <FormInput control={form.control} name={`${prefix}username`} label="Username" placeholder="Enter username"/>
      <FormInput control={form.control} name={`${prefix}email`} label="Email" placeholder="Enter email (optional)"/>
      <FormInput control={form.control} name={`${prefix}phone`} label="Phone Number" placeholder="Enter phone number"/>
      <FormInput control={form.control} name={`${prefix}password`} label="Password" placeholder="Enter password" type="password"/>
      <FormInput control={form.control} name={`${prefix}confirmPassword`} label="Confirm Password" placeholder="Re-enter password" type="password"/>
    </div>
  )
}