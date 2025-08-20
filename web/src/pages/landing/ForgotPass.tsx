import { useState, useEffect } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Shield, Check, Lock } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  EmailSchema,
  VerificationSchema,
  ResetPasswordSchema,
  EmailFormData,
  VerificationFormData,
  ResetPasswordFormData,
} from "@/form-schema/forgot-password-schema";
import { useAuth } from "@/context/AuthContext";

type ForgotPasswordStep =
  | "forgot-email"
  | "forgot-verification"
  | "forgot-reset"
  | "forgot-success";

interface ForgotPasswordProps {
  onBackToSignIn: () => void;
  currentStep: ForgotPasswordStep;
  onStepChange: (step: ForgotPasswordStep) => void;
}

export default function ForgotPassword({
  onBackToSignIn,
  currentStep,
  onStepChange,
}: ForgotPasswordProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // 👇 Bring in context functions
  const { sendEmailOTP, verifyEmailOTPAndLogin } = useAuth();

  // Forms for each step
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Reset forms and clear errors when step changes
  useEffect(() => {
    setErrorMessage("");
    
    if (currentStep === "forgot-verification") {
      setVerificationCode("");
    } else if (currentStep === "forgot-reset") {
      resetForm.reset({ password: "", confirmPassword: "" });
    }
  }, [currentStep, resetForm]);

  // Helper function to extract error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.message) return error.message;
    return "An unexpected error occurred. Please try again.";
  };

  // --- Handlers ---
  const handleSendCode = async (data: EmailFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Sending OTP to:", data.email);
      const result = await sendEmailOTP(data.email);
      console.log("Send OTP result:", result);

      if (result) {
        setEmail(data.email);
        onStepChange("forgot-verification");
      } else {
        setErrorMessage("Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Send code error:", error);
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
      console.log("Verifying OTP:", { email, code: verificationCode });
      
      // Send both email and OTP code to backend
      const user = await verifyEmailOTPAndLogin(verificationCode, email);
      console.log("Verify OTP result:", user);

      if (user) {
        onStepChange("forgot-reset");
      } else {
        setErrorMessage("Account does not exist");
      }
    } catch (error: any) {
      console.error("Verify code error:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Reset password for:", email);
      // Add your actual password reset logic here
      // const result = await resetPassword(email, data.password);

      onStepChange("forgot-success");
    } catch (error: any) {
      console.error("Reset password error:", error);
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
    setErrorMessage("");

    try {
      console.log("Resending OTP to:", email);
      const success = await sendEmailOTP(email);

      if (success) {
        setErrorMessage("");
        setVerificationCode("");
        alert("OTP resent successfully!");
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Resend code error:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setEmail("");
    setVerificationCode("");
    setErrorMessage("");
    emailForm.reset({ email: "" });
    onStepChange("forgot-email");
  };

  const handleVerificationCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
  };

  // --- Render ---
  const renderStepContent = () => {
    switch (currentStep) {
      case "forgot-email":
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a 6-digit
                verification code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(handleSendCode)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<any, any>;
                    }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={onBackToSignIn}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </>
        );

      case "forgot-verification":
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Enter Verification Code
              </CardTitle>
              <CardDescription className="text-center">
                We've sent a 6-digit code to <strong>{email}</strong>. Enter it
                below to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCode();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="verification_code" className="text-sm font-medium">
                    Verification Code
                  </label>
                  <Input
                    id="verification_code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => handleVerificationCodeChange(e.target.value)}
                    disabled={loading}
                    className="text-center text-lg tracking-wider"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>

                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Code
                    </>
                  )}
                </Button>

                <div className="flex flex-col space-y-2 text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        Resending...
                      </>
                    ) : (
                      "Didn't receive the code? Resend"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-gray-500"
                    onClick={handleBackToEmail}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change email address
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        );

      case "forgot-reset":
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                Create New Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...resetForm}>
                <form
                  onSubmit={resetForm.handleSubmit(handleResetPassword)}
                  className="space-y-4"
                >
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<any, any>;
                    }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<any, any>;
                    }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );

      case "forgot-success":
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-green-600">
                <Check className="mx-auto h-12 w-12 mb-2" />
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-center">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onBackToSignIn} className="w-full">
                Continue to Sign In
              </Button>
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      {renderStepContent()}
    </Card>
  );
}