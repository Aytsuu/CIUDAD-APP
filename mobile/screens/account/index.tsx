import {
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ui/toast";
import PageLayout from "../_PageLayout";
import Ciudad from '@/assets/icons/essentials/ciudad_logo.svg'
import Logout from '@/assets/icons/essentials/logout.svg'
import Settings from '@/assets/icons/essentials/settings.svg'
import TermsCondition from '@/assets/icons/essentials/termsCon.svg'
import Star from '@/assets/icons/essentials/star.svg'
import Service from '@/assets/icons/essentials/service.svg'
import InformationCircle from '@/assets/icons/essentials/information-circle.svg'
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export default () => {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToastContext();

  const menuItems = [
    {
      name: "About",
      icon: InformationCircle,
      addIcon: Ciudad,
      route: "/(account)/about"
    },
    {
      name: "Rate our app",
      icon: Star,
      route: "/(account)/app-rating"
    },
    {
      name: "Support",
      icon: Service,
      route: "/(account)/support"
    },
    // {
    //   name: "Terms & Condition",
    //   icon: TermsCondition
    // },
    {
      name: "Settings",
      icon: Settings,
      route: "/(account)/settings"
    },
  ]

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/(auth)");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.success("Signed out successfully");
    }
  };
  
  return (
    <PageLayout 
      leftAction={<View className="w-10 h-10" />}
      headerTitle={<Text className="text-gray-900 text-[13px]">Account</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6 py-2">
        <View className="flex-row border-b border-gray-100 pb-3 gap-4">
          <View className="relative">
            <Image
              source={
                user?.profile_image
                  ? { uri: user.profile_image }
                  : require("@/assets/images/Logo.png")
              }
              className="w-20 h-20 rounded-full"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          </View>
          <View>
              <Text className="text-lg text-gray-700 font-PoppinsMedium mb-2">
                Hi, {user?.rp ? user?.personal?.per_fname : user?.personal?.br_fname}
              </Text>
              <Text className="text-sm text-gray-500">{user?.phone}</Text>
              <Text className="text-sm text-gray-500" >{user?.email}</Text>
          </View>
        </View>
        <View className="flex-1 gap-3 mt-5">
          {menuItems.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between py-3"
              activeOpacity={1}
              onPress={() => item.route && router.push(item.route)}
            >
              <View className="flex-row items-center gap-2">
                <item.icon width={35} height={20}/>
                <Text className="text-[14px] text-gray-800">{item.name}</Text>
                {item.addIcon && <item.addIcon width={40} height={30}/>}
              </View>
              <ChevronRight className="text-primaryBlue"/>
            </TouchableOpacity>
          ))}
          
          <ConfirmationModal 
            trigger={
              <TouchableOpacity
                className="flex-row items-center justify-between"
                activeOpacity={1}
              >
                <View className="flex-row items-center gap-2 py-3">
                  <Logout width={35} height={20}/>
                  <Text className="text-[14px] text-gray-800">Sign Out</Text>
                </View>
                <ChevronRight className="text-primaryBlue"/>
              </TouchableOpacity>
            }     
            title="Confirmation"
            description="Are you sure you want to sign out?"    
            variant="destructive" 
            onPress={handleSignOut}
          />
          
        </View>
      </View>
    </PageLayout>
  );
};