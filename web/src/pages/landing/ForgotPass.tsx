import { useState, useEffect } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  EmailSchema,
  ResetPasswordSchema,
  EmailFormData,
  ResetPasswordFormData,
} from "@/form-schema/forgot-password-schema";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

type ForgotPasswordStep =
  | "forgot-email"
  | "forgot-verification"
  | "forgot-reset"
  | "forgot-success";

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("forgot-email");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const { sendEmailOTP, verifyEmailOTPAndLogin } = useAuth();
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    setErrorMessage("");
    if (currentStep === "forgot-verification") {
      setVerificationCode("");
    } else if (currentStep === "forgot-reset") {
      resetForm.reset({ password: "", confirmPassword: "" });
    }
  }, [currentStep, resetForm]);

  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return "An unexpected error occurred. Please try again.";
  };

  const handleSendCode = async (data: EmailFormData) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await sendEmailOTP(data.email);
      if (result) {
        setEmail(data.email);
        setCurrentStep("forgot-verification");
      } else {
        setErrorMessage("Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("Please enter a 6-digit verification code.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const user = await verifyEmailOTPAndLogin(verificationCode, email);
      if (user) {
        setCurrentStep("forgot-reset");
      } else {
        setErrorMessage("Account does not exist");
      }
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      console.log("Reset password for:", email);
      // call your reset password API here
      setCurrentStep("forgot-success");
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrorMessage("Email not found. Please start over.");
      return;
    }
    setLoading(true);
    try {
      const success = await sendEmailOTP(email);
      if (success) {
        setVerificationCode("");
        alert("OTP resent successfully!");
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setEmail("");
    setVerificationCode("");
    emailForm.reset({ email: "" });
    setCurrentStep("forgot-email");
  };

  const handleVerificationCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(numericValue);
  };

  const StepWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative w-full max-w-md bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 animate-fadeIn">
      <Button
        type="button"
        variant="ghost"
        className="absolute -top-14 left-0 flex items-center text-sm text-gray-600 hover:text-darkBlue1"
        onClick={() => navigate("/sign-in")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      {children}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "forgot-email":
        return (
          <StepWrapper>
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-darkBlue1">Reset Password</h1>
              <p className="text-gray-600">Enter your email and we’ll send you a 6-digit code.</p>
            </div>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-darkBlue1 hover:bg-darkBlue2 text-white" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          </StepWrapper>
        );

      case "forgot-verification":
        return (
          <StepWrapper>
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-darkBlue1">Verify Code</h1>
              <p className="text-gray-600">We sent a code to <strong>{email}</strong></p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyCode();
              }}
              className="space-y-4"
            >
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => handleVerificationCodeChange(e.target.value)}
                className="text-center text-xl tracking-widest font-mono"
              />
              {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-darkBlue1 hover:bg-darkBlue2 text-white" disabled={loading || verificationCode.length !== 6}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <div className="flex justify-between mt-2">
                <Button type="button" variant="link" onClick={handleResendCode}>Resend Code</Button>
                <Button type="button" variant="link" onClick={handleBackToEmail}>Change Email</Button>
              </div>
            </form>
          </StepWrapper>
        );

      case "forgot-reset":
        return (
          <StepWrapper>
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-darkBlue1">Create New Password</h1>
            </div>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
                <Button type="submit" className="w-full bg-darkBlue1 hover:bg-darkBlue2 text-white" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </StepWrapper>
        );

      case "forgot-success":
        return (
          <StepWrapper>
            <div className="text-center space-y-4">
              <Check className="mx-auto h-14 w-14 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">Password Reset Successful!</h1>
              <Button onClick={() => navigate("/signin")} className="w-full bg-darkBlue1 hover:bg-darkBlue2 text-white">
                Back to Sign In
              </Button>
            </div>
          </StepWrapper>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-100 px-4 py-10">
      {renderStepContent()}
    </div>
  );
}
