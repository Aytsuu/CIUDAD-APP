// import "@/global.css";
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   ActivityIndicator,
//   Modal,
// } from "react-native";
// import { useToastContext } from "@/components/ui/toast";
// import { useRouter } from "expo-router";
// import { Mail, ArrowLeft, CheckCircle, RefreshCcw } from "lucide-react-native";
// import { useDispatch, useSelector } from "react-redux";
// // import { RootState } from "@/redux";
// // import { sendEmailOTP, verifyEmailOTP } from "@/redux/authSlice";

// export default function SendEmailOTP() {
//   // const dispatch = useDispatch();
//   // const { isLoading: authLoading, error } = useSelector(
//   //   (state: RootState) => state.auth
//   // );
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isValidEmail, setIsValidEmail] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const { toast } = useToastContext();
//   const router = useRouter();
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const otpRefs = useRef<Array<TextInput | null>>([]);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useEffect(() => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     setIsValidEmail(emailRegex.test(email));
//   }, [email]);

//   const sendOTP = async () => {
//     if (!isValidEmail) {
//       toast.error("Please enter a valid email address");
//       return;
//     }
//     setLoading(true);
//     try {
//       // const response = await dispatch(sendEmailOTP({ email }));

//       // if (sendEmailOTP.fulfilled.match(response)) {
//       //   toast.success("OTP sent successfully!");
//       //   setModalVisible(true);
//       // } else {
//       //   toast.error(response.payload || "Failed to send OTP");
//       // }
//     } catch (error: any) {
//       toast.error("Something went wrong while sending OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpChange = (index: number, value: string) => {
//     if (value.length > 1) value = value.slice(-1);
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value && index < otp.length - 1) {
//       otpRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleOtpKeyPress = (index: number, key: string) => {
//     if (key === "Backspace" && !otp[index] && index > 0) {
//       otpRefs.current[index - 1]?.focus();
//     }
//   };

//   const verifyOtp = async () => {
//     const enteredOtp = otp.join("");
//     if (enteredOtp.length < 6) {
//       toast.error("Please enter the complete OTP");
//       return;
//     }

//     try {
//       // const response = await dispatch(
//       //   verifyEmailOTP({ email, otp: enteredOtp })
//       // );

//       // if (verifyEmailOTP.fulfilled.match(response)) {
//       //   toast.success(response.payload.message || "OTP verified successfully!");
//       //   setModalVisible(false);
//       //   // router.push("/(tabs)"); // route after verification
//       // } else {
//       //   toast.error(response.payload || "OTP verification failed");
//       // }
//     } catch (err) {
//       toast.error("Something went wrong while verifying OTP");
//     }
//   };

//   const resendOtp = async () => {
//     toast.success("OTP resent successfully!");
//     setOtp(["", "", "", "", "", ""]);
//   };

//   return (
//     <ScrollView
//       className="flex-1 bg-gray-50"
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={{ flexGrow: 1 }}
//     >
//       {/* Header */}
//       <View className="flex-row items-center px-6 pt-12 pb-6">
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-4"
//         >
//           <ArrowLeft size={20} color="#6B7280" />
//         </TouchableOpacity>
//         <Text className="text-lg font-semibold text-gray-800">
//           Email Verification
//         </Text>
//       </View>

//       <Animated.View style={{ opacity: fadeAnim }} className="flex-1 px-6">
//         {/* Icon Section */}
//         <View className="items-center mb-8">
//           <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
//             <Mail size={32} color="white" />
//           </View>
//           <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
//             Verify Your Email
//           </Text>
//           <Text className="text-gray-600 text-center leading-6 px-4">
//             Enter your email address and we'll send you a secure OTP to verify
//             your identity
//           </Text>
//         </View>

//         {/* Form Section */}
//         <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
//           <Text className="text-base font-medium mb-3 text-gray-800">
//             Email Address
//           </Text>

//           <View className="relative mb-4">
//             <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
//               <Mail
//                 size={18}
//                 color={email ? (isValidEmail ? "#10B981" : "#EF4444") : "#9CA3AF"}
//               />
//             </View>

//             <TextInput
//               className={`border-2 rounded-xl pl-12 pr-12 py-4 bg-gray-50 text-gray-800 text-base ${
//                 email
//                   ? isValidEmail
//                     ? "border-green-500 bg-green-50"
//                     : "border-red-500 bg-red-50"
//                   : "border-gray-200"
//               }`}
//               value={email}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               autoCorrect={false}
//               placeholder="Enter your email address"
//               placeholderTextColor="#9CA3AF"
//               onChangeText={setEmail}
//               editable={!loading}
//             />

//             {email && isValidEmail && (
//               <View className="absolute right-4 top-1/2 -translate-y-1/2">
//                 <CheckCircle size={18} color="#10B981" />
//               </View>
//             )}
//           </View>

//           <View className="mb-10">
//             <Text className="text-gray-400 text-sm text-start leading-5">
//               The OTP will expire in <Text className="font-semibold">1 minute.</Text>
//             </Text>
//           </View>

//           <TouchableOpacity
//             onPress={sendOTP}
//             disabled={loading || !isValidEmail}
//             className={`rounded-xl py-4 flex-row justify-center items-center ${
//               authLoading || !isValidEmail ? "bg-gray-300" : "bg-blue-600"
//             }`}
//           >
//             {authLoading ? (
//               <View className="flex-row items-center">
//                 <ActivityIndicator color="white" size="small" />
//                 <Text className="text-white font-semibold text-base ml-2">
//                   Sending OTP...
//                 </Text>
//               </View>
//             ) : (
//               <View className="flex-row items-center">
//                 <Mail size={18} color="white" />
//                 <Text className="text-white font-semibold text-base ml-2">
//                   Send OTP
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View className="bg-white/70 rounded-xl p-4 mx-2">
//           <Text className="text-gray-600 text-sm text-center">
//             🔒 Your email is secure and will only be used for verification
//           </Text>
//         </View>
//       </Animated.View>

//       {/* Footer */}
//       <View className="px-6 pb-8 pt-4">
//         <Text className="text-center text-gray-500 text-xs leading-5">
//           By continuing, you agree to our{" "}
//           <Text className="text-blue-600 font-medium">Terms of Service</Text> and{" "}
//           <Text className="text-blue-600 font-medium">Privacy Policy</Text>
//         </Text>
//       </View>

//       {/* OTP Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <View className="w-[90%] max-w-md bg-white rounded-2xl p-6">
//             <Text className="text-center text-xl font-bold mb-3">Enter OTP</Text>
//             <Text className="text-center text-gray-600 mb-5">
//               We have sent a 6-digit OTP to your email
//             </Text>

//             <View className="flex-row justify-between mb-5">
//               {otp.map((digit, index) => (
//                 <TextInput
//                   key={index}
//                   ref={(el) => (otpRefs.current[index] = el)}
//                   className="border border-gray-300 rounded-lg w-12 h-14 text-center text-lg"
//                   value={digit}
//                   keyboardType="number-pad"
//                   maxLength={1}
//                   onChangeText={(value) => handleOtpChange(index, value)}
//                   onKeyPress={({ nativeEvent }) =>
//                     handleOtpKeyPress(index, nativeEvent.key)
//                   }
//                 />
//               ))}
//             </View>

//             <TouchableOpacity
//               onPress={verifyOtp}
//               className="bg-blue-600 py-3 rounded-xl mb-3"
//             >
//               <Text className="text-white text-center font-semibold">
//                 Verify OTP
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="flex-row justify-center items-center"
//               onPress={resendOtp}
//             >
//               <RefreshCcw size={18} color="#3B82F6" />
//               <Text className="text-blue-600 font-semibold ml-2">Resend OTP</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }
