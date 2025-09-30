// // MultipleFiles/home.tsx
// import React from "react";
// import { View, Image, ScrollView, StatusBar, TouchableOpacity, Dimensions } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Button } from "@/components/ui/button";
// import { Text } from "@/components/ui/text";
// import { router } from "expo-router";
// import { Archive, Baby, Calendar, Dog, Heart, Pill, Stethoscope, UserCircle, Users, ShieldPlus, BookHeart, ChevronRight, Bell, Search, UserRoundPlus } from "lucide-react-native";
// import TodayScheduleWidget from "./admin/admin-scheduler/schedule-today";
// import { usePendingAppointments } from "./my-schedules/pendingAppointment";
// import NotificationBadge from "./my-schedules/notifbadge";

// const { width } = Dimensions.get('window');

// const Homepage = () => {
//   // Get pending appointments count
//   // const { pendingCount, isLoading: isLoadingPending } = usePendingAppointments();

//   const modules = [
//     { name: 'Child Health Records', route: 'admin/childhealth/overall', icon: Baby },
//     { name: 'Family Planning', route: 'admin/familyplanning/overall', icon: Heart },
//     { name: 'Animal Bites', route: 'admin/animalbites/overall', icon: Dog },
//     { name: 'Maternal Records', route: '/my-records/my-med-records', icon: UserCircle },
//     { name: 'Medical Consultation', route: '(health)/medicine-request/my-requests', icon: Stethoscope },
//     { name: 'Profiling', route: 'admin/medicinerequest/medicinerequest', icon: UserRoundPlus },
//     { name: 'Patients Records', route: '/admin/patientrecords/patientrecords', icon: Users },
//     { name: 'Schedules', route: 'admin/schedules/all-appointment', icon: Calendar },
//     { name: 'Inventory', route: 'admin/inventory/medicine', icon: Archive },
//     // { name: 'Transactions', route: 'admin/inventory/transaction', icon: Archive },
//   ];

//   const quickActions = [
//     { title: 'Request Medicine', route: '/medicine-request/med-request', icon: Pill, color: '#1E40AF', bgColor: '#1e40af' },
//     { title: 'My Records', route: '/my-records/all-records', icon: UserCircle, color: '#15803d', bgColor: '#15803d' },
//   ];

//   const featuredServices = [
//     {
//       title: 'Family Planning',
//       subtitle: 'Your Family, Your Future. Plan it right.',
//       route: '/family-planning/famplanning',
//       icon: Heart,
//       color: '#059669',
//       bgColor: '#ECFDF5',
//       image: require('@/assets/images/Health/Home/Famplanning.jpg')
//     },
//     {
//       title: 'Animal Bites',
//       subtitle: 'First aid & Prevention.',
//       route: '/animalbite/animalbite',
//       icon: Dog,
//       color: '#1E40AF',
//       bgColor: '#EFF6FF',
//       image: require('@/assets/images/Health/Home/animalbites.jpg')
//     },
//   ];
//   const handleViewWeeklySchedule = () => {
//     router.push("/admin/scheduler/schedule-weekly")
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

//       {/* Original Header */}
//       <View className="flex-row items-center justify-between bg-blue-800 px-5 pr-0">
//         <View className="flex-1 pr-4 ml-2">
//           <Text className="text-white text-5xl font-PoppinsSemiBold">Welcome</Text>
//           <Text className="text-white text-base mt-1">How can we help you today?</Text>
//         </View>
//         <Image
//           source={require('@/assets/images/Health/Home/young_doctor_man.png')}
//           className="h-40 w-40"
//           resizeMode="cover"
//         />
//       </View>

//       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//         {/* Today's Schedule Widget */}
//         <View className="px-6 mt-5 mb-3">
//           <TodayScheduleWidget />
//         </View>

//         <View className="mt-3">
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: 15 }}
//           >
//             <View className="px-2  mb-4">
              
//               <View className="flex-row gap-4 ">
//                 <TouchableOpacity
//                   onPress={() => router.push("/family-planning/famplanning")}
//                   className="w-64 transform transition-transform duration-200 active:scale-95"
//                 >
//                   <View className="bg-white rounded-2xl shadow-md overflow-hidden">
//                     <View className="h-36 relative">
//                       <Image
//                         source={require('@/assets/images/Health/Home/Famplanning.jpg')}
//                         className="w-full h-full"
//                         resizeMode="cover"
//                       />
//                       <View className="absolute inset-0 bg-black/50" />
//                       <View className="absolute bottom-4 left-4 right-4">
//                         <Text className="text-white text-lg font-PoppinsSemiBold">{featuredServices[0].title}</Text>
//                         <Text className="text-white/90 text-xs font-PoppinsRegular mt-1">{featuredServices[0].subtitle}</Text>
//                       </View>
//                     </View>
//                     <View className="p-4 flex-row items-center justify-between">
//                       <Heart size={20} color="#059669" />
//                       <TouchableOpacity className="bg-green-700 px-4 py-1.5 rounded-full"  onPress={() => router.push("/family-planning/famplanning")}>
//                         <Text className="text-white text-xs font-PoppinsSemiBold">Learn More</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={() => router.push('/animalbite/animalbite')}
//                   className="w-64 transform transition-transform duration-200 active:scale-95"
//                 >
//                   <View className="bg-white rounded-2xl shadow-md overflow-hidden">
//                     <View className="h-36 relative">
//                       <Image
//                         source={require('@/assets/images/Health/Home/animalbites.jpg')}
//                         className="w-full h-full"
//                         resizeMode="cover"
//                       />
//                       <View className="absolute inset-0 bg-black/50" />
//                       <View className="absolute bottom-4 left-4 right-4">
//                         <Text className="text-white text-lg font-PoppinsSemiBold">{featuredServices[1].title}</Text>
//                         <Text className="text-white/90 text-xs font-PoppinsRegular mt-1">{featuredServices[1].subtitle}</Text>
//                       </View>
//                     </View>
//                     <View className="p-4 flex-row items-center justify-between">
//                       <Dog size={20} color="#1E40AF" />
//                       <TouchableOpacity className="bg-green-700 px-4 py-1.5 rounded-full"  onPress={() => router.push('/animalbite/animalbite')}>
//                         <Text className="text-white text-xs font-PoppinsSemiBold">Learn More</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </View>

//         <View className="px-6 mb-8">
//           <Text className="text-gray-800 text-xl mt-4 font-PoppinsSemiBold mb-4">Quick Actions</Text>
//           <View className="flex-row gap-4">
//             {quickActions.map((action, index) => {
//               const Icon = action.icon;
//               return (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => router.push(action.route as any)}
//                   className="flex-1"
//                 >
//                   <View
//                     className="p-4 rounded-2xl shadow-lg relative"
//                     style={{ backgroundColor: action.color }}
//                   >
//                     <Icon size={32} color="white" />
//                     <Text className="text-white font-PoppinsSemiBold text-md mt-3">
//                       {action.title}
//                     </Text>
//                     <View className="absolute top-4 right-4">
//                       <ChevronRight size={20} color="white" />
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>

//         <View className="px-6 mb-8">
//           <View className="flex-row justify-between items-center mb-2">
//             <Text className="text-gray-800 text-xl font-PoppinsSemiBold">Book appointment</Text>
//             <TouchableOpacity 
//               className="bg-blue-700 p-1 rounded-xl relative" 
//               onPress={() => router.push("/my-schedules/my-schedules")}
//             >
//               <Text className="text-white text-sm p-2 font-PoppinsSemiBold">My appointments</Text>
//               {/* Notification Badge */}
//               {/* <NotificationBadge 
//                 count={pendingCount} 
//                 showBadge={!isLoadingPending && pendingCount > 0} 
//               /> */}
//             </TouchableOpacity>
//           </View>
//           <View className="flex-row mt-3 gap-4">
//             <TouchableOpacity
//               onPress={() => router.push("/maternal/maternal-landing")}
//               className="flex-1"
//             >
//               <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
//                 <View className="h-32 relative">
//                   <Image
//                     source={require('@/assets/images/Health/Home/Maternal.jpg')}
//                     className="w-full h-full"
//                     resizeMode="cover"
//                   />
//                   <View className="absolute inset-0 bg-black/40" />
//                   <View className="absolute top-3 left-3">
//                     <BookHeart size={32} color="white" />
//                   </View>
//                 </View>
//                 <View className="p-3">
//                   <Text className="text-gray-900 text-md font-PoppinsSemiBold mb-1">Maternal Services</Text>
//                 </View>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => router.push("/medconsultation/med-landing")}
//               className="flex-1"
//             >
//               <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
//                 <View className="h-32 relative">
//                   <Image
//                     source={require('@/assets/images/Health/Home/medicalconsultation.jpg')}
//                     className="w-full h-full"
//                     resizeMode="cover"
//                   />
//                    <View className="absolute inset-0 bg-black/40" />
                  
//                   <View className="absolute top-3 left-3">
//                     <ShieldPlus size={32} color="white" />
//                   </View>
//                 </View>
//                 <View className="p-3">
//                   <Text className="text-gray-900 text-md font-PoppinsSemiBold mb-1">Medical Consultation</Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View className="px-5 mt-4 mb-6">
//           <Text className="text-gray-800 text-xl font-PoppinsSemiBold mb-5">Manage</Text>
//           <View className="flex-row flex-wrap justify-between">
//             {modules.map((module, index) => {
//               const Icon = module.icon;
//               return (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => router.push(module.route as any)}
//                   className="w-[30%] bg-blue-900 p-3 rounded-2xl mb-4 items-center"
//                 >
//                   <Icon size={43} color="white" />
//                   <Text className="text-white font-PoppinsRegular text-center mt-3 text-sm leading-4">
//                     {module.name}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Homepage;