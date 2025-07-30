import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useNavigate } from "react-router";
import SignInSchema from "@/form-schema/sign-in-schema";
import { useAuth } from "@/context/AuthContext";

// Schemas for forgot password flow
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const VerificationSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be exactly 6 characters"),
});

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthView = 'signin' | 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success';

// SignIn Component
function SignIn({ onShowForgotPassword }: { onShowForgotPassword: () => void }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (credentials: z.infer<typeof SignInSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Authorized personnel only. Sign in to manage records, oversee
          programs, and access tools essential for barangay operations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignIn)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
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
                      placeholder="Email address"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({
                field,
              }: {
                field: ControllerRenderProps<any, any>;
              }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button 
                type="button"
                variant="link" 
                className="px-0 text-sm"
                onClick={onShowForgotPassword}
              >
                Forgot your password?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ForgotPassword Component
function ForgotPassword({ 
  onBackToSignIn, 
  currentStep, 
  onStepChange 
}: { 
  onBackToSignIn: () => void;
  currentStep: 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success';
  onStepChange: (step: 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success') => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");

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

  const handleSendCode = async (data: z.infer<typeof EmailSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Replace with your actual API call
      // await sendResetCodeAPI(data.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmail(data.email);
      onStepChange('forgot-verification');
    } catch (error) {
      console.error("Send code error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (data: z.infer<typeof VerificationSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Replace with your actual API call
      // await verifyResetCodeAPI(email, data.code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStepChange('forgot-reset');
    } catch (error) {
      console.error("Verify code error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Invalid or expired code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: z.infer<typeof ResetPasswordSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Replace with your actual API call
      // await resetPasswordAPI(email, data.password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStepChange('forgot-success');
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Replace with your actual API call
      // await sendResetCodeAPI(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or notification
      alert("Code resent successfully!");
    } catch (error) {
      console.error("Resend code error:", error);
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'forgot-email':
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

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={onBackToSignIn}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'forgot-verification':
        return (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Enter Verification Code</CardTitle>
              <CardDescription className="text-center">
                We've sent a 6-digit code to {email}. Enter it below to continue.
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
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            {...field}
                            disabled={loading}
                            className="text-center text-lg tracking-wider"
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

      case 'forgot-reset':
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

      case 'forgot-success':
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
    <Card className="w-full max-w-md border-0 shadow-none">
      {renderStepContent()}
    </Card>
  );
}

// Main AuthDialog Component
export default function AuthDialog() {
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  const handleShowForgotPassword = () => {
    setCurrentView('forgot-email');
  };

  const handleBackToSignIn = () => {
    setCurrentView('signin');
  };

  const handleForgotStepChange = (step: 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success') => {
    setCurrentView(step);
  };

  if (currentView === 'signin') {
    return <SignIn onShowForgotPassword={handleShowForgotPassword} />;
  }

  return (
    <ForgotPassword 
      onBackToSignIn={handleBackToSignIn}
      currentStep={currentView as 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success'}
      onStepChange={handleForgotStepChange}
    />
  );
}