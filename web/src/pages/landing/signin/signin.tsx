import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import OTPVerification from "./OTPVerification";
import { useSendOTP } from "../queries/authPostQueries";
import { FormInput } from "@/components/ui/form/form-input";
import axios from "axios";
import { useSendEmailOTPMutation } from "@/redux/auth-redux/useAuthMutation";
import {MdLogin, MdSwapHoriz } from "react-icons/md";

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

type SignInMethod = "phone" | "email";
type SignInStep = "phone-login" | "email-login" | "otp";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("phone");
  const [currentStep, setCurrentStep] = useState<SignInStep>("phone-login");
  const [verificationData, setVerificationData] = useState<{
    phone?: string;
    email?: string;
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

  const handleOTPSuccess = () => {
    phoneForm.reset();
    emailForm.reset();
    setVerificationData({});
    navigate("/");
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
        pv_type: "login"
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

  const handleEmailOTPResend = async () => {
    if (!verificationData.email) return;
    await handleEmailSubmit({ email: verificationData.email });
  };

  // ---------- Render Helpers ----------
  const renderPhoneLoginContent = () => (
    <div className="space-y-6">
      {/* Header without Icon */}
      <div className="text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Login with your phone number
          </p>
        </div>
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
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || sendOTPMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg shadow-green-200 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading || sendOTPMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <MdLogin className="w-5 h-5" />
                <span>Continue with Phone</span>
              </div>
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">or</span>
        </div>
      </div>

      {/* Switch Method Button */}
      <Button
        type="button"
        onClick={switchToEmailLogin}
        variant="outline"
        className="w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl font-semibold text-gray-700 hover:text-blue-700 transition-all duration-200"
      >
        <div className="flex items-center justify-center gap-2">
          <MdSwapHoriz className="w-5 h-5" />
          <span>Login via Email</span>
        </div>
      </Button>
    </div>
  );

  const renderEmailLoginContent = () => (
  <div className="space-y-6">
    {/* Header without Icon */}
    <div className="text-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Login with your email address
        </p>
      </div>
    </div>

    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
        className="space-y-6"
      >
        {/* Make sure the FormInput is properly positioned */}
        <div className="relative z-10"> {/* Add z-10 to ensure it's above other elements */}
          <FormInput
            control={emailForm.control}
            name="email"
            type="email"
            label="Email Address"
            placeholder="name@gmail.com"
          />
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
            <AlertDescription className="text-red-700 text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading || sendEmailOTP.isPending}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-200 relative z-10"
        >
          {loading || sendEmailOTP.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Sending OTP...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MdLogin className="w-5 h-5" />
              <span>Continue with Email</span>
            </div>
          )}
        </Button>
      </form>
    </Form>

    {/* Divider */}
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500 font-medium">or</span>
      </div>
    </div>

    {/* Switch Method Button */}
    <Button
      type="button"
      onClick={switchToPhoneLogin}
      variant="outline"
      className="w-full h-12 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-xl font-semibold text-gray-700 hover:text-green-700 transition-all duration-200 relative z-10"
    >
      <div className="flex items-center justify-center gap-2">
        <MdSwapHoriz className="w-5 h-5" />
        <span>Login via Phone </span>
      </div>
    </Button>
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
        return (
          <OTPVerification
            method={signInMethod}
            phone={verificationData.phone}
            email={verificationData.email}
            // serverOtp={verificationData.serverOtp}
            onSuccess={handleOTPSuccess}
            onResend={signInMethod === "phone" ? handlePhoneOTPResend : handleEmailOTPResend}
            isResending={sendOTPMutation.isPending || sendEmailOTP.isPending}
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
      default:
        return "";
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case "otp":
        return signInMethod === "phone"
          ? "Verify your code to proceed"
          : "Verify your email to proceed";
      default:
        return "";
    }
  };

  return (
    <div className="w-96 mx-auto p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
      {currentStep === "otp" && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{getDialogTitle()}</h2>
          <p className="text-sm text-gray-500 mt-1">{getDialogDescription()}</p>
        </div>
      )}
      
      {renderDialogContent()}
    </div>
  );
}