import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import {
  Form,
} from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import PhoneOTP from "./phoneOTP";
import EmailOTP from "./emailOTP";
import PasswordEntry from "./passwordEntry";
import { useSendOTP } from "../queries/authPostQueries";
import { FormInput } from "@/components/ui/form/form-input";
import axios from "axios";
import { useSendEmailOTPMutation } from "@/redux/auth-redux/useAuthMutation";

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
  // const { sendEmailOTP, error } = useAuth();
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
  const sendEmailOTP = useSendEmailOTPMutation();

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
        pv_type: "login"
      });

      setVerificationData({
        phone: data.phone,
        serverOtp: response.pv_otp || "",
      });
      setCurrentStep("otp");
      toast.success("OTP sent to your phone!");
    } catch (err) {
      if(axios.isAxiosError(err) && err.response) {
        phoneForm.setError("phone", {
          type: "server",
          message: err.response.data.phone
        })
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (data: z.infer<typeof EmailSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await sendEmailOTP.mutateAsync({
        email: data.email,
        type: "signin"
      });

      setVerificationData({ email: data.email });
      setCurrentStep("otp");
      toast.success("OTP sent to your email!");
    } catch (err) {
      if(axios.isAxiosError(err) && err.response) {
        emailForm.setError("email", {
          type: "server",
          message: err.response.data.email
        })
      }
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-xl font-medium text-gray-900">
          Login to your account
        </h2>
        <p className="text-gray-600">
          Enter your credentials to login to your account
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
            type="number"
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
            className="w-full bg-blue-500 hover:bg-blue-800 text-white h-10 rounded-md font-medium"
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
      </div>
    </div>
  );

  const renderEmailLoginContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900">
          Login to your account
        </h2>
        <p className="text-gray-600">
          Enter your credentials to login to your account
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
            className="w-full h-10 bg-blue-500 hover:bg-blue-800 text-white rounded-md font-medium"
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
          className="w-full h-10 "
        >
          Login via Phone
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
