// import React from 'react';
// import { useLocalSearchParams, router } from 'expo-router';
// import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const PreviewScreen = () => {
//   const {
//     headerImage,
//     belowHeaderContent,
//     title,
//     subtitle,
//     body,
//     withSignature,
//     withSeal,
//     withSummon,
//     paperSize,
//     margin,
//   } = useLocalSearchParams();

//   // Determine margin class based on margin param
//   const marginClass = margin === 'narrow' ? 'px-4' : 'px-6';

//   return (
//     <View className="flex-1 bg-white">
//       {/* Header with back button */}
//       <View className="flex-row justify-end items-center pt-9">
//         <TouchableOpacity 
//           onPress={() => router.back()}
//           className="p-2"
//         >
//           <Ionicons name="close" size={20} color="gray" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView className={`flex-1 ${marginClass} pt-4 pb-10`}>
//         {/* Header image */}
//         {headerImage !== 'no-image-url-fetched' && (
//           <Image 
//             source={{ uri: headerImage as string }} 
//             className="w-full h-32 rounded mb-4" 
//             resizeMode="contain" 
//           />
//         )}

//         {/* Below Header Content */}
//         {!!belowHeaderContent && (
//           <Text className="text-[10px] text-justify mb-3">
//             {belowHeaderContent}
//           </Text>
//         )}

//         {/* Title */}
//         <Text className="text-center text-lg font-bold mb-1">{title}</Text>

//         {/* Subtitle */}
//         {!!subtitle && (
//           <Text className="text-center text-[9px] text-gray-600 mb-6">
//             {subtitle}
//           </Text>
//         )}

//         {/* Body */}
//         <Text className="text-[10px] text-justify leading-6">{body}</Text>

//         {/* Footer */}
//         <View className="mt-10 space-y-2">
//           {withSummon === 'true' ? (
//             <>
//               {/* Summon signature fields */}
//               <View className="flex-row justify-between">
//                 <Text className="text-[10px]">COMPLAINANT ____________________</Text>
//                 <Text className="text-[10px]">RESPONDENT ____________________</Text>
//               </View>
//               <View className="items-end">
//                 <Text className="text-[10px]">SERVER ____________________</Text>
//               </View>
              
//               {/* Barangay captain info - right aligned */}
//               <View className="items-end mt-6">
//                 <Text className="text-[10px] font-bold">HON. VIRGINIA N. ABENOJA</Text>
//                 <Text className="text-[10px]">Punong Barangay</Text>
//               </View>
//             </>
//           ) : withSignature === 'true' && (
//             <>
//               {/* Regular signature fields */}
//               <Text className="text-[10px]">Name and signature of Applicant</Text>
//               <Text className="text-[10px]">Certified true and correct:</Text>
              
//               {/* Barangay captain info */}
//               <View className="mt-5">
//                 <Text className="text-[10px] font-bold">HON. VIRGINIA N. ABENOJA</Text>
//                 <Text className="text-[10px]">Punong Barangay, San Roque Ciudad</Text>
//               </View>
//             </>
//           )}

//           {/* Seal image and notice */}
//           {withSeal === 'true' && (
//             <View className="items-center mt-6">
//               <Image 
//                 source={require('@/assets/images/Seal.png')} 
//                 className="w-20 h-20"
//                 resizeMode="contain"
//               />
//               <Text className="text-red-500 text-[10px] font-bold mt-2">
//                 NOT VALID WITHOUT SEAL
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default PreviewScreen;







import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PreviewScreen = () => {
  const {
    headerImage,
    belowHeaderContent,
    title,
    subtitle,
    body,
    withSignature,
    withSeal,
    withSummon,
    paperSize,
    margin,
  } = useLocalSearchParams();

  // Determine margin class based on margin param
  const marginClass = margin === 'narrow' ? 'px-6' : 'px-6';

  return (
    <View className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row justify-end items-center pt-9">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="close" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView className={`flex-1 ${marginClass} pt-4 pb-10`}>
        {/* Header image */}
        {headerImage !== 'no-image-url-fetched' && (
          <Image 
            source={{ uri: headerImage as string }} 
            className="w-full h-32 rounded mb-4" 
            resizeMode="contain" 
          />
        )}

        {/* Below Header Content */}
        {!!belowHeaderContent && (
          <Text className="text-[10px] text-justify mb-3">
            {belowHeaderContent}
          </Text>
        )}

        {/* Title */}
        <Text className="text-center text-lg font-bold mb-1">{title}</Text>

        {/* Subtitle */}
        {!!subtitle && (
          <Text className="text-center text-[9px] text-gray-600 mb-6">
            {subtitle}
          </Text>
        )}

        {/* Body */}
        <Text className="text-[10px] text-justify leading-6">{body}</Text>

        {/* Footer */}
        <View className="mt-10 space-y-2">
          {withSummon === 'true' ? (
            <>
              {/* Summon signature fields */}
              <View className="flex-row justify-between">
                <Text className="text-[10px]">COMPLAINANT ____________________</Text>
                <Text className="text-[10px]">RESPONDENT ____________________</Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px]">SERVER ____________________</Text>
              </View>
              
              {/* Barangay captain info - right aligned */}
              <View className="items-end mt-6">
                <Text className="text-[10px] font-bold">HON. VIRGINIA N. ABENOJA</Text>
                <Text className="text-[10px]">Punong Barangay</Text>
              </View>
            </>
          ) : withSignature === 'true' && (
            <View className="flex-row justify-between items-end">
              {/* Left side - Signature fields */}
              <View className="flex-1">
                <Text className="text-[10px]">Name and signature of Applicant</Text>
                <Text className="text-[10px]">Certified true and correct:</Text>
                
                {/* Barangay captain info */}
                <View className="mt-5">
                  <Text className="text-[10px] font-bold">HON. VIRGINIA N. ABENOJA</Text>
                  <Text className="text-[10px]">Punong Barangay, San Roque Ciudad</Text>
                </View>
              </View>
              
              {/* Right side - Seal */}
              {withSeal === 'true' && (
                <View className="items-end">
                  <Image 
                    source={require('@/assets/images/Seal.png')} 
                    className="w-20 h-20"
                    resizeMode="contain"
                  />
                  <Text className="text-red-500 text-[10px] font-bold mt-2">
                    NOT VALID WITHOUT SEAL
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Seal for non-signature cases */}
          {withSeal === 'true' && withSignature !== 'true' && withSummon !== 'true' && (
            <View className="items-center mt-6">
              <Image 
                source={require('@/assets/images/Seal.png')} 
                className="w-20 h-20"
                resizeMode="contain"
              />
              <Text className="text-red-500 text-[10px] font-bold mt-2">
                NOT VALID WITHOUT SEAL
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PreviewScreen;




