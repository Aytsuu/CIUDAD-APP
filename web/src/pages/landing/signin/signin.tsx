import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import {
  Form,
} from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import PhoneOTP from "./phoneOTP";
import EmailOTP from "./emailOTP";
import PasswordEntry from "./passwordEntry";
import { useSendOTP } from "../queries/authPostQueries";
import { FormInput } from "@/components/ui/form/form-input";

const PhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
});

const EmailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Email must be a @gmail.com address",
    }),
});

type SignInMethod = "phone" | "email" | "google";
type SignInStep = "phone-login" | "email-login" | "otp" | "password";

export default function SignIn() {
  const navigate = useNavigate();
  const { sendEmailOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("phone");
  const [currentStep, setCurrentStep] = useState<SignInStep>("phone-login");
  const [verificationData, setVerificationData] = useState<{
    phone?: string;
    email?: string;
    userId?: string;
    serverOtp?: string;
  }>({});

  const sendOTPMutation = useSendOTP();

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: "" },
  });

  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  // ---------- Handlers ----------
  const handlePhoneSubmit = async (data: z.infer<typeof PhoneSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await sendOTPMutation.mutateAsync({
        pv_phone_num: data.phone,
      });

      setVerificationData({
        phone: data.phone,
        serverOtp: response.pv_otp || "",
      });
      setCurrentStep("otp");
      toast.success("OTP sent to your phone!");
    } catch (error) {
      console.error("Phone OTP error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (data: z.infer<typeof EmailSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await sendEmailOTP(data.email);

      setVerificationData({ email: data.email });
      setCurrentStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error) {
      console.error("Email OTP error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert("Redirecting to Google OAuth...");
  };

  const handleOTPSuccess = (userId: string) => {
    setVerificationData((prev) => ({ ...prev, userId }));
    setCurrentStep("password");
  };

  const handlePasswordSuccess = () => {
    phoneForm.reset();
    emailForm.reset();
    setVerificationData({});
    navigate("/home");
  };

  const switchToEmailLogin = () => {
    setCurrentStep("email-login");
    setErrorMessage("");
    setSignInMethod("email");
  };

  const switchToPhoneLogin = () => {
    setCurrentStep("phone-login");
    setErrorMessage("");
    setSignInMethod("phone");
  };

  const handlePhoneOTPResend = async () => {
    if (!verificationData.phone) return;

    try {
      const response = await sendOTPMutation.mutateAsync({
        pv_phone_num: verificationData.phone,
      });

      setVerificationData((prev) => ({
        ...prev,
        serverOtp: response.pv_otp || "",
      }));
    } catch (error: any) {
      console.error("Resend error:", error);

      let errorMessage = "Failed to resend OTP. Please try again.";

      if (error?.response?.status === 400) {
        const responseData = error?.response?.data;

        if (responseData?.pv_phone_num) {
          errorMessage = Array.isArray(responseData.pv_phone_num)
            ? responseData.pv_phone_num[0]
            : responseData.pv_phone_num;
        } else if (responseData?.non_field_errors) {
          errorMessage = Array.isArray(responseData.non_field_errors)
            ? responseData.non_field_errors[0]
            : responseData.non_field_errors;
        } else if (responseData?.message || responseData?.error) {
          errorMessage = responseData.message || responseData.error;
        }

        if (
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("already exists")
        ) {
          errorMessage =
            "An OTP request for this number already exists. Please wait before trying again.";
        }
      }

      throw new Error(errorMessage);
    }
  };

  // ---------- Render Helpers ----------
  const renderPhoneLoginContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-poppins text-gray-900">
          Login to your account
        </h2>
        <p className="text-gray-600">
          Enter your number below to login to your account
        </p>
      </div>

      <Form {...phoneForm}>
        <form
          onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
          className="space-y-6"
        >
          <FormInput
            control={phoneForm.control}
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="09XXXXXXXXX"
          />

          {errorMessage && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || sendOTPMutation.isPending}
            className="w-full bg-black hover:bg-gray-800 text-white h-10 rounded-md font-medium"
          >
            {loading || sendOTPMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending OTP...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <Button
          type="button"
          onClick={switchToEmailLogin}
          variant="link"
          className="w-full h-10"
        >
          Login via Email
        </Button>

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );

  const renderEmailLoginContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-poppins text-gray-900">
          Login to your account
        </h2>
        <p className="text-gray-600">
          Enter your number below to login to your account
        </p>
      </div>

      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
          className="space-y-6"
        >
          <div className="relative">
            <FormInput
              control={emailForm.control}
              name="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
            />
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-black hover:bg-gray-800 text-white rounded-md font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending OTP...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <Button
          type="button"
          onClick={switchToPhoneLogin}
          variant="link"
          className="w-full h-10"
        >
          Login via Phone
        </Button>

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );

  // ---------- Main Renderer ----------
  const renderDialogContent = () => {
    switch (currentStep) {
      case "phone-login":
        return renderPhoneLoginContent();
      case "email-login":
        return renderEmailLoginContent();
      case "otp":
        return signInMethod === "phone" ? (
          <PhoneOTP
            phone={verificationData.phone!}
            serverOtp={verificationData.serverOtp || ""}
            onSuccess={handleOTPSuccess}
            onResend={handlePhoneOTPResend}
          />
        ) : (
          <EmailOTP
            email={verificationData.email!}
            onSuccess={handleOTPSuccess}
            onResend={() =>
              handleEmailSubmit({ email: verificationData.email! })
            }
          />
        );
      case "password":
        return (
          <PasswordEntry
            userId={verificationData.userId!}
            method={signInMethod as "phone" | "email"}
            contact={verificationData.phone || verificationData.email!}
            onSuccess={handlePasswordSuccess}
          />
        );
      default:
        return renderPhoneLoginContent();
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case "otp":
        return "Enter Verification Code";
      case "password":
        return "Complete Sign In";
      default:
        return "";
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case "otp":
        return signInMethod === "phone"
          ? `Verify your code to proceed`
          : `Verify your email to proceed`;
      case "password":
        return "Enter your password to complete sign in";
      default:
        return "";
    }
  };

  return (
    <div className="w-full h-full p-6 bg-white border rounded-lg">
      {(currentStep === "otp" || currentStep === "password") && (
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">{getDialogTitle()}</h2>
          <p className="text-sm text-gray-600">{getDialogDescription()}</p>
        </div>
      )}

      {renderDialogContent()}
    </div>
  );
}
