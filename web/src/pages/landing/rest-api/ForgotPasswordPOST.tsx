import { api } from "@/api/api";
import { useState } from "react";
// Types for better type safety
interface SendCodeData {
  email: string;
}

interface VerifyCodeData {
  code: string;
}

interface ResetPasswordData {
  password: string;
  confirmPassword?: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  reset_token?: string;
}

// Enhanced handlers with better error handling and type safety
const handleSendCode = async (data: SendCodeData) => {
  setLoading(true);
  setErrorMessage("");

  try {
    const response = await api.post('authentication/forgot-password/send-code/', {
      email: data.email
    });
    
    const result: ApiResponse = response.data;
    
    // Store email for subsequent steps
    setEmail(data.email);
    setCurrentStep('verification');
    
    // Optional: Show success message
    console.log(result.message || "Reset code sent successfully");
    
  } catch (error: any) {
    console.error("Send code error:", error);
    
    // Handle different error scenarios
    if (error.response?.status === 400) {
      setErrorMessage("Please enter a valid email address");
    } else if (error.response?.status === 500) {
      setErrorMessage("Server error. Please try again later");
    } else {
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        "Failed to send reset code. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

const handleVerifyCode = async (data: VerifyCodeData) => {
  setLoading(true);
  setErrorMessage("");

  try {
    const response = await api.post('authentication/forgot-password/verify-code/', {
      email: email,
      code: data.code
    });
    
    const result: ApiResponse = response.data;
    
    // Store the reset token for the password reset step
    if (result.reset_token) {
      setResetToken(result.reset_token);
      setCurrentStep('reset');
    } else {
      throw new Error("No reset token received");
    }
    
  } catch (error: any) {
    console.error("Verify code error:", error);
    
    // Handle different error scenarios
    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.error;
      if (errorMsg?.includes("expired")) {
        setErrorMessage("Code has expired. Please request a new one");
      } else if (errorMsg?.includes("Invalid")) {
        setErrorMessage("Invalid code. Please check and try again");
      } else {
        setErrorMessage("Please enter both email and verification code");
      }
    } else {
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        "Invalid or expired code. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

const handleResetPassword = async (data: ResetPasswordData) => {
  setLoading(true);
  setErrorMessage("");

  // Client-side validation
  if (data.password !== data.confirmPassword) {
    setErrorMessage("Passwords do not match");
    setLoading(false);
    return;
  }

  if (data.password.length < 8) {
    setErrorMessage("Password must be at least 8 characters long");
    setLoading(false);
    return;
  }

  try {
    const response = await api.post('authentication/forgot-password/reset/', {
      email: email,
      reset_token: resetToken,
      new_password: data.password
    });
    
    const result: ApiResponse = response.data;
    
    // Clear sensitive data
    setResetToken(null);
    setCurrentStep('success');
    
    console.log(result.message || "Password reset successfully");
    
  } catch (error: any) {
    console.error("Reset password error:", error);
    
    // Handle different error scenarios
    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.error;
      if (errorMsg?.includes("expired")) {
        setErrorMessage("Reset session expired. Please start over");
        setCurrentStep('email'); // Reset to beginning
      } else if (errorMsg?.includes("different")) {
        setErrorMessage("New password must be different from current password");
      } else if (errorMsg?.includes("8 characters")) {
        setErrorMessage("Password must be at least 8 characters long");
      } else {
        setErrorMessage("Invalid reset request. Please start over");
      }
    } else if (error.response?.status === 500) {
      setErrorMessage("Server error. Please try again later");
    } else {
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        "Failed to reset password. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

const handleResendCode = async () => {
  setLoading(true);
  setErrorMessage("");

  try {
    const response = await api.post('authentication/forgot-password/resend-code/', {
      email: email
    });
    
    const result: ApiResponse = response.data;
    
    // Show success message (you might want to use a toast notification instead)
    console.log(result.message || "Code resent successfully");
    
    // Optional: Show temporary success message in UI
    setSuccessMessage("Code resent successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    
  } catch (error: any) {
    console.error("Resend code error:", error);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      setErrorMessage("Please wait before requesting another code");
    } else if (error.response?.status === 500) {
      setErrorMessage("Server error. Please try again later");
    } else {
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        "Failed to resend code. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

// Additional utility functions for better UX

const handleBackToEmail = () => {
  setCurrentStep('email');
  setEmail('');
  setResetToken(null);
  setErrorMessage('');
};

const handleBackToVerification = () => {
  setCurrentStep('verification');
  setResetToken(null);
  setErrorMessage('');
};

// Optional: Add timeout handling for better UX
const handleTimeout = () => {
  setErrorMessage("Session expired. Please start over.");
  setCurrentStep('email');
  setEmail('');
  setResetToken(null);
};

// Export all handlers for use in your components
export {
  handleSendCode,
  handleVerifyCode,
  handleResetPassword,
  handleResendCode,
  handleBackToEmail,
  handleBackToVerification,
  handleTimeout
};

// Additional state variables you might need:
const [email, setEmail] = useState('');
const [resetToken, setResetToken] = useState(null);
const [currentStep, setCurrentStep] = useState('email'); // 'email' | 'verification' | 'reset' | 'success'
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const [successMessage, setSuccessMessage] = useState(''); // Optional for success notifications