import { FormInput } from "@/components/ui/form/form-input";
import { accountFormSchema } from "@/form-schema/account-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export default function AccountRegistrationForm({form} : {
  form: UseFormReturn<z.infer<typeof accountFormSchema>>
}) {

  return (
    <div className="grid gap-4">
      <FormInput control={form.control} name="username" label="Username" placeholder="Enter username"/>
      <FormInput control={form.control} name="email" label="Email" placeholder="Enter email (optional)"/>
      <FormInput control={form.control} name="password" label="Password" placeholder="Enter password" type="password"/>
      <FormInput control={form.control} name="confirmPassword" label="Confirm Password" placeholder="Re-enter password" type="password"/>
    </div>
  )
}