import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Phone, Mail, ArrowLeft, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import ciudad from  "@/assets/images/ciudad_logo.svg";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PhoneOTP from "./phoneOTP";
import EmailOTP from "./emailOTP";
import PasswordEntry from "./passwordEntry";
import { useSendOTP } from "../queries/authPostQueries";

const PhoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
});

// Schema for email verification
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SignInMethod = "phone" | "email" | "google";
type SignInStep = "method-selection" | "phone-input" | "email-input" | "otp" | "password";

export default function SignIn() {
  const navigate = useNavigate();
  const { sendEmailOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("phone");
  const [currentStep, setCurrentStep] = useState<SignInStep>("method-selection");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    phone?: string;
    email?: string;
    userId?: string;
    serverOtp?: string; // Store server OTP for phone verification
  }>({});

  const sendOTPMutation = useSendOTP();

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleMethodSelection = (method: SignInMethod) => {
    setSignInMethod(method);
    setErrorMessage("");
    
    if (method === "google") {
      handleGoogleSignIn();
    } else if (method === "phone") {
      setCurrentStep("phone-input");
    } else if (method === "email") {
      setCurrentStep("email-input");
    }
  };

  const handleBackToSelection = () => {
    setCurrentStep("method-selection");
    setErrorMessage("");
    phoneForm.reset();
    emailForm.reset();
  };

  const handlePhoneSubmit = async (data: z.infer<typeof PhoneSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await sendOTPMutation.mutateAsync({
        pv_phone_num: data.phone,
      });

      console.log("Phone OTP response:", response); // Debug log
      
      setVerificationData({ 
        phone: data.phone, 
        serverOtp: response.pv_otp || "" 
      });
      setCurrentStep("otp");
      setIsDialogOpen(true);
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
      // Call your email OTP API here
      await sendEmailOTP(data.email);
      setVerificationData({ email: data.email });
      setCurrentStep("otp");
      setIsDialogOpen(true);
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
    // Handle Google OAuth
    alert("Redirecting to Google OAuth...");
  };

  const handleOTPSuccess = (userId: string) => {
    setVerificationData(prev => ({ ...prev, userId }));
    setCurrentStep("password");
  };

  const handlePasswordSuccess = () => {
    setIsDialogOpen(false);
    setCurrentStep("method-selection");
    phoneForm.reset();
    emailForm.reset();
    setVerificationData({});
    navigate("/home");
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentStep("method-selection");
    setVerificationData({});
  };

  const handlePhoneOTPResend = async () => {
    if (!verificationData.phone) return;
    
    try {
      console.log("Resending OTP for phone:", verificationData.phone); // Debug log
      
      // For resend, you might need to create a new verification record
      // or your API might handle resend differently
      const response = await sendOTPMutation.mutateAsync({
        pv_phone_num: verificationData.phone,
      });
      
      console.log("Resend OTP Response:", response); // Debug log
      
      setVerificationData(prev => ({ 
        ...prev, 
        serverOtp: response.pv_otp || "",
        verificationId: response.pv_id // Update with new ID if created
      }));
      
    } catch (error: any) {
      console.error("Resend error:", error);
      console.error("Error response:", error?.response); // More detailed error log
      
      let errorMessage = "Failed to resend OTP. Please try again.";
      
      // Handle specific Django/API errors
      if (error?.response?.status === 400) {
        const responseData = error?.response?.data;
        
        // Handle Django validation errors
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
        
        // Check for common issues
        if (errorMessage.toLowerCase().includes('duplicate') || 
            errorMessage.toLowerCase().includes('already exists')) {
          errorMessage = "An OTP request for this number already exists. Please wait before trying again.";
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const renderDialogContent = () => {
    switch (currentStep) {
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
            onResend={() => handleEmailSubmit({ email: verificationData.email! })}
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
        return null;
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
          ? `We've sent a 6-digit code to ${verificationData.phone}`
          : `We've sent a 6-digit code to ${verificationData.email}`;
      case "password":
        return "Enter your password to Sign";
      default:
        return "";
    }
  };

  const renderMainContent = () => {
    if (currentStep === "method-selection") {
      return (
        <div className="space-y-8">

          {/* Enhanced Sign-in Method Selection */}
          <div className="space-y-6">
            <Button
              type="button"
              onClick={() => handleMethodSelection("phone")}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between relative overflow-hidden text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Phone Number</p>
                </div>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </div>
            </Button>

            <Button
              type="button"
              onClick={() => handleMethodSelection("email")}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between relative overflow-hidden text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Email Address</p>
                </div>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </div>
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="bg-white px-6 text-gray-500 font-medium">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleMethodSelection("google")}
              disabled={loading}
              className="group w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between relative overflow-hidden text-lg"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">Google Account</p>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </div>
            </Button>
          </div>

          {/* Error Message for Method Selection */}
          {errorMessage && (
            <Alert variant="destructive" className="rounded-2xl border-0 bg-red-50">
              <AlertDescription className="text-lg text-center text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    if (currentStep === "phone-input") {
      return (
        <div className="space-y-8">

          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Enter Phone Number</h3>
            <p className="text-gray-600 text-lg">We'll send you a verification code via SMS</p>
          </div>

          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-8">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold text-lg">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          {...field}
                          disabled={loading}
                          className="w-full py-5 pl-14 pr-5 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <Alert variant="destructive" className="rounded-2xl border-0 bg-red-50">
                  <AlertDescription className="text-lg text-center text-red-700">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || sendOTPMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white font-semibold py-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                {loading || sendOTPMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Phone className="mr-4 h-6 w-6" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </Button>
            </form>
          </Form>

                    <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleBackToSelection}
            className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-4 py-3 transition-all duration-200 self-start mb-6 text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>
      );
    }

    if (currentStep === "email-input") {
      return (
        <div className="space-y-8">

          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Enter Email Address</h3>
            <p className="text-gray-600 text-lg">We'll send you a verification code via email</p>
          </div>

          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-8">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold text-lg">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={loading}
                          className="w-full py-5 pl-14 pr-5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <Alert variant="destructive" className="rounded-2xl border-0 bg-red-50">
                  <AlertDescription className="text-lg text-center text-red-700">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-semibold py-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Mail className="mr-4 h-6 w-6" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </Button>
            </form>
          </Form>
           <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleBackToSelection}
            className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-4 py-3 transition-all duration-200 self-start mb-6 text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* "Back to Home" Button - Upper Left */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate("/home")}
          className="flex items-center gap-3 text-white hover:text-blue-200 hover:bg-white/10 rounded-xl px-5 py-3 transition-all duration-200 backdrop-blur-sm text-lg font-medium"
        >
          <ArrowLeft className="h-6 w-6" />
          <span>Back to Home</span>
        </Button>
      </div>

      {/* Enhanced Left Side - Hero Section */}
      <div className="hidden lg:flex w-full lg:w-3/5 h-full relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-20 text-white">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-cyan-300 animate-pulse" />
              <span className="text-cyan-300 font-medium">Digital Government Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wide leading-tight">
              Barangay{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent animate-gradient">
                San Roque
              </span>
            </h1>
            
            <div className="relative">
              <img src={ciudad} alt="Ciudad Logo" className="max-w-md opacity-90" />
            </div>
            
            <p className="text-xl sm:text-2xl max-w-2xl opacity-90 leading-relaxed font-light">
              Empowering the community with{" "}
              <span className="text-cyan-300 font-semibold">accessible governance</span> and{" "}
              <span className="text-blue-300 font-semibold">health services</span>.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium">Secure Access</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Lock className="h-5 w-5 text-blue-300" />
                <span className="text-sm font-medium">Authorized Personnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right Side - Form Section */}
      <div className="flex w-full lg:w-2/5 flex-1 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto flex flex-col justify-center space-y-8 p-8 min-h-full">
          <div className="flex-1 w-full">
            {/* Enhanced Header with Logo */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl animate-pulse"></div>
                <div className="relative bg-white rounded-2xl p-4">
                  <img
                    src={SanRoqueLogo}
                    alt="San Roque Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-lg">
                {currentStep === "method-selection" 
                  ? "Choose your preferred authentication method to access authorized services"
                  : `Complete your secure sign-in process`}
              </p>
            </div>

            {/* Main Content Area */}
            {renderMainContent()}
          </div>

          {/* Enhanced Footer */}
          <div className="text-center text-gray-500 p-6 rounded-2xl bg-gray-50 flex-shrink-0">
            <p className="font-medium text-lg">
              Barangay San Roque © {new Date().getFullYear()}
            </p>
            {/* <p className="text-base mt-2 opacity-75">
              Powered by secure digital infrastructure
            </p> */}
          </div>
        </div>
      </div>

      {/* Enhanced Modal Dialog */}
      <DialogLayout
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        title={getDialogTitle()}
        description={getDialogDescription()}
        mainContent={renderDialogContent()}
        className="max-w-lg rounded-3xl border-0 bg-white/95 backdrop-blur-sm"
      />
    </div>
  );
}