import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Phone, Mail, ArrowLeft, Shield, Users, MapPin } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import SignInSchema from "@/form-schema/sign-in-schema";
import { useAuth } from "@/context/AuthContext";
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "react-router";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      toast.success("Successfully Logged in!");
      form.reset();
      navigate("/home");
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

  const handlePhoneSignIn = () => {
    alert("Phone sign-in initiated. SMS verification will be sent.");
  };

  const handleGoogleSignIn = () => {
    alert("Redirecting to Google OAuth...");
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex w-full lg:w-3/5 h-full relative bg-gradient-to-br from-darkBlue1 via-darkBlue2 to-[#0B1A37] overflow-hidden">
        {/* Subtle darkBlue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkBlue1/30 via-darkBlue2/20 to-[#0B1A37]/10"></div>

        {/* Main overlay tint */}
        <div className="absolute inset-0 bg-black/15"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-16 text-white">
          <div className="space-y-4 sm:space-y-6">
            {/* Optional header badge */}
            <div className="inline-flex items-center space-x-3 mb-4 sm:mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Official Portal</h3>
                <p className="text-blue-200 text-xs sm:text-sm">Authorized Access</p>
              </div>
            </div>

            {/* Enhanced title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide leading-tight drop-shadow-lg">
              Barangay{" "}
              <span className="bg-gradient-to-r from-lightBlue to-cyan-300 bg-clip-text text-transparent">
                San Roque
              </span>
            </h1>
            
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl max-w-lg opacity-90 leading-relaxed">
              Empowering the community with accessible governance and health services. 
              Authorized personnel, please sign in to continue.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 sm:bottom-8 left-8 sm:left-12 lg:left-16 text-gray-300">
          <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="font-medium text-sm sm:text-base">Barangay San Roque</p>
            <p className="text-xs sm:text-sm">Cebu City, Philippines • © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Mobile Hero Section */}
      <div className="lg:hidden w-full h-28 sm:h-32 relative bg-gradient-to-br from-darkBlue1 via-darkBlue2 to-[#0B1A37] overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10 flex flex-col justify-center h-full px-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide leading-tight drop-shadow-lg">
            Barangay{" "}
            <span className="bg-gradient-to-r from-lightBlue to-cyan-300 bg-clip-text text-transparent">
              San Roque
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base opacity-90">
            Official Portal Access
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex w-full lg:w-1/2 flex-1 bg-gray-50 p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center space-y-4 sm:space-y-6 min-h-full py-2">
          {/* Back Button - Now in normal flow */}
          <div className="flex justify-start flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-gray-600 hover:text-darkBlue1 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Enhanced Card */}
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-4 sm:p-6 border border-gray-200 relative overflow-hidden flex-1 max-w-md w-full">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 opacity-50"></div>
            
            <div className="relative z-10">
              {/* Header with Logo */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3">
                  <img
                    src={SanRoqueLogo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">Sign in to your official account</p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSignIn)}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<any, any>;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              disabled={loading}
                              className="w-full text-sm py-2.5 pl-10 sm:pl-11 pr-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<any, any>;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              disabled={loading}
                              className="w-full text-sm py-2.5 pl-10 sm:pl-11 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={loading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                              ) : (
                                <Eye className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error */}
                  {errorMessage && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Remember + Forgot */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-gray-600 font-medium">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-darkBlue1 font-medium text-xs self-start sm:self-auto"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-darkBlue1 to-darkBlue2 hover:from-darkBlue2 hover:to-[#0B1A37] text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="text-sm">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Sign in</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-400 text-xs font-thin">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Sign-in */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handlePhoneSignIn}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-green-400 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-100 text-sm"
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
                  Google
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 p-2 rounded-xl bg-white/60 backdrop-blur-sm flex-shrink-0">
            <p className="font-medium text-xs">Barangay San Roque © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



// Phone and Google Setup

// import { useState } from "react";
// import { useForm, ControllerRenderProps } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Lock, Eye, EyeOff } from "lucide-react";
// import { BsGoogle } from "react-icons/bs";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog/dialog";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useNavigate } from "react-router";
// import SignInSchema2 from "@/form-schema/sign-in-schema";
// import { useAuth } from "@/context/AuthContext";

// interface SignInProps {
//   onShowForgotPassword: () => void;
// }

// // OTP verification schema
// const OTPSchema = z.object({
//   otp: z.string().min(4, "OTP must be at least 4 digits").max(6, "OTP must be at most 6 digits")
// });

// export default function SignIn({ onShowForgotPassword }: SignInProps) {
//   const [showOTPDialog, setShowOTPDialog] = useState(false);
//   const navigate = useNavigate();

//   // Use your enhanced auth context
//   const {
//     loginWithGoogle,
//     isLoading,
//     error,
//     clearError
//   } = useAuth();

//   const form = useForm<z.infer<typeof SignInSchema2>>({
//     resolver: zodResolver(SignInSchema2)
//   });

//   const otpForm = useForm<z.infer<typeof OTPSchema>>({
//     resolver: zodResolver(OTPSchema)
//   });

//   const handlePhoneSignIn = async (values: z.infer<typeof SignInSchema2>) => {
//     clearError();

//     try {
//       // await sendOTP(values.phone_number);
//       setShowOTPDialog(true);
//     } catch (error) {
//       // Error is handled by the auth context
//       console.error("Phone sign in error:", error);
//     }
//   };

//   const handleOTPVerification = async (values: z.infer<typeof OTPSchema>) => {
//     clearError();

//     try {
//       // await verifyOTPAndLogin(values.otp);
//       setShowOTPDialog(false);
//       navigate('/dashboard');
//     } catch (error) {
//       // Error is handled by the auth context
//       console.error("OTP verification error:", error);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     clearError();

//     try {
//       await loginWithGoogle();
//       // Redirect will be handled by OAuth callback
//     } catch (error) {
//       // Error is handled by the auth context
//       console.error("Google sign in error:", error);
//     }
//   };

//   const handleResendOTP = async () => {
//     // if (phoneNumber) {
//     //   clearError();
//     //   try {
//     //     await sendOTP(phoneNumber);
//     //   } catch (error) {
//     //     console.error("Resend OTP error:", error);
//     //   }
//     // }
//   };

//   const handleCloseOTPDialog = () => {
//     setShowOTPDialog(false);
//     clearError();
//     otpForm.reset();
//   };

//   return (
//     <>
//       <Card className="w-full max-w-md border-0 shadow-none">
//         <CardHeader className="space-y-1 mb-10">
//           <CardTitle className="text-2xl text-center">Sign In</CardTitle>
//           <CardDescription className="text-center">
//             Authorized personnel only. Sign in to manage records, oversee
//             programs, and access tools essential for barangay operations.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(handlePhoneSignIn)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={form.control}
//                 name="phone_number"
//                 render={({ field }: { field: ControllerRenderProps<any, any> }) => (
//                   <FormItem>
//                     <FormLabel>Phone Number</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="tel"
//                         placeholder="+63 912 345 6789"
//                         {...field}
//                         disabled={isLoading}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   {/* Remember me checkbox can be added here if needed */}
//                 </div>
//                 <Button
//                   type="button"
//                   variant="link"
//                   className="px-0 text-sm"
//                   onClick={onShowForgotPassword}
//                 >
//                   Forgot your password?
//                 </Button>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Sending OTP..." : (
//                   <>
//                     <Lock className="mr-2 h-4 w-4" />
//                     Sign in
//                   </>
//                 )}
//               </Button>

//               <Button
//                 type="button"
//                 className="w-full bg-white text-black border hover:bg-gray-50 flex items-center justify-center"
//                 onClick={handleGoogleSignIn}
//                 disabled={isLoading}
//               >
//                 <BsGoogle className="mr-2 h-4 w-4" /> Sign in with Google
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>

//       {/* OTP Verification Dialog */}
//       <Dialog open={showOTPDialog} onOpenChange={handleCloseOTPDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Enter OTP</DialogTitle>
//             <DialogDescription>
//               {/* We've sent a verification code to {phoneNumber}. Please enter the code below. */}
//             </DialogDescription>
//           </DialogHeader>
//           <Form {...otpForm}>
//             <form onSubmit={otpForm.handleSubmit(handleOTPVerification)} className="space-y-4">
//               <FormField
//                 control={otpForm.control}
//                 name="otp"
//                 render={({ field }: { field: ControllerRenderProps<any, any> }) => (
//                   <FormItem>
//                     <FormLabel>Verification Code</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="text"
//                         placeholder="Enter OTP"
//                         maxLength={6}
//                         {...field}
//                         disabled={isLoading}
//                         className="text-center text-2xl tracking-widest"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="flex space-x-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex-1"
//                   onClick={handleCloseOTPDialog}
//                   disabled={isLoading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   className="flex-1"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Verifying..." : "Verify OTP"}
//                 </Button>
//               </div>

//               <Button
//                 type="button"
//                 variant="link"
//                 className="w-full text-sm"
//                 onClick={handleResendOTP}
//                 disabled={isLoading}
//               >
//                 Resend OTP
//               </Button>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
