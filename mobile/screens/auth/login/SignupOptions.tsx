import React from "react"
import { useRouter } from "expo-router";
import { Animated, Dimensions, Modal, ScrollView, TouchableOpacity, View, Text } from "react-native"
import { useToastContext } from "@/components/ui/toast";
import { Ionicons } from '@expo/vector-icons'; 

export const SignupOptions = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const { toast } = useToastContext();
  const { height: screenHeight } = Dimensions.get("window")
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 5,
        friction: 20,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const handleClose = () => {
    onClose();
  }
  
  const signupOptions = [
    {
      id: 'independent',
      title: 'Independent Registration',
      description: 'Register as an individual resident',
      icon: 'person-outline',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      route: '/verify-age'
    },
    {
      id: 'family',
      title: 'Family Registration',
      description: 'Register with family members',
      icon: 'people-outline',
      color: '#10B981',
      bgColor: '#ECFDF5',
      route: '/age-verification'
    },
    {
      id: 'existing',
      title: 'Link to Existing Profile',
      description: 'Connect to an existing resident profile',
      icon: 'link-outline',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      route: '/validate-resident-id'
    },
  ];

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" 
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity 
        className="flex-1 bg-black/50" 
        activeOpacity={1} 
        onPress={handleClose}
      >
        {/* Drawer Container */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.85,
            elevation: 20,
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Drawer Handle */}
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Drawer Header */}
            <View className="px-6 pb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-PoppinsSemiBold text-gray-900">
                  Choose Registration Type
                </Text>
                <TouchableOpacity 
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm font-PoppinsRegular text-gray-600">
                Select how you'd like to register
              </Text>
            </View>

            {/* Drawer Content */}
            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.55 }}
            >
              <View className="flex flex-col gap-3 pb-8">
                {signupOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => {
                      onClose();
                      router.push(option.route as any)
                    }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-4">
                      {/* Icon Container */}
                      <View 
                        className="w-14 h-14 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: option.bgColor }}
                      >
                        <Ionicons 
                          name={option.icon as any} 
                          size={24} 
                          color={option.color} 
                        />
                      </View>
                      
                      {/* Content */}
                      <View className="flex-1">
                        <Text className="text-md font-PoppinsSemiBold text-gray-900 mb-1">
                          {option.title}
                        </Text>
                        <Text className="text-sm font-PoppinsRegular text-gray-600 leading-5">
                          {option.description}
                        </Text>
                      </View>
                      
                      {/* Arrow */}
                      <View className="w-6 h-6 items-center justify-center">
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Additional Info */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 items-center justify-center mt-0.5">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-PoppinsMedium text-blue-900 mb-1">
                      Need Help?
                    </Text>
                    <Text className="text-xs font-PoppinsRegular text-blue-700 leading-4">
                      Contact the administrator if you're unsure which option to choose.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}