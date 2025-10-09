import React from "react";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { accountFormSchema } from "@/form-schema/account-schema";
import AccountRegistrationForm from "./AccountRegistrationForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Lock, User, CircleUserRound } from "lucide-react";
import {
  useAddAccount,
  useVerifyAccountReg,
} from "./queries/accountAddQueries";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router";
import { Separator } from "@/components/ui/separator";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import axios from "axios";

export default function AccountRegistrationLayout({
  tab_params,
}: {
  tab_params?: Record<string, any>;
}) {
  const location = useLocation();
  const { safeNavigate } = useSafeNavigate();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const residentId = React.useMemo(() => params?.residentId, [params]);
  const [isVerifyingPhone, setIsVerifyingPhone] =
    React.useState<boolean>(false);
  const [isVerifyingEmail, setIsVerifyingEmail] =
    React.useState<boolean>(false);
  const [isVerifiedEmail, setIsVerifiedEmail] = React.useState<boolean>(false);
  const [isVerifiedPhone, setIsVerifiedPhone] = React.useState<boolean>(false);

  const { mutateAsync: addAccount } = useAddAccount();
  const { mutateAsync: verifyAccountReg } = useVerifyAccountReg();

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: undefined,
    },
  });

  // ==================== HANDLERS ======================
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleContinue = async () => {
    console.log(tab_params?.form.getValues().accountSchema);
    if (!(await tab_params?.form.trigger(["accountSchema"]))) {
      showErrorToast("Please fill out all required fields.");
      return;
    }

    const phone = tab_params?.form.getValues("accountSchema.phone");
    const email = tab_params?.form.getValues("accountSchema.email");
    const promises = [];
    let emailVerified = false;
    let phoneVerified = false;

    if (email?.length > 0) {
      setIsVerifyingEmail(true);
      const emailPromise = verifyAccountReg({ email })
        .then(() => {
          emailVerified = true;
          setIsVerifiedEmail(true);
        })
        .catch((err) => {
          if (axios.isAxiosError(err) && err.response) {
            tab_params?.form.setError("accountSchema.email", {
              type: "server",
              message: err.response.data.error,
            });
          }
          setIsVerifiedEmail(false);
        })
        .finally(() => {
          setIsVerifyingEmail(false);
        });
      promises.push(emailPromise);
    } else {
      emailVerified = true; // no email to verify = considered verified
    }

    if (phone) {
      setIsVerifyingPhone(true);
      const phonePromise = verifyAccountReg({ phone })
        .then(() => {
          phoneVerified = true;
          setIsVerifiedPhone(true);
        })
        .catch((err) => {
          if (axios.isAxiosError(err) && err.response) {
            tab_params?.form.setError("accountSchema.phone", {
              type: "server",
              message: err.response.data.error,
            });
          }
          setIsVerifiedPhone(false);
        })
        .finally(() => {
          setIsVerifyingPhone(false);
        });
      promises.push(phonePromise);
    } else {
      phoneVerified = true; // no phone to verify = considered verified
    }

    await Promise.allSettled(promises);

    if (email?.length > 0 && !emailVerified) return;
    if (!phoneVerified) return;

    await delay(500);
    tab_params?.next(true);
  };

  const submit = async () => {
    setIsSubmitting(true);

    try {
      const formIsValid = await form.trigger();

      if (!formIsValid) {
        showErrorToast("Please fill out all required fields.");
        return;
      }

      const accountInfo = form.getValues();
      const { confirm_password, ...account } = accountInfo;

      await addAccount({
        accountInfo: account,
        residentId: tab_params?.isRegistrationTab
          ? tab_params.residentId
          : residentId,
      });

      showSuccessToast("Account created successfully!");

      // Navigate based on context
      if (tab_params?.isRegistrationTab) {
        tab_params.next?.(true);
      } else {
        safeNavigate.back();
      }
    } catch (error) {
      console.error("Error creating account:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.phone) {
          form.setError("phone", {
            type: "server",
            message: error.response.data.phone,
          });
        }

        if (error.response.data.email) {
          form.setError("email", {
            type: "server",
            message: error.response.data.email,
          });
        }
      }
      showErrorToast("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (tab_params?.isRegistrationTab) {
      tab_params.next?.(false);
    } else {
      safeNavigate.back();
    }
  };

  // ==================== RENDER HELPERS ======================

  return (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-2xl max-h-[700px] shadow-none overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <CircleUserRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Account Registration</h2>
          <p className="max-w-xl mx-auto leading-relaxed">
            Create a secure account for this resident. This will enable them to
            access mobile services and maintain their personal information.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          {/* <Alert className="border-indigo-200 bg-indigo-50">
            <AlertDescription className="text-indigo-800">
              <strong>Account Creation:</strong> This step is optional but recommended. Creating an account allows the
              resident to access their information online and receive important updates.
            </AlertDescription>
          </Alert> */}

          <Separator />

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <Form
              {...(tab_params?.isRegistrationTab ? tab_params?.form : form)}
            >
              <form className="space-y-6">
                <AccountRegistrationForm
                  form={tab_params?.isRegistrationTab ? tab_params?.form : form}
                  prefix={tab_params?.isRegistrationTab ? "accountSchema." : ""}
                  isVerifyingEmail={isVerifyingEmail}
                  isVerifyingPhone={isVerifyingPhone}
                  isVerifiedEmail={isVerifiedEmail}
                  isVerifiedPhone={isVerifiedPhone}
                />
              </form>
            </Form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1 h-11"
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
            <Button
              onClick={tab_params?.isRegistrationTab ? handleContinue : submit}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>{tab_params?.isRegistrationTab ? "Next" : "Create Account"}</>
              )}
            </Button>

            {/* <ConfirmationModal
              trigger={
                <Button
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {tab_params?.isRegistrationTab ? "Next" : "Create Account"}
                    </>
                  )}
                </Button>
              }
              title="Confirm Account Registration"
              description="Are you sure you want to create this account? The resident will be able to use these credentials to access their information."
              actionLabel="Yes, Create Account"
              onClick={tab_params?.isRegistrationTab ? handleContinue : submit}
            /> */}
          </div>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              All account information is encrypted and stored securely. The
              resident will receive their login credentials via secure channels.
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Need help with account creation? Contact your system administrator
              for assistance.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Profile Setup
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email Verification
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Secure Access
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}