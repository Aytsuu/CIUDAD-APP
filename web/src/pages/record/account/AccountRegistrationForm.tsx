import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { FormInput } from "@/components/ui/form/form-input"
import { accountFormSchema } from "@/form-schema/account-schema"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button/button"
import { LoadButton } from "@/components/ui/button/load-button"
import { useNavigate } from "react-router"

export default function AccountRegistrationForm({form, isSubmitting, onSubmit} : {
  form: UseFormReturn<z.infer<typeof accountFormSchema>>
  isSubmitting: boolean
  onSubmit: () => void
}) {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid gap-4">
        <FormInput control={form.control} name="username" label="Username" placeholder="Enter username"/>
        <FormInput control={form.control} name="email" label="Email" placeholder="Enter email (optional)"/>
        <FormInput control={form.control} name="password" label="Password" placeholder="Enter password" type="password"/>
        <FormInput control={form.control} name="confirmPassword" label="Confirm Password" placeholder="Re-enter password" type="password"/>
      </div>
      <div className="flex justify-between">
        <Button 
          variant={"outline"} 
          className="border-none shadow-none font-normal"
          onClick={() => navigate(-1)}
        >
          Skip for now
        </Button>
        {!isSubmitting ? (<ConfirmationModal 
          trigger={<Button>Create</Button>}
          title="Confirm Account Registration"
          description="Are you sure you want to register an account?"
          actionLabel="Confirm"
          onClick={onSubmit}
        />) : (
          <LoadButton>Creating...</LoadButton>
        )}
      </div>
    </>
  )
}