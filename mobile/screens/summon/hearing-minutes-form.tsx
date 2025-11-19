// import '@/global.css';
// import React from 'react';
// import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// import { Button } from '@/components/ui/button';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { ChevronLeft } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
// import { LoadingModal } from '@/components/ui/loading-modal';
// import { useAddHearingMinutes } from './queries/summonInsertQueries';
// import { useState } from 'react';
// import { useLocalSearchParams } from 'expo-router';

// export default function HearingMinutesForm() {
//   const router = useRouter();
//   const params = useLocalSearchParams()
//   const {hs_id, sc_id, status_type} = params
//   const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>([]);
//   const [fileError, setFileError] = useState<string | null>(null);
//   const { mutate: addMinutes, isPending} = useAddHearingMinutes()

//   const handleSubmit = () => {
//     if (selectedDocuments.length === 0) {
//       setFileError('Please select a document');
//       return;
//     }

//     const file = selectedDocuments.map((media) => ({
//         name: media.name,
//         type: media.type,
//         file: media.file
//     }))

//     addMinutes({hs_id: String(hs_id), sc_id: String(sc_id), status_type: String(status_type), file});
//   };

//   return (
//     <_ScreenLayout
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={30} className="text-black" />
//         </TouchableOpacity>
//       }
//       headerBetweenAction={<Text className="text-[13px]">Hearing Minutes Form</Text>}
//     >
//       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//         <View className="mb-8 p-6">
//           <View className="space-y-4">
          
//             <View className="pt-5">
//                 <Text className="text-[13px] font-PoppinsRegular pb-3">Add Hearing Minutes File</Text>
//                 <DocumentPickerComponent
//                     selectedDocuments={selectedDocuments}
//                     setSelectedDocuments={setSelectedDocuments}
//                     multiple={false} 
//                     maxDocuments={1} 
//                 />
//                 {fileError && (
//                     <Text className="text-red-500 text-xs font-semibold">
//                         {fileError}
//                     </Text>
//                 )}
//             </View>

//             <View className="pt-4 pb-8 bg-white border-t border-gray-100">
//               <Button
//                 onPress={handleSubmit}
//                 className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
//               >
//                 <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
//               </Button>
//             </View>
//           </View>
//         </View>
        
//         <LoadingModal visible={isPending} />
//       </ScrollView>
//     </_ScreenLayout>
//   );
// }

import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import PageLayout from '@/screens/_PageLayout';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useAddHearingMinutes } from './queries/summonInsertQueries';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function HearingMinutesForm() {
  const router = useRouter();
  const params = useLocalSearchParams()
  const {hs_id, sc_id, status_type} = params
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const { mutate: addMinutes, isPending} = useAddHearingMinutes()

  const handleSubmit = () => {
    if (selectedDocuments.length === 0) {
      setFileError('Please select a document');
      return;
    }

    const file = selectedDocuments.map((media) => ({
        name: media.name,
        type: media.type,
        file: media.file
    }))

    addMinutes({hs_id: String(hs_id), sc_id: String(sc_id), status_type: String(status_type), file});
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Hearing Minutes Form</Text>}
      wrapScroll={false}
      footer={
        <View className="p-6 bg-white border-t border-gray-200">
          <Button
            onPress={handleSubmit}
            className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
          >
            <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
          </Button>
        </View>
      }
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <View className="space-y-4">
            <View className="pt-5">
              <Text className="text-[13px] font-PoppinsRegular pb-3">Add Hearing Minutes File</Text>
              <DocumentPickerComponent
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                multiple={false} 
                maxDocuments={1} 
              />
              {fileError && (
                <Text className="text-red-500 text-xs font-semibold">
                  {fileError}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <LoadingModal visible={isPending} />
      </View>
    </PageLayout>
  );
}