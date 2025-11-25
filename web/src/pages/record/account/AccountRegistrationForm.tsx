import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
export default function AccountRegistrationForm({
  form,
  prefix = "",
  isVerifyingEmail,
  isVerifyingPhone,
  isVerifiedEmail,
  isVerifiedPhone,
  hasEmail,
  hasPhone,
  handleValidateEmail,
  handleValidatePhone,
}: {
  form: any;
  prefix: string;
  isVerifyingEmail: boolean;
  isVerifiedEmail: boolean;
  isVerifyingPhone: boolean;
  isVerifiedPhone: boolean;
  hasEmail: boolean
  hasPhone: boolean
  handleValidateEmail: () => void;
  handleValidatePhone: () => void;
}) {

  return (
    <div className="grid gap-4">
      <div className="relative">
        <FormInput
          control={form.control}
          name={`${prefix}email`}
          label="Email (optional)"
          placeholder="Enter email (optional)"
          className="w-full"
        />
        {!isVerifiedEmail && !isVerifyingEmail && (
          <Button variant={"link"} disabled={!hasEmail}
            onClick={handleValidateEmail}
            type="button"
            className="absolute shadow-none top-[-5px] left-[5.7rem]" 
          >
            Verify
          </Button>
        )}
        {isVerifyingEmail && (
          <Button variant={"link"} disabled
            type="button"
            className="absolute shadow-none text-gray-600 top-[-5px] left-[5.7rem]" 
          >
            Verify...
          </Button>
        )}
        {isVerifiedEmail && (
          <Button variant={"link"}
            type="button"
            className="absolute shadow-none text-green-500 top-[-5px] left-[5.7rem]"
          >
            Verified
          </Button>
        )}
      </div>
      <div className="relative">
        <FormInput
          control={form.control}
          name={`${prefix}phone`}
          label="Phone Number"
          placeholder="Enter phone number"
          type="number"
          className="w-full"
        />
        {!isVerifiedPhone && !isVerifyingPhone && (
          <Button variant={"link"} disabled={!hasPhone}
            onClick={handleValidatePhone}
            type="button"
            className="absolute shadow-none top-[-5px] left-[5.5rem]" 
          >
            Verify
          </Button>
        )}
        {isVerifyingPhone && (
          <Button variant={"link"} disabled
            type="button"
            className="absolute shadow-none text-gray-600 top-[-5px] left-[5.5rem]" 
          >
            Verify...
          </Button>
        )}
        {isVerifiedPhone && (
          <Button variant={"link"} 
            type="button"
            className="absolute shadow-none text-green-500 top-[-5px] left-[5.5rem]"
          >
            Verified
          </Button>
        )}
      </div>
      {/* <FormInput control={form.control} name={`${prefix}password`} label="Password" placeholder="Enter password" type="password"/>
      <FormInput control={form.control} name={`${prefix}confirm_password`} label="Confirm Password" placeholder="Re-enter password" type="password"/> */}
    </div>
  );
}
