import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { FormInput } from "@/components/ui/form/form-input"
import { accountFormSchema } from "@/form-schema/account-schema"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button/button"
import { Link } from "react-router"

export default function AccountRegistrationForm({form, onSubmit} : {
  form: UseFormReturn<z.infer<typeof accountFormSchema>>
  onSubmit: () => void
}) {
  return (
    <>
      <div className="grid gap-4">
        <FormInput control={form.control} name="username" label="Username"/>
        <FormInput control={form.control} name="email" label="Email"/>
        <FormInput control={form.control} name="password" label="Enter your password" type="password"/>
        <FormInput control={form.control} name="confirmPassword" label="Re-enter your password" type="password"/>
      </div>
      <div className="flex justify-between">
        <Link to="/resident">
          <Button variant={"outline"} className="border-none shadow-none font-normal">
            Skip for now
          </Button>
        </Link>
        <ConfirmationModal 
          trigger={<Button>Create</Button>}
          title="Confirm Account Registration"
          description="Are you sure you want to register an account?"
          actionLabel="Confirm"
          onClick={onSubmit}
        />
      </div>
    </>
  )
}