// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   Image,
//   ScrollView,
//   ActivityIndicator
// } from 'react-native';
// import {
//   Plus,
//   Trash2,
//   Archive,
//   ArchiveRestore,
//   File,
//   X,
//   ChevronLeft
// } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { useGetTemplateRecord, type TemplateRecord } from './queries/template-FetchQueries';
// import { useArchiveTemplate } from './queries/template-DeleteQueries';
// import { useRestoreTemplate } from './queries/template-DeleteQueries';
// import { useDeleteTemplate } from './queries/template-DeleteQueries';


// function TemplateMainPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('active');
//   const [isDialogOpen, setIsDialogOpen] = useState(false); 
//   const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);

//   //Fetch mutations
//   const { data: templates = [], isLoading } = useGetTemplateRecord();

//   //Delete, archive, restore mutations
//   const { mutate: archiveTemplate, isPending: isArchiving } = useArchiveTemplate();
//   const { mutate: restoreTemplate, isPending: isRestoring } = useRestoreTemplate();
//   const { mutate: deletedTemplate, isPending: isDeleting } = useDeleteTemplate();


//   const handleArchiveTemplate = (temp_id: number, isArchive: boolean) => {
//     const archiveData = {
//       temp_id: temp_id,
//       temp_is_archive: isArchive,
//     };
//     archiveTemplate(archiveData);
//   };



//   const handleRestoreTemplate = (temp_id: number, isArchive: boolean) => {
//     const restoreData = {
//       temp_id: temp_id,
//       temp_is_archive: isArchive,
//     };
//     restoreTemplate(restoreData);
//   };


//  const handleDeleteTemplate = (temp_id: number) => {
//     deletedTemplate(temp_id)
//  }


//   const filteredTemplates = templates.filter(template => 
//     activeTab === 'active' ? !template.temp_is_archive : template.temp_is_archive
//   );

//   const renderTemplateCard = ({ item }: { item: TemplateRecord }) => (
//     <Card className="mb-4 border border-gray-200 relative w-[49%]">
//       {/* Clickable Area for Preview */}
//       <TouchableOpacity 
//         onPress={() => setPreviewTemplate(item)}
//       >
//         <View className="h-40 w-full flex items-center justify-center rounded overflow-hidden bg-white">
//           {/* Icon or Preview Placeholder */}
//           <View className="text-gray-400">
//             <File size={40} color="#9ca3af" />
//           </View>

//           {/* Bottom filename bar */}
//           <View className="absolute bottom-0 w-full bg-primaryBlue">
//             <Text className="text-white text-sm text-center py-2 px-2">
//               {item.temp_filename}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Action Buttons */}
//       <View className="absolute top-2 right-2 z-10">
//         {activeTab === 'active' ? (
//           <ConfirmationModal
//             trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Archive size={16} color="#dc2626" />
//                 </TouchableOpacity>
//             }
//             title="Archive Template"
//             description="Are you sure you want to archive this template?"
//             actionLabel="Archive"
//             onPress={() => handleArchiveTemplate(item.temp_id, true)}
//           />
//         ) : (
//           <View className="flex-row gap-1">
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                     <ArchiveRestore size={16} color="#15803d" />
//                 </TouchableOpacity>
//               }
//               title="Restore Template"
//               description="Are you sure you want to restore this template?"
//               actionLabel="Restore"
//               onPress={() => handleRestoreTemplate(item.temp_id, false)}
//             />
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Trash2 size={16} color="#dc2626" />
//                 </TouchableOpacity>
//               }
//               title="Delete Template"
//               description="Are you sure you want to delete this template?"
//               actionLabel="Delete"
//               onPress={() => handleDeleteTemplate(item.temp_id)}
//             />
//           </View>
//         )}
//       </View>
//     </Card>
//   );

//   return (
//     <_ScreenLayout
//       header={
//         <View className="pb-10">
//           <Text className="font-semibold text-[28px] text-darkBlue2">Document Templates</Text>
//           <Text className="text-[13px] text-gray-500">Manage and view document templates</Text>
//         </View>
//       }
//       headerAlign="left"
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       contentPadding="medium"
//       loading={isLoading || isArchiving || isRestoring}
//       loadingMessage={
//         isArchiving ? "Archiving template..." : 
//         isRestoring ? "Restoring template..." :
//         "Loading..."
//       }
//     >

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-8 flex-row justify-between">
//           <TabsTrigger 
//             value="active" 
//             className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="archive"
//             className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={16} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Templates */}
//         <TabsContent value="active">
//           {isLoading ? (
//             <ActivityIndicator size="large" color="#2a3a61" />
//           ) : (
//             <FlatList
//               data={filteredTemplates}
//               renderItem={renderTemplateCard}
//               keyExtractor={item => item.temp_id.toString()}
//               scrollEnabled={false}
//               numColumns={2}
//               columnWrapperStyle={{ justifyContent: 'space-between' }}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No active templates found
//                 </Text>
//               }
//             />
//           )}
//         </TabsContent>

//         {/* Archived Templates */}
//         <TabsContent value="archive">
//           {isLoading ? (
//             <ActivityIndicator size="large" color="#2a3a61" />
//           ) : (
//             <FlatList
//               data={filteredTemplates}
//               renderItem={renderTemplateCard}
//               keyExtractor={item => item.temp_id.toString()}
//               scrollEnabled={false}
//               numColumns={2}
//               columnWrapperStyle={{ justifyContent: 'space-between' }}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No archived templates found
//                 </Text>
//               }
//             />
//           )}
//         </TabsContent>
//       </Tabs>

//       {/* Create Template Modal */}
//       <Modal
//         visible={isDialogOpen}
//         animationType="slide"
//         onRequestClose={() => setIsDialogOpen(false)}
//       >
//         <View className="flex-1 p-4 bg-white">
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className="text-xl font-semibold">Create New Template</Text>
//             <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
//               <X size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <Text className="text-gray-600 mb-4">Add new certification template.</Text>
//           <ScrollView className="flex-1">
//             {/* <TemplateCreateForm onSuccess={() => setIsDialogOpen(false)} /> */}
//           </ScrollView>
//         </View>
//       </Modal>

//       {/* Preview/Update Template Modal */}
//       <Modal
//         visible={!!previewTemplate}
//         animationType="slide"
//         onRequestClose={() => setPreviewTemplate(null)}
//       >
//         {previewTemplate && (
//           <View className="flex-1 p-4 bg-white">
//             <View className="flex-row justify-between items-center mb-4">
//               <Text className="text-xl font-semibold">{previewTemplate.temp_filename}</Text>
//               <TouchableOpacity onPress={() => setPreviewTemplate(null)}>
//                 <X size={24} color="black" />
//               </TouchableOpacity>
//             </View>
//             <Text className="text-gray-600 mb-4">View and update document template.</Text>
//             <ScrollView className="flex-1">
//               {/* <TemplateUpdateForm
//                 temp_id={previewTemplate.temp_id}
//                 temp_header={previewTemplate.temp_header}
//                 temp_below_headerContent={previewTemplate.temp_below_headerContent}
//                 temp_title={previewTemplate.temp_title}
//                 temp_subtitle={previewTemplate.temp_subtitle}
//                 temp_paperSize={previewTemplate.temp_paperSize}
//                 temp_margin={previewTemplate.temp_margin}
//                 temp_filename={previewTemplate.temp_filename}
//                 temp_w_sign={previewTemplate.temp_w_sign}
//                 temp_w_seal={previewTemplate.temp_w_seal}
//                 temp_w_summon={previewTemplate.temp_w_summon}
//                 temp_body={previewTemplate.temp_body}
//                 onClose={() => setPreviewTemplate(null)}
//               /> */}
//             </ScrollView>
//           </View>
//         )}
//       </Modal>
//     </_ScreenLayout>
//   );
// }

// export default TemplateMainPage;







import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  Plus,
  Trash2,
  Archive,
  ArchiveRestore,
  File,
  X,
  ChevronLeft
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useGetTemplateRecord, type TemplateRecord } from './queries/template-FetchQueries';
import { useArchiveTemplate } from './queries/template-DeleteQueries';
import { useRestoreTemplate } from './queries/template-DeleteQueries';
import { useDeleteTemplate } from './queries/template-DeleteQueries';


function TemplateMainPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');

  //Fetch mutations
  const { data: templates = [], isLoading } = useGetTemplateRecord();

  console.log(templates)

  //Delete, archive, restore mutations
  const { mutate: archiveTemplate, isPending: isArchiving } = useArchiveTemplate();
  const { mutate: restoreTemplate, isPending: isRestoring } = useRestoreTemplate();
  const { mutate: deletedTemplate, isPending: isDeleting } = useDeleteTemplate();


  //Archive template
  const handleArchiveTemplate = (temp_id: number, isArchive: boolean) => {
    const archiveData = {
      temp_id: temp_id,
      temp_is_archive: isArchive,
    };
    archiveTemplate(archiveData);
  };

  //Restore Template
  const handleRestoreTemplate = (temp_id: number, isArchive: boolean) => {
    const restoreData = {
      temp_id: temp_id,
      temp_is_archive: isArchive,
    };
    restoreTemplate(restoreData);
  };

 //Delete Template
 const handleDeleteTemplate = (temp_id: number) => {
    deletedTemplate(temp_id)
 }

 const previewTemplate = (item: any) => {
  router.push({
    pathname: '/council/template/template-view-page',
    params: {
      headerImage: item.temp_header,
      belowHeaderContent: item.temp_below_headerContent,
      title: item.temp_title,
      subtitle: item.temp_subtitle,
      withSignature: item.temp_w_sign,
      withSeal: item.temp_w_seal,
      withSummon: item.temp_w_summon,
      paperSize: item.temp_paperSize,
      margin: item.temp_margin,
      body: item.temp_body    
    }
  });   
 }


  const filteredTemplates = templates.filter(template => 
    activeTab === 'active' ? !template.temp_is_archive : template.temp_is_archive
  );

  const renderTemplateCard = ({ item }: { item: TemplateRecord }) => (
    <Card className="mb-4 border border-gray-200 relative w-[49%]">
      {/* Clickable Area for Preview */}
      <TouchableOpacity 
        onPress={() => previewTemplate(item)}
      >
        <View className="h-40 w-full flex items-center justify-center rounded-md overflow-hidden bg-white">
          {/* Icon or Preview Placeholder */}
          <View className="text-gray-400">
            <File size={40} color="#9ca3af" />
          </View>

          {/* Bottom filename bar */}
          <View className="absolute bottom-0 w-full bg-primaryBlue">
            <Text className="text-white text-sm text-center py-2 px-2">
              {item.temp_filename}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="absolute top-2 right-2 z-10">
        {activeTab === 'active' ? (
          <ConfirmationModal
            trigger={
                <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Archive size={16} color="#dc2626" />
                </TouchableOpacity>
            }
            title="Archive Template"
            description="Are you sure you want to archive this template?"
            actionLabel="Archive"
            onPress={() => handleArchiveTemplate(item.temp_id, true)}
          />
        ) : (
          <View className="flex-row gap-1">
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
                    <ArchiveRestore size={16} color="#15803d" />
                </TouchableOpacity>
              }
              title="Restore Template"
              description="Are you sure you want to restore this template?"
              actionLabel="Restore"
              onPress={() => handleRestoreTemplate(item.temp_id, false)}
            />
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              }
              title="Delete Template"
              description="Are you sure you want to delete this template?"
              actionLabel="Delete"
              onPress={() => handleDeleteTemplate(item.temp_id)}
            />
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <_ScreenLayout
      header={
        <View className="pb-10">
          <Text className="font-semibold text-[28px] text-darkBlue2">Document Templates</Text>
          <Text className="text-[13px] text-gray-500">Manage and view document templates</Text>
        </View>
      }
      headerAlign="left"
      showBackButton={true}
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      scrollable={true}
      contentPadding="medium"
      loading={isLoading || isArchiving || isRestoring}
      loadingMessage={
        isArchiving ? "Archiving template..." : 
        isRestoring ? "Restoring template..." :
        "Loading..."
      }
    >

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-blue-50 mb-8 flex-row justify-between">
          <TabsTrigger 
            value="active" 
            className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
          >
            <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
              Active
            </Text>
          </TabsTrigger>
          <TabsTrigger 
            value="archive"
            className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
          >
            <View className="flex-row items-center justify-center">
              <Archive 
                size={16} 
                className="mr-1" 
                color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
              />
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                Archive
              </Text>
            </View>
          </TabsTrigger>
        </TabsList>

        {/* Active Templates */}
        <TabsContent value="active">
          {isLoading ? (
            <ActivityIndicator size="large" color="#2a3a61" />
          ) : (
            <FlatList
              data={filteredTemplates}
              renderItem={renderTemplateCard}
              keyExtractor={item => item.temp_id.toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">
                  No active templates found
                </Text>
              }
            />
          )}
        </TabsContent>

        {/* Archived Templates */}
        <TabsContent value="archive">
          {isLoading ? (
            <ActivityIndicator size="large" color="#2a3a61" />
          ) : (
            <FlatList
              data={filteredTemplates}
              renderItem={renderTemplateCard}
              keyExtractor={item => item.temp_id.toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 py-4">
                  No archived templates found
                </Text>
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </_ScreenLayout>
  );
}

export default TemplateMainPage;