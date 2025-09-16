import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Phone } from "lucide-react";
import { toast } from "sonner";
import { useSendOTP } from "../queries/authPostQueries";

interface PhoneOTPProps {
  phone: string;
  serverOtp: string; // The OTP received from server
  onSuccess: (userId: string) => void;
  onResend: () => Promise<void>; 
}

export default function PhoneOTP({ phone, serverOtp, onSuccess, onResend }: PhoneOTPProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Only use for resending OTP
  const sendOTPMutation = useSendOTP();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Timer countdown
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
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && !isVerifying) {
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
      // Frontend verification - compare entered OTP with server OTP
      if (otpCode === serverOtp) {
        // Generate or extract userId - adjust based on your app's logic
        const userId = "user123"; // You might want to pass this from parent or generate it differently
        
        toast.success("Phone verified successfully!");
        onSuccess(userId);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setErrorMessage("Verification failed. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setErrorMessage("");
    
    try {
      // Call the parent's onResend function which handles the API call
      await onResend();
      
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("New OTP sent to your phone!");
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

  // const formatPhoneNumber = (phone: string) => {
  //   // Format phone number for display (e.g., +63 *** *** **45)
  //   if (phone.length >= 4) {
  //     const lastFour = phone.slice(-4);
  //     const hidden = "*".repeat(phone.length - 4);
  //     return `${hidden}${lastFour}`;
  //   }
  //   return phone;
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-gray-600 text-sm">
          Enter the 6-digit code sent to
        </p>
        <p className="font-semibold text-gray-900">
          {phone}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription className="text-sm text-center">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Verifying...</span>
        </div>
      )}

      {/* Resend Section */}
      <div className="text-center">
        <p className="text-gray-600 text-sm mb-3">
          Didn't receive the code?
        </p>
        
        {canResend ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={sendOTPMutation.isPending}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendOTPMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend OTP
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-500 text-sm">
              Resend available in {timer}s
            </p>
          </div>
        )}
      </div>

      {/* Manual Verify Button (hidden when auto-submit works) */}
      {otp.every(digit => digit !== "") && !isVerifying && (
        <Button
          onClick={() => handleVerifyOtp(otp.join(""))}
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Verify Phone Number
        </Button>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>Debug - Server OTP: {serverOtp}</p>
        </div>
      )}
    </div>
  );
}