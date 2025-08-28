import React, { useState, useCallback, memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  DollarSign,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Scale,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from "lucide-react-native";
import { router } from "expo-router";

// Payment Component
export const Payment = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const paymentMethods = [
    {
      id: "gcash",
      name: "GCash",
      icon: Wallet,
      color: "#0066CC",
      description: "Pay using GCash mobile wallet",
    },
    {
      id: "paymaya",
      name: "PayMaya",
      icon: CreditCard,
      color: "#00D632",
      description: "Pay using PayMaya digital wallet",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: DollarSign,
      color: "#6366F1",
      description: "Direct bank transfer payment",
    },
    {
      id: "cash",
      name: "Over-the-Counter",
      icon: FileText,
      color: "#F59E0B",
      description: "Pay at barangay office",
    },
  ];

  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    setSelectedPaymentMethod(methodId);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Payment Successful",
        "Your summon fee has been paid successfully. You will receive a confirmation receipt shortly.",
        [
          {
            text: "OK",
            onPress: () => router.push("/summon-details"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Payment Failed", "Please try again or contact support.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPaymentMethod, amount]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View
        className="bg-white px-4 py-3 border-b border-gray-100"
        style={{
          paddingTop: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold text-gray-900 mr-2">
              Summon Payment
            </Text>
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              className="p-1"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Info size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Payment Summary Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Scale size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Summon Fee Payment
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Required for summon processing
                </Text>
              </View>
            </View>
            
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Processing Fee</Text>
                <Text className="text-sm font-medium text-gray-900">₱100.00</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Service Charge</Text>
                <Text className="text-sm font-medium text-gray-900">₱50.00</Text>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-semibold text-gray-900">Total Amount</Text>
                  <Text className="text-lg font-bold text-blue-600">₱150.00</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Amount Input */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Enter Amount
            </Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-600 mb-2">Amount (PHP)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="150.00"
                keyboardType="numeric"
                className="text-2xl font-bold text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Payment Methods */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Select Payment Method
            </Text>
            
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => handlePaymentMethodSelect(method.id)}
                  className={`flex-row items-center p-4 rounded-xl mb-3 border-2 ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-100 bg-gray-50"
                  }`}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    <IconComponent size={24} color={method.color} />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {method.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {method.description}
                    </Text>
                  </View>
                  
                  {isSelected && (
                    <CheckCircle size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reference Number (for digital payments) */}
          {selectedPaymentMethod && selectedPaymentMethod !== "cash" && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Payment Reference
              </Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Enter transaction reference number"
                className="bg-gray-50 rounded-xl p-4 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-xs text-gray-500 mt-2">
                Please enter the reference number from your payment receipt
              </Text>
            </View>
          )}

          {/* Payment Button */}
          <TouchableOpacity
            onPress={handlePayment}
            disabled={isProcessing || !selectedPaymentMethod}
            className={`rounded-2xl p-4 items-center justify-center mb-8 ${
              isProcessing || !selectedPaymentMethod
                ? "bg-gray-300"
                : "bg-blue-600"
            }`}
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {isProcessing ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Processing Payment...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Pay ₱{amount || "150.00"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Summon Info Modal */}
      <SummonInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  );
};

// Summon Information Modal Component
const SummonInfoModal = memo(({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View
          className="bg-white px-4 py-3 border-b border-gray-100"
          style={{
            paddingTop: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-lg font-semibold text-gray-900">
              Summon Process Information
            </Text>
            
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Main Info Card */}
            <View className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
              <View className="flex-row items-center mb-4">
                <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                  <Scale size={32} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-blue-900">
                    Barangay Summon Process
                  </Text>
                  <Text className="text-sm text-blue-700 mt-1">
                    Legal mediation and dispute resolution
                  </Text>
                </View>
              </View>
            </View>

            {/* Process Steps */}
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                How the Summon Process Works
              </Text>
              
              <View className="space-y-4">
                <ProcessStep
                  number={1}
                  icon={FileText}
                  title="Summon Request Filed"
                  description="A formal summon request is submitted through the barangay system"
                  color="#3B82F6"
                />
                
                <ProcessStep
                  number={2}
                  icon={DollarSign}
                  title="Payment Required"
                  description="Processing fee of ₱150 must be paid to proceed with the summon"
                  color="#10B981"
                />
                
                <ProcessStep
                  number={3}
                  icon={FileText}
                  title="Official Summon Issued"
                  description="Official summon document is prepared and issued by the barangay"
                  color="#F59E0B"
                />
                
                <ProcessStep
                  number={4}
                  icon={Users}
                  title="Parties Notified"
                  description="All involved parties are officially notified of the summon"
                  color="#8B5CF6"
                />
                
                <ProcessStep
                  number={5}
                  icon={Calendar}
                  title="Mediation Scheduled"
                  description="A mediation session is scheduled with the barangay officials"
                  color="#EF4444"
                />
                
                <ProcessStep
                  number={6}
                  icon={Scale}
                  title="Resolution Meeting"
                  description="All parties attend the mediation to resolve the dispute"
                  color="#06B6D4"
                />
              </View>
            </View>

            {/* Important Information */}
            <View className="bg-amber-50 rounded-2xl p-6 mb-6 border border-amber-200">
              <View className="flex-row items-center mb-4">
                <AlertCircle size={24} color="#F59E0B" />
                <Text className="text-lg font-semibold text-amber-900 ml-2">
                  Important Information
                </Text>
              </View>
              
              <View className="space-y-3">
                <InfoItem
                  icon={Clock}
                  title="Processing Time"
                  description="Summons are typically processed within 3-5 business days after payment"
                />
                
                <InfoItem
                  icon={DollarSign}
                  title="Payment Policy"
                  description="All fees are non-refundable once the summon process has begun"
                />
                
                <InfoItem
                  icon={Shield}
                  title="Legal Binding"
                  description="Barangay summons are legally binding under the Katarungang Pambarangay Law"
                />
                
                <InfoItem
                  icon={Users}
                  title="Attendance Required"
                  description="All parties must attend the scheduled mediation session"
                />
              </View>
            </View>

            {/* Contact Information */}
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Need Assistance?
              </Text>
              
              <View className="space-y-3">
                <ContactItem
                  icon={MapPin}
                  title="Barangay Office"
                  description="Visit us during office hours: Mon-Fri 8:00 AM - 5:00 PM"
                />
                
                <ContactItem
                  icon={Phone}
                  title="Contact Number"
                  description="Call (032) 123-4567 for inquiries and support"
                />
                
                <ContactItem
                  icon={Mail}
                  title="Email Support"
                  description="Send your concerns to barangay@example.gov.ph"
                />
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-blue-600 rounded-2xl p-4 items-center justify-center"
              style={{
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-white font-semibold text-lg">
                I Understand
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
});

// Helper Components
const ProcessStep = memo(({ 
  number, 
  icon: Icon, 
  title, 
  description, 
  color 
}: {
  number: number;
  icon: any;
  title: string;
  description: string;
  color: string;
}) => (
  <View className="flex-row items-start">
    <View
      className="w-10 h-10 rounded-full items-center justify-center mr-4 mt-1"
      style={{ backgroundColor: `${color}15` }}
    >
      <Text className="text-sm font-bold" style={{ color }}>
        {number}
      </Text>
    </View>
    
    <View className="flex-1">
      <View className="flex-row items-center mb-1">
        <Icon size={18} color={color} />
        <Text className="text-base font-semibold text-gray-900 ml-2">
          {title}
        </Text>
      </View>
      <Text className="text-sm text-gray-600 leading-5">
        {description}
      </Text>
    </View>
  </View>
));

const InfoItem = memo(({ 
  icon: Icon, 
  title, 
  description 
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View className="flex-row items-start">
    <Icon size={18} color="#F59E0B" className="mt-1" />
    <View className="flex-1 ml-3">
      <Text className="text-sm font-semibold text-amber-900">
        {title}
      </Text>
      <Text className="text-sm text-amber-800 mt-1 leading-5">
        {description}
      </Text>
    </View>
  </View>
));

const ContactItem = memo(({ 
  icon: Icon, 
  title, 
  description 
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View className="flex-row items-start">
    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
      <Icon size={18} color="#2563EB" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 mt-1 leading-5">
        {description}
      </Text>
    </View>
  </View>
));

export default memo(Payment);