import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/auth-redux/useAuthMutation";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/firebase";
import { FCMTokenPOST } from "../rest-api/FCMTokenPOST";

interface OTPVerificationProps {
  method: "phone" | "email";
  phone?: string;
  email?: string;
  serverOtp?: string;
  onSuccess: () => void;
  onResend: () => Promise<void>;
  isResending?: boolean;
}

export default function OTPVerification({
  method,
  phone,
  email,
  onSuccess,
  onResend,
  isResending = false,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validateOTPMutation = useLoginMutation();

  // const contact = method === "phone" ? phone! : email!;
  const Icon = method === "phone" ? Phone : Mail;
  // const iconColorClass = method === "phone" ? "text-green-600" : "text-blue-600";
  const bgGradient =
    method === "phone"
      ? "bg-gradient-to-br from-green-500 to-green-600"
      : "bg-gradient-to-br from-blue-500 to-blue-600";
  const buttonGradient =
    method === "phone"
      ? "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      : "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800";
  const shadowColor =
    method === "phone" ? "shadow-green-200" : "shadow-blue-200";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && !isVerifying) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setErrorMessage("");
    setIsVerifying(true);

    try {
      // Prepare payload based on method
      const payload = {
        otp: otpCode,
        ...(method === "email" ? { email: email! } : { phone: phone! }),
      };

      // Call backend to validate OTP
      const response = await validateOTPMutation.mutateAsync(payload);

      if (response && response.access) {
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          try {
            const messaging = getMessaging(app);
            const vapidKey = "";
            const fcmToken = await getToken(messaging, { vapidKey });

            if (fcmToken) {
              console.log("Token generated in frontend: ", fcmToken);
              await FCMTokenPOST(fcmToken);
            }
          } catch (err) {
            console.error("Error fetching FCM token: ", err);
          }
        } else {
          toast.info("Notifications blocked by user");
        }
    
        toast.success("Successfully signed in!");
        onSuccess();
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        resetOtp();
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Invalid OTP. Please try again."
      );
      resetOtp();
    } finally {
      setIsVerifying(false);
    }
  };

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;

    setErrorMessage("");

    try {
      await onResend();
      setTimer(60);
      setCanResend(false);
      resetOtp();
      toast.success(
        `New OTP sent to your ${method === "phone" ? "phone" : "email"}!`
      );
    } catch (error: any) {
      console.error("Resend error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to resend OTP. Please try again."
      );
    }
  };

  // const formatContact = (contact: string, method: "phone" | "email") => {
  //   if (method === "email") {
  //     const [username, domain] = contact.split('@');
  //     if (username && domain) {
  //       const hiddenPart = username.length > 2
  //         ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
  //         : username;
  //       return `${hiddenPart}@${domain}`;
  //     }
  //   }
  //   return contact;
  // };

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="text-center space-y-3">
        <div
          className={`w-16 h-16 ${bgGradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg ${shadowColor}`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="number"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300"
          />
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50"
        >
          <AlertDescription className="text-red-700 text-sm text-center">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Verifying OTP...</span>
        </div>
      )}

      {/* Resend Section */}
      <div className="text-center space-y-10">
        <p className="text-gray-600 text-sm">Didn't receive the code?</p>

        {canResend ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl font-semibold text-gray-700 transition-all duration-200 disabled:opacity-50"
          >
            {isResending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
                <span>Resending OTP...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                <span>Resend OTP</span>
              </div>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm font-medium">
              Resend available in{" "}
              <span className="text-blue-600">{timer}s</span>
            </p>
          </div>
        )}
      </div>

      {/* Manual Verify Button (hidden when auto-submit works) */}
      {otp.every((digit) => digit !== "") && !isVerifying && (
        <Button
          onClick={() => handleVerifyOtp(otp.join(""))}
          disabled={isVerifying}
          className={`w-full h-12 bg-gradient-to-r ${buttonGradient} text-white rounded-xl font-semibold shadow-lg ${shadowColor} hover:shadow-xl transition-all duration-200`}
        >
          Verify {method === "phone" ? "Phone Number" : "Email Address"}
        </Button>
      )}
    </div>
  );
}
