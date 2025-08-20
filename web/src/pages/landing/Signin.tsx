// import { useState } from "react";
// import { useForm, ControllerRenderProps } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Eye, EyeOff, Lock } from "lucide-react";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
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
// } from "@/components/ui/card/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useNavigate } from "react-router";
// import SignInSchema from "@/form-schema/sign-in-schema";
// import { useAuth } from "@/context/AuthContext";
// import { SignInSchema2 } from "@/form-schema/sign-in-schema";

// interface SignInProps {
//   onShowForgotPassword: () => void;
// }

// export default function SignIn({ onShowForgotPassword }: SignInProps) {
//   const { login } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   const form = useForm<z.infer<typeof SignInSchema>>({
//     resolver: zodResolver(SignInSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const handleSignIn = async (credentials: z.infer<typeof SignInSchema>) => {
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       await login(credentials.email, credentials.password);
//     } catch (error) {
//       console.error("Login error:", error);
//       setErrorMessage(
//         error instanceof Error
//           ? error.message
//           : "Login failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md border-0 shadow-none">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl text-center">Sign In</CardTitle>
//         <CardDescription className="text-center">
//           Authorized personnel only. Sign in to manage records, oversee
//           programs, and access tools essential for barangay operations.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSignIn)}
//             className="space-y-4"
//           >
//             <FormField
//               control={form.control}
//               name="email"
//               render={({
//                 field,
//               }: {
//                 field: ControllerRenderProps<any, any>;
//               }) => (
//                 <FormItem>
//                   <FormLabel>Email address</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="Email address"
//                       {...field}
//                       disabled={loading}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               render={({
//                 field,
//               }: {
//                 field: ControllerRenderProps<any, any>;
//               }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <Input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Password"
//                         {...field}
//                         disabled={loading}
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                         onClick={() => setShowPassword(!showPassword)}
//                         disabled={loading}
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-4 w-4" />
//                         ) : (
//                           <Eye className="h-4 w-4" />
//                         )}
//                       </Button>
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {errorMessage && (
//               <Alert variant="destructive">
//                 <AlertDescription>{errorMessage}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <Checkbox id="remember" />
//                 <Label htmlFor="remember" className="text-sm">
//                   Remember me
//                 </Label>
//               </div>
//               <Button 
//                 type="button"
//                 variant="link" 
//                 className="px-0 text-sm"
//                 onClick={onShowForgotPassword}
//               >
//                 Forgot your password?
//               </Button>
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   <Lock className="mr-2 h-4 w-4" />
//                   Sign in
//                 </>
//               )}
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }


import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff } from "lucide-react";
import { BsGoogle } from "react-icons/bs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import SignInSchema2 from "@/form-schema/sign-in-schema";
import { useAuth } from "@/context/AuthContext";

interface SignInProps {
  onShowForgotPassword: () => void;
}

// OTP verification schema
const OTPSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 digits").max(6, "OTP must be at most 6 digits")
});

export default function SignIn({ onShowForgotPassword }: SignInProps) {
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const navigate = useNavigate();
  
  // Use your enhanced auth context
  const { 
    loginWithGoogle, 
    isLoading, 
    error, 
    clearError 
  } = useAuth();

  const form = useForm<z.infer<typeof SignInSchema2>>({
    resolver: zodResolver(SignInSchema2)
  });

  const otpForm = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema)
  });

  const handlePhoneSignIn = async (values: z.infer<typeof SignInSchema2>) => {
    clearError();

    try {
      // await sendOTP(values.phone_number);
      setShowOTPDialog(true);
    } catch (error) {
      // Error is handled by the auth context
      console.error("Phone sign in error:", error);
    }
  };

  const handleOTPVerification = async (values: z.infer<typeof OTPSchema>) => {
    clearError();

    try {
      // await verifyOTPAndLogin(values.otp);
      setShowOTPDialog(false);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
      console.error("OTP verification error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();

    try {
      await loginWithGoogle();
      // Redirect will be handled by OAuth callback
    } catch (error) {
      // Error is handled by the auth context
      console.error("Google sign in error:", error);
    }
  };

  const handleResendOTP = async () => {
    // if (phoneNumber) {
    //   clearError();
    //   try {
    //     await sendOTP(phoneNumber);
    //   } catch (error) {
    //     console.error("Resend OTP error:", error);
    //   }
    // }
  };

  const handleCloseOTPDialog = () => {
    setShowOTPDialog(false);
    clearError();
    otpForm.reset();
  };

  return (
    <>
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="space-y-1 mb-10">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Authorized personnel only. Sign in to manage records, oversee
            programs, and access tools essential for barangay operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePhoneSignIn)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+63 912 345 6789"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Remember me checkbox can be added here if needed */}
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> 
                    Sign in
                  </>
                )}
              </Button>

              <Button
                type="button"
                className="w-full bg-white text-black border hover:bg-gray-50 flex items-center justify-center"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <BsGoogle className="mr-2 h-4 w-4" /> Sign in with Google
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={handleCloseOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              {/* We've sent a verification code to {phoneNumber}. Please enter the code below. */}
            </DialogDescription>
          </DialogHeader>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleOTPVerification)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }: { field: ControllerRenderProps<any, any> }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        maxLength={6}
                        {...field}
                        disabled={isLoading}
                        className="text-center text-2xl tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseOTPDialog}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>

              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}