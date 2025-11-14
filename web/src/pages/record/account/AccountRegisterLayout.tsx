import React from "react";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { accountFormSchema } from "@/form-schema/account-schema";
import AccountRegistrationForm from "./AccountRegistrationForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleUserRound } from "lucide-react";
import {
  useAddAccount,
} from "./queries/accountAddQueries";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router";
import { Separator } from "@/components/ui/separator";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import axios from "axios";
import { useSendOTP } from "@/pages/landing/queries/authPostQueries";
import { useSendEmailOTPMutation } from "@/redux/auth-redux/useAuthMutation";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import RegVerification from "./RegVerification";

export default function AccountRegistrationLayout({
  tab_params,
}: {
  tab_params?: Record<string, any>;
}) {
  const sendOTPMutation = useSendOTP();
  const sendEmailOTP = useSendEmailOTPMutation();
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
  const [validPhone, setValidPhone] = React.useState<boolean>(false);
  const [validEmail, setValidEmail] = React.useState<boolean>(false);
  const { mutateAsync: addAccount } = useAddAccount();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: undefined
    },
  });

  const hasEmail = tab_params
    ? tab_params?.form.watch("accountSchema.email")?.length > 0
    : (form.watch("email")?.length as number) > 0;
  const hasPhone = tab_params
    ? tab_params?.form.watch("accountSchema.phone")?.length > 0
    : form.watch("phone")?.length > 0;

  const watchEmail = tab_params ? tab_params?.form.watch("accountSchema.email") : form.watch("email")
  const watchPhone = tab_params ? tab_params?.form.watch("accountSchema.phone") : form.watch("phone")

  // ==================== SIDE EFFECTS ======================
  React.useEffect(() => {
    setIsVerifiedEmail(tab_params?.form.getValues("accountSchema.isVerifiedEmail"))
    setIsVerifiedPhone(tab_params?.form.getValues("accountSchema.isVerifiedPhone"))
  }, [tab_params])

  React.useEffect(() => {
    if(isVerifiedEmail) {
      setIsVerifiedEmail(false)
      tab_params ? tab_params?.form.setValue("accountSchema.isVerifiedEmail", false) : form.setValue("isVerifiedEmail", false)
    }
    if(validEmail) setValidEmail(false)
  }, [watchEmail])

  React.useEffect(() => {
    if(isVerifiedPhone) {
      setIsVerifiedPhone(false)
      tab_params ? tab_params?.form.setValue("accountSchema.isVerifiedPhone", false) : form.setValue("isVerifiedPhone", false)
    }
    if(validPhone) setValidPhone(false)
  }, [watchPhone])

  // ==================== HANDLERS ======================
  const handleValidateEmail = async () => {
    const email = tab_params
      ? tab_params?.form.getValues("accountSchema.email")
      : form.getValues("email");

    try {
      setIsVerifyingEmail(true);
      await sendEmailOTP.mutateAsync({
        email: email,
        type: "signup",
      });
      setValidEmail(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        tab_params
          ? tab_params?.form.setError("accountSchema.email", {
              type: "server",
              message: err.response.data.error,
            })
          : form.setError("email", {
              type: "server",
              message: err.response.data.error,
            });
      }
      setValidEmail(false);
    }
  };

  const emailOtpSucess = () => {
    setIsVerifiedEmail(true)
    setIsVerifyingEmail(false)
    tab_params?.form.setValue("accountSchema.isVerifiedEmail", true)
  };

  const handleValidatePhone = async () => {
    if (!(await tab_params?.form.trigger(["accountSchema.phone"]))) return;

    const phone = tab_params
      ? tab_params.form.getValues("accountSchema.phone")
      : form.getValues("phone");
    try {
      setIsVerifyingPhone(true);
      await sendOTPMutation.mutateAsync({
        pv_phone_num: phone,
        pv_type: "signup",
      });
      setValidPhone(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        tab_params
          ? tab_params?.form.setError("accountSchema.phone", {
              type: "server",
              message: err.response.data.error,
            })
          : form.setError("phone", {
              type: "server",
              message: err.response.data.error,
            });
      }
    }
  };

  const phoneOtpSuccess = () => {
    setIsVerifiedPhone(true)
    setIsVerifyingPhone(false)
    tab_params?.form.setValue("accountSchema.isVerifiedPhone", true)
  };

  // const handleVerify = async () => {
  //   console.log(tab_params?.form.getValues().accountSchema);
  //   if (!(await tab_params?.form.trigger(["accountSchema"]))) {
  //     showErrorToast("Please fill out all required fields.");
  //     return;
  //   }

  //   const phone = tab_params?.form.getValues("accountSchema.phone");
  //   const email = tab_params?.form.getValues("accountSchema.email");
  //   const promises = [];

  //   if (email?.length > 0) {
  //     setIsVerifyingEmail(true);
  //     const emailPromise = verifyAccountReg({ email })
  //       .then(() => {
  //         setValidEmail(true);
  //       })
  //       .catch((err) => {
  //         if (axios.isAxiosError(err) && err.response) {
  //           tab_params?.form.setError("accountSchema.email", {
  //             type: "server",
  //             message: err.response.data.error,
  //           });
  //         }
  //         setValidEmail(false);
  //       })
  //       .finally(() => {
  //         setIsVerifyingEmail(false);
  //       });
  //     promises.push(emailPromise);
  //   }

  //   if (phone) {
  //     setIsVerifyingPhone(true);
  //     const phonePromise = verifyAccountReg({ phone })
  //       .then(() => {
  //         setValidPhone(true);
  //       })
  //       .catch((err) => {
  //         if (axios.isAxiosError(err) && err.response) {
  //           tab_params?.form.setError("accountSchema.phone", {
  //             type: "server",
  //             message: err.response.data.error,
  //           });
  //         }
  //         setIsVerifiedPhone(false);
  //       })
  //       .finally(() => {
  //         setIsVerifyingPhone(false);
  //       });
  //     promises.push(phonePromise);
  //   }

  //   await Promise.allSettled(promises);

  //   // await delay(500);
  //   // tab_params?.next(true);
  // };

  const handleContinue = async () => {
    // if (!(await tab_params?.form.trigger(["accountSchema"]))) {
    //   showErrorToast("Please fill out all required fields.");
    //   return;
    // }
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

      const account = form.getValues();
      // const { confirm_password, ...account } = accountInfo;

      await addAccount({
        accountInfo: account,
        residentId: tab_params?.isRegistrationTab
          ? tab_params.residentId
          : residentId,
      });

      showSuccessToast("Account created successfully!");
      safeNavigate.back();
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
      tab_params.next(false);
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
                  hasEmail={hasEmail}
                  hasPhone={hasPhone}
                  handleValidateEmail={handleValidateEmail}
                  handleValidatePhone={handleValidatePhone}
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
              disabled={
                hasEmail
                  ? !(isVerifiedEmail && isVerifiedPhone)
                  : !isVerifiedPhone
              }
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
        </CardContent>
      </Card>
      <DialogLayout
        className="p-0 m-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none max-w-none w-auto h-auto"
        mainContent={
          <div className="w-96 mx-auto p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Email Verification
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the code sent to your email to verify
              </p>
            </div>
            <RegVerification
              method="email"
              email={
                tab_params
                  ? tab_params.form.getValues("accountSchema.email")
                  : form.getValues("email")
              }
              onSuccess={emailOtpSucess}
              onResend={handleValidateEmail}
              isResending={sendEmailOTP.isPending}
            />
          </div>
        }
        isOpen={hasEmail && validEmail && isVerifyingEmail && !isVerifiedEmail}
        onOpenChange={() => {
          setIsVerifyingEmail(false);
          setValidEmail(false);
        }}
      />

      <DialogLayout
        className="p-0 m-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none max-w-none w-auto h-auto"
        mainContent={
          <div className="w-96 mx-auto p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Phone Verification
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the code sent to your mobile number to verify
              </p>
            </div>
            <RegVerification
              method="phone"
              phone={
                tab_params
                  ? tab_params.form.getValues("accountSchema.phone")
                  : form.getValues("phone")
              }
              onSuccess={phoneOtpSuccess}
              onResend={handleValidatePhone}
              isResending={sendOTPMutation.isPending}
            />
          </div>
        }
        isOpen={hasPhone && validPhone && isVerifyingPhone && !isVerifiedPhone}
        onOpenChange={() => {
          setIsVerifyingPhone(false);
          setValidPhone(false);
        }}
      />
    </div>
  );
}
