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
      <div className="flex items-end">
        <FormInput
          control={form.control}
          name={`${prefix}email`}
          label="Email (optional)"
          placeholder="Enter email (optional)"
          className="w-full"
        />
        {!isVerifiedEmail && !isVerifyingEmail && (
          <Button variant={"link"} className="shadow-none" disabled={!hasEmail}
            onClick={handleValidateEmail}
            type="button"
          >
            Verify
          </Button>
        )}
        {isVerifyingEmail && (
          <Button variant={"link"} className="shadow-none text-gray-600" disabled
            type="button"
          >
            Verify...
          </Button>
        )}
        {isVerifiedEmail && (
          <Button variant={"link"} className="shadow-none text-green-500"
            type="button"
          >
            Verified
          </Button>
        )}
      </div>
      <div className="flex items-end">
        <FormInput
          control={form.control}
          name={`${prefix}phone`}
          label="Phone Number"
          placeholder="Enter phone number"
          type="number"
          className="w-full"
        />
        {!isVerifiedPhone && !isVerifyingPhone && (
          <Button variant={"link"} className="shadow-none" disabled={!hasPhone}
            onClick={handleValidatePhone}
            type="button"
          >
            Verify
          </Button>
        )}
        {isVerifyingPhone && (
          <Button variant={"link"} className="shadow-none text-gray-600" disabled
            type="button"
          >
            Verify...
          </Button>
        )}
        {isVerifiedPhone && (
          <Button variant={"link"} className="shadow-none text-green-500"
            type="button"
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
