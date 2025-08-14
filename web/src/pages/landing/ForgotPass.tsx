import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Shield, Lock, Check } from "lucide-react";
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
import { api } from "@/api/api";

// Schemas for each step
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const VerificationSchema = z.object({
  code: z.string()
    .min(6, "Code must be exactly 6 characters")
    .max(6, "Code must be exactly 6 characters")
    .regex(/^[A-Z0-9]{6}$/, "Code must contain only uppercase letters and numbers"),
});

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step = 'email' | 'verification' | 'reset' | 'success';

interface ForgotPasswordProps {
  onBackToSignIn?: () => void;
}

export default function ForgotPassword({ onBackToSignIn }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  // Forms for each step
  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: "" },
  });

  const verificationForm = useForm<z.infer<typeof VerificationSchema>>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: { code: "" },
  });

  const resetForm = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSendCode = async (data: any) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("[FRONTEND] Sending reset code request for:", data.email);
      
      const result = await api.post('authentication/forgot-password/send-code/', {
        email: data.email
      });
      
      console.log("[FRONTEND] Send code response:", result);
      
      setEmail(data.email);
      setCurrentStep('verification');
      
    } catch (error: any) {
      console.error("[FRONTEND] Send code error:", error);
      console.error("[FRONTEND] Error response:", error.response?.data);
      setErrorMessage(error.response?.data?.error || error.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (data: any) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("[FRONTEND] Verifying code for:", email, "with code:", data.code);
      
      const result = await api.post('authentication/forgot-password/verify-code/', {
        email: email,
        code: data.code
      });
      
      console.log("[FRONTEND] Verify code response:", result);
      
      // Check if result.data exists (axios wraps response in data)
      const responseData = result.data || result;
      
      if (responseData.reset_token) {
        setResetToken(responseData.reset_token);
        setCurrentStep('reset');
        console.log("[FRONTEND] Reset token received:", responseData.reset_token.substring(0, 10) + "...");
      } else {
        console.error("[FRONTEND] No reset token in response:", responseData);
        setErrorMessage("Invalid response from server. Please try again.");
      }
      
      // Show debug info if available
      if (responseData.debug_info) {
        console.log("[FRONTEND] Debug info:", responseData.debug_info);
      }
      
    } catch (error: any) {
      console.error("[FRONTEND] Verify code error:", error);
      console.error("[FRONTEND] Error response:", error.response?.data);
      setErrorMessage(error.response?.data?.error || error.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: any) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("[FRONTEND] Resetting password for:", email, "with token:", resetToken.substring(0, 10) + "...");
      
      const result = await api.post('authentication/forgot-password/reset/', {
        email: email,
        reset_token: resetToken,
        new_password: data.password
      });
      
      console.log("[FRONTEND] Reset password response:", result);
      
      setCurrentStep('success');
    } catch (error: any) {
      console.error("[FRONTEND] Reset password error:", error);
      console.error("[FRONTEND] Error response:", error.response?.data);
      setErrorMessage(error.response?.data?.error || error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("[FRONTEND] Resending code for:", email);
      
      const result = await api.post('authentication/forgot-password/resend-code/', {
        email: email
      });
      
      console.log("[FRONTEND] Resend code response:", result);
      
      // Show success message
      alert("Code resent successfully! Please check your email.");
      
    } catch (error: any) {
      console.error("[FRONTEND] Resend code error:", error);
      console.error("[FRONTEND] Error response:", error.response?.data);
      setErrorMessage(error.response?.data?.error || error.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a verification code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
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
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );

      case 'verification':
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Enter Verification Code</CardTitle>
              <CardDescription className="text-center">
                We've sent a 6-character code to {email}. Enter it below to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter 6-character code (e.g. A1B2C3)"
                            maxLength={6}
                            {...field}
                            disabled={loading}
                            className="text-center text-lg tracking-wider uppercase"
                            onChange={(e) => {
                              // Convert to uppercase automatically and filter out invalid characters
                              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-sm text-gray-500 text-center">
                          Code contains letters and numbers (e.g. A1B2C3)
                        </div>
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Verify Code
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-sm"
                      onClick={handleResendCode}
                      disabled={loading}
                    >
                      Didn't receive the code? Resend
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        );

      case 'reset':
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create New Password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }: { field: ControllerRenderProps<any, any> }) => (
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
                    render={({ field }: { field: ControllerRenderProps<any, any> }) => (
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

      case 'success':
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-green-600">
                <Check className="mx-auto h-12 w-12 mb-2" />
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-center">
                Your password has been successfully updated. You can now sign in with your new password.
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        {renderStepContent()}
        
        {/* Back to Sign In - Only show on first step */}
        {currentStep === 'email' && (
          <div className="text-center pb-4">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={onBackToSignIn}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}