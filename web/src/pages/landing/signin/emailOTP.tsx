import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface EmailOTPProps {
  email: string;
  onSuccess: (userId: string) => void;
  onResend: () => void;
}

export default function EmailOTP({ email, onSuccess, onResend }: EmailOTPProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { sendEmailOTP, verifyEmailOTP } = useAuth();

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
    if (newOtp.every(digit => digit !== "") && !loading) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Verifying email OTP:", otpCode, "for email:", email); // Debug log
      
      const response = await verifyEmailOTP(otpCode, email);
      
      console.log("Verification response:", response); // Debug log

      // Check if response is null (which means the mutation caught an error)
      if (response === null) {
        setErrorMessage("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Check if response indicates success (adjust based on your API response structure)
      if (response && response.data) {
        toast.success("Email verified successfully!");
        // Extract userId from response if available, or use a placeholder
        const userId = response.data.userId || response.data.user_id || "verified_user";
        onSuccess(userId);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error("Email OTP verification error:", error);
      setErrorMessage(
        error?.response?.data?.error ||
        error?.response?.data?.message || 
        error?.message || 
        "Invalid OTP. Please try again."
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setErrorMessage("");
    
    try {
      const success = await sendEmailOTP(email);
      
      if (success) {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        toast.success("New OTP sent to your email!");
      } else {
        setErrorMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      setErrorMessage(
        error?.response?.data?.error ||
        error?.response?.data?.message || 
        error?.message || 
        "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username && domain) {
      const hiddenPart = username.length > 2 
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : username;
      return `${hiddenPart}@${domain}`;
    }
    return email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-gray-600 text-sm">
          Enter the 6-digit code sent to
        </p>
        <p className="font-semibold text-gray-900">
          {formatEmail(email)}
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
            disabled={loading}
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
      {loading && (
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
            disabled={resendLoading}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
          >
            {resendLoading ? (
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
          <p className="text-gray-500 text-sm">
            Resend available in {timer}s
          </p>
        )}
      </div>

      {/* Manual Verify Button (hidden when auto-submit works) */}
      {otp.every(digit => digit !== "") && !loading && (
        <Button
          onClick={() => handleVerifyOtp(otp.join(""))}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Verify Email Address
        </Button>
      )}
    </div>
  );
}