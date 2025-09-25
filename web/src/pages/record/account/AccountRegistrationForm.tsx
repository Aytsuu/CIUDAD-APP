import { FormInput } from "@/components/ui/form/form-input";
import { CircleCheck, Loader2 } from "lucide-react";
export default function AccountRegistrationForm({form, prefix = "", isVerifyingEmail, isVerifyingPhone, isVerifiedEmail, isVerifiedPhone} : {
  form: any
  prefix: string
  isVerifyingEmail: boolean
  isVerifiedEmail: boolean
  isVerifyingPhone: boolean
  isVerifiedPhone: boolean
}) {

  return (
    <div className="grid gap-4">
      <div className="relative">
        <FormInput control={form.control} name={`${prefix}email`} label="Email (optional)" placeholder="Enter email (optional)"/>
        {isVerifyingEmail && 
          <div className="absolute right-2 top-[60%]">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500"/>
          </div>
        }
        {isVerifiedEmail && 
          <div className="absolute right-2 top-[55%]">
            <CircleCheck className="w-6 h-6 fill-green-500 stroke-white"/>
          </div>
        }
      </div>
      <div className="relative">
        <FormInput control={form.control} name={`${prefix}phone`} label="Phone Number" placeholder="Enter phone number" type="number"/>
        {isVerifyingPhone && 
          <div className="absolute right-2 top-[60%]">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500"/>
          </div>
        }
        {isVerifiedPhone && 
          <div className="absolute right-2 top-[55%]">
            <CircleCheck className="w-6 h-6 fill-green-500 stroke-white"/>
          </div>
        }
      </div>
      <FormInput control={form.control} name={`${prefix}password`} label="Password" placeholder="Enter password" type="password"/>
      <FormInput control={form.control} name={`${prefix}confirm_password`} label="Confirm Password" placeholder="Re-enter password" type="password"/>
    </div>
  )
}