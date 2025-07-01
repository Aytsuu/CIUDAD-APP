import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { Svg, Circle } from "react-native-svg";
import { ArrowLeft, Heart } from "lucide-react-native";
import {
  createDonationPayment,
  checkPaymentStatus,
  pollPaymentStatus,
} from "./queries";
import { useState, useEffect } from "react";
import { AppState } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLayout from "@/screens/_ScreenLayout";

const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const scaleFont = (size: number) => Math.round((size * width) / 375);

const ResidentDonationMain = () => {
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: "",
    message: "",
  });

  useEffect(() => {
   const handleDeepLink = (url: string | null) => {
    if (!url) return;
    if (url.includes("checkout.paymongo.com/mobile/return") && currentPaymentId) {
      pollPaymentStatus(currentPaymentId)
        .then((status) => {
          if (status) {
            Alert.alert("Success", "Thank you for your donation!");
            setCurrentPaymentId(null);
            setShowDialog(false);
          }
        })
        .catch((error) => {
          console.log("Payment verification error:", error);
        });
    }
  };
    const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "active" && currentPaymentId) {
      pollPaymentStatus(currentPaymentId)
        .then((status) => {
          if (status) {
            Alert.alert("Success", "Thank you for your donation!");
            setCurrentPaymentId(null);
            setShowDialog(false);
          }
        })
        .catch((error) => {
          console.log("Payment verification error:", error);
        });
    }
  };

  const appStateSubscription = AppState.addEventListener(
    "change",
    handleAppStateChange
  );
  Linking.getInitialURL().then(handleDeepLink);
  const linkingSubscription = Linking.addEventListener("url", ({ url }) =>
    handleDeepLink(url)
  );

  return () => {
    appStateSubscription.remove();
    linkingSubscription.remove();
  };
}, [currentPaymentId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        setErrorModal({
          visible: true,
          title: "Invalid Amount",
          message: "Please enter a valid numerical amount for your donation.",
        });
        return;
      }

      if (amountNum < 100) {
        setErrorModal({
          visible: true,
          title: "Minimum Donation",
          message:
            "To make a meaningful impact, we kindly request a minimum donation of ₱100. " +
            "This amount helps us provide essential services and supplies to our community members. " +
            "Your generosity, no matter the size, makes a difference!",
        });
        return;
      }

      const { checkout_url, payment_intent_id } = await createDonationPayment(amountNum);
      await AsyncStorage.setItem('current_payment', payment_intent_id);
      await WebBrowser.openBrowserAsync(checkout_url);
      startPolling(payment_intent_id);

    } catch (error) {
      setErrorModal({
        visible: true,
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

const startPolling = (paymentIntentId: string) => {
  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      const status = await checkPaymentStatus(paymentIntentId); 
      if (status.paid) {
        clearInterval(interval);
        Alert.alert('Success', 'Payment completed!');
        await AsyncStorage.removeItem('current_payment');
        setCurrentPaymentId(null);
        setShowDialog(false);
      } else if (status.status === 'failed') {
        clearInterval(interval);
        setErrorModal({
          visible: true,
          title: 'Payment Failed',
          message: 'The payment attempt was not successful. Please try again.',
        });
      }
      
      // Stop after 10 minutes
      if (Date.now() - startTime > 600000) {
        clearInterval(interval);
        setErrorModal({
          visible: true,
          title: 'Payment Timeout',
          message: 'Payment verification timed out. Please try again.',
        });
      }
    } catch (error) {
      clearInterval(interval);
      setErrorModal({
        visible: true,
        title: 'Error',
        message: 'An error occurred while verifying payment. Please try again.',
      });
    }
  }, 3000); // Check every 3 seconds
};

// Ensure the useEffect for pending payment uses the imported functions
useEffect(() => {
  const checkPendingPayment = async () => {
    const paymentId = await AsyncStorage.getItem('current_payment');
    if (paymentId) {
      setCurrentPaymentId(paymentId);
      startPolling(paymentId);
    }
  };
  
  checkPendingPayment();
}, []);
  return (
    <ScreenLayout>
    <SafeAreaView className="flex-1 bg-[#002D2A] relative overflow-hidden">
      <View className="flex-row items-center px-4 pt-16 pb-4 z-10">
        <TouchableOpacity onPress={() => {}}>
          <ArrowLeft size={scale(24)} color="#68d391" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View
          className="absolute -bottom-[150px] -right-[150px] z-[-1]"
          style={{
            bottom: -scale(150),
            right: -scale(150),
          }}
        >
          <Svg
            height={Math.min(width, height) * 1.5}
            width={Math.min(width, height) * 1.5}
            viewBox="0 0 80 78"
          >
            <Circle cx="50" cy="50" r="50" fill="#68d391" fillOpacity={0.04} />
          </Svg>
        </View>

        <View className="p-4 pb-6">
          <Text
            className="text-white font-bold mb-4 text-center"
            style={{
              fontSize: scaleFont(34),
              lineHeight: scaleFont(42),
            }}
          >
            GIVE WHERE THE NEED IS GREATEST.
          </Text>

          <View className="mb-4">
            <Image
              source={require("../../../assets/images/donation/Untitled1.png")}
              className="w-full rounded-lg"
              style={{
                height: width > 600 ? scale(300) : scale(200),
              }}
              resizeMode="contain"
            />
          </View>

          <View className="mb-4">
            <Text
              className="text-white font-bold text-center mb-3"
              style={{
                fontSize: scaleFont(18),
                lineHeight: scaleFont(24),
              }}
            >
              Partner with us to drive community growth and development.
            </Text>
            <Text
              className="text-white text-center"
              style={{
                fontSize: scaleFont(14),
                lineHeight: scaleFont(20),
              }}
            >
              Your donations help improve {"\n"} education, safety, healthcare,{" "}
              {"\n"}and sustainability in Barangay {"\n"}San Roque Ciudad.
            </Text>
            <Text
              className="text-white text-center"
              style={{
                fontSize: scaleFont(5),
                lineHeight: scaleFont(20),
              }}
            >
              We also accept non-monetary donations. Please visit us at the
              barangay!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowDialog(true);
              setAmount("");
            }}
            className="bg-[#48bb78] py-4 w-40 mt-3 rounded-full items-center self-center"
          >
            <Text className="text-white font-bold">Start to Help</Text>
          </TouchableOpacity>

          <Modal
            visible={showDialog}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setShowDialog(false);
              setAmount("");
            }}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-6 rounded-lg w-80">
                <View className="items-center mb-4">
                  <View className="bg-[#002D2A] p-3 rounded-full mb-2">
                    <Heart size={24} color="#68d391" />
                  </View>
                  <Text className="text-lg font-bold text-[#002D2A]">
                    Make a Difference
                  </Text>
                </View>

                <Text className="text-center text-gray-700 mb-4">
                  Your <Text className="font-bold">₱100</Text> can provide:
                </Text>

                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-[#48bb78] rounded-full mr-2"></View>
                    <Text className="text-gray-700">
                      Educational activities for children
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-[#48bb78] rounded-full mr-2"></View>
                    <Text className="text-gray-700">
                      Additional relief supplies
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-[#48bb78] rounded-full mr-2"></View>
                    <Text className="text-gray-700">
                      Sustainable livelihood programs
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-500 mb-1">
                  Donation Amount (PHP)
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg mb-4">
                  <Text className="px-3 text-gray-500">₱</Text>
                  <TextInput
                    className="flex-1 p-3"
                    keyboardType="numeric"
                    placeholder="100"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus={true}
                  />
                </View>

                <Text className="text-xs text-center text-gray-500 mb-4">
                  "Every peso is accounted for and directly benefits Barangay
                  San Roque residents."
                </Text>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => setShowDialog(false)}
                    className="px-4 py-2 border border-[#002D2A] rounded-md"
                  >
                    <Text className="text-[#002D2A]">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePayment}
                    disabled={!amount || isProcessing}
                    className={`px-4 py-2 rounded-md ${
                      !amount ? "bg-gray-300" : "bg-[#48bb78]"
                    }`}
                  >
                    <Text className="text-white font-medium">
                      {isProcessing ? "Processing..." : "Donate Now"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={errorModal.visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() =>
              setErrorModal({ ...errorModal, visible: false })
            }
          >
            <View className="flex-1 justify-center items-center bg-black/70 p-5">
              <View className="bg-white rounded-xl w-full max-w-md overflow-hidden">
                <View className="bg-red-100 p-5 items-center">
                  <Text className="text-red-600 font-bold text-lg">
                    {errorModal.title}
                  </Text>
                </View>
                <View className="p-5">
                  <Text className="text-gray-700 text-center mb-5">
                    {errorModal.message}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setErrorModal({ ...errorModal, visible: false })
                    }
                    className="bg-red-600 py-3 rounded-lg"
                  >
                    <Text className="text-white font-medium text-center">
                      Got It
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenLayout>
  );
};

export default ResidentDonationMain;
