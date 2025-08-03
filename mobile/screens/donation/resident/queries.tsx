import { paymentApi } from "./api-config";
import { Linking } from 'react-native';
import { PaymentResponse, PaymentStatusResponse } from "../don-types";

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
    }
  }
  
  throw new Error('Payment verification timeout');
};