import { paymentApi } from "./api-config";
import { Linking, Alert } from 'react-native';
import { AxiosError } from "axios";

export interface PaymentResponse {
  checkout_url: string;
  payment_intent_id: string;
  [key: string]: any; // For any additional properties
}

export interface PaymentStatusResponse {
  status: string;
  paid: boolean;
  amount?: number;
  payment_method?: string;
}
// export const createDonationPayment = async (
//   params: CreateDonationParams
// ): Promise<DonationResponse> => {
//   try {
//     const response = await paymentApi.post<DonationResponse>(
//       'donation/create-payment/',
//       params
//     );
    
//     if (!response.data.checkout_url || !response.data.payment_intent_id) {
//       throw new Error('Invalid response from server');
//     }
    
//     return response.data;
//   } catch (error) {
//     const axiosError = error as AxiosError<{ error?: string }>;
    
//     console.error('Payment Error:', {
//       url: axiosError.config?.url,
//       status: axiosError.response?.status,
//       data: axiosError.response?.data
//     });
    
//     throw new Error(
//       axiosError.response?.data?.error || 
//       axiosError.message || 
//       'Payment processing failed'
//     );
//   }
// };

export const createDonationPayment = async (amount: number): Promise<PaymentResponse> => {
  try {
    // Validate amount
    if (amount < 100) throw new Error("Minimum donation is ₱100");
    if (amount > 100000) throw new Error("Maximum donation is ₱100,000");

    const response = await paymentApi.post<PaymentResponse>('/donation/create-payment/', {
      amount: amount,
      currency: "PHP"
    });

    if (!response.data.checkout_url || !response.data.payment_intent_id) {
      throw new Error("Invalid response from server");
    }

    return {
      checkout_url: response.data.checkout_url,
      payment_intent_id: response.data.payment_intent_id
    };
  } catch (error) {
    console.error("Payment creation error:", error);
    throw error;
  }
};

export const handleDonationPayment = async (checkoutUrl: string): Promise<void> => {
  try {
    // 1. Basic URL validation
    if (!checkoutUrl?.startsWith('https://')) {
      throw new Error('Invalid payment URL');
    }

    // 2. Check if device can handle the URL
    const canOpen = await Linking.canOpenURL(checkoutUrl);
    if (!canOpen) {
      throw new Error("Cannot open payment gateway");
    }

    // 3. Open directly in system browser
    await Linking.openURL(checkoutUrl);

    // 4. Set up deep link listener for return
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url.includes('checkout.paymongo.com/mobile/return')) {
        subscription.remove();
        checkPaymentStatus(checkoutUrl); 
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Payment failed'
    );
  }
};

export const checkPaymentStatus = async (
  paymentIntentId: string
): Promise<PaymentStatusResponse> => {
  try {
    const response = await paymentApi.get<PaymentStatusResponse>(
      `donation/payment-status/${paymentIntentId}/`
    );
    return response.data;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
};

export const pollPaymentStatus = async (
  paymentIntentId: string,
  interval = 3000,
  timeout = 60000
): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const { paid, status } = await checkPaymentStatus(paymentIntentId);
      
      if (paid) return true;
      if (status === 'failed') return false;
      
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling despite errors
    }
  }
  
  throw new Error('Payment verification timeout');
};