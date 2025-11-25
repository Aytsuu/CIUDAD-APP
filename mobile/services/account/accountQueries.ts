import api from "@/api/api";

// Send Email OTP
export const sendEmailOTP = async (data: { email: string; type: "signup" | "signin" }) => {
  try {
    const response = await api.post("authentication/email/sendOtp/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send Phone OTP (using PhoneVerification endpoint)
export const sendPhoneOTP = async (data: { 
  pv_phone_num: string; 
  pv_type: "signup" | "login" 
}) => {
  try {
    const response = await api.post("account/phone-verification/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify OTP (for both email and phone during signup)
export const verifyAccountRegOTP = async (data: { 
  otp: string; 
  email?: string; 
  phone?: string 
}) => {
  try {
    const response = await api.post("authentication/signup/otp-verification/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
