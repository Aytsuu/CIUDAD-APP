// import "@/global.css";
// import React from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { DocumentPickerAsset, getDocumentAsync } from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
// import { Ionicons } from '@expo/vector-icons';
// import { supabase } from "@/lib/supabase";
// import { ChevronLeft } from 'lucide-react-native';

// // React Native compatible UUID generator
// const uuidv4 = () => {
//   if (typeof globalThis.crypto?.randomUUID === 'function') {
//     return globalThis.crypto.randomUUID();
//   }
//   // Fallback for older React Native versions
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     const r = Math.random() * 16 | 0;
//     const v = c === 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// };

// export type DocumentFileType = {
//   id: string;
//   uri: string;
//   name: string;
//   type: string;
//   size: number;
//   path: string;
//   publicUrl?: string;
//   status: 'uploading' | 'uploaded' | 'error';
// };

// export default function DocumentUploader({
//   mediaFiles,
//   setMediaFiles,
//   maxFiles = 5,
//   hideRemoveButton = false,
//   editable = true,
//   allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
// }: {
//   mediaFiles: DocumentFileType[];
//   setMediaFiles: React.Dispatch<React.SetStateAction<DocumentFileType[]>>;
//   maxFiles?: number;
//   hideRemoveButton?: boolean;
//   editable?: boolean;
//   allowedTypes?: string[];
// }) {
//   const [isLoading, setIsLoading] = React.useState(false);

//   const pickDocument = async () => {
//     if (!editable) return;
    
//     if (mediaFiles.length >= maxFiles) {
//       alert(`You can only upload up to ${maxFiles} files`);
//       return;
//     }

//     try {
//       const result = await getDocumentAsync({
//         type: allowedTypes,
//         copyToCacheDirectory: true,
//       });

//       if (result.assets && result.assets.length > 0) {
//         await handleDocumentSelection(result.assets[0]);
//       }
//     } catch (error) {
//       console.error('Error picking document:', error);
//       alert('Failed to pick document');
//     }
//   };

//   const handleDocumentSelection = async (document: DocumentPickerAsset) => {
//     const fileInfo = await FileSystem.getInfoAsync(document.uri);
//     if (!fileInfo.exists) {
//       alert('File does not exist');
//       return;
//     }

//     const fileExtension = document.name?.split('.').pop() || 'file';
//     const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
//     const fileName = `${uniqueSuffix}.${fileExtension}`;
    
//     const newDocument: DocumentFileType = {
//       id: uuidv4(),
//       uri: document.uri,
//       name: fileName,
//       type: document.mimeType || 'application/octet-stream',
//       size: fileInfo.size || 0,
//       path: `documents/${fileName}`,
//       status: 'uploading'
//     };

//     // Add to state immediately
//     setMediaFiles(prev => [...prev, newDocument]);
    
//     try {
//       setIsLoading(true);
      
//       // Read the file content
//       const fileContent = await FileSystem.readAsStringAsync(document.uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       // Convert base64 to Uint8Array
//       const arrayBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));

//       // Upload to Supabase (⬅️ BUCKET UPDATED HERE)
//       const { error } = await supabase.storage
//         .from("image-bucket")
//         .upload(newDocument.path, arrayBuffer, {
//           contentType: newDocument.type,
//           upsert: false,
//         });

//       if (error) throw error;

//       // Get public URL (⬅️ BUCKET UPDATED HERE)
//       const { data: { publicUrl } } = supabase.storage
//         .from("image-bucket")
//         .getPublicUrl(newDocument.path);

//       // Update state with public URL
//       setMediaFiles(prev => 
//         prev.map(file => 
//           file.id === newDocument.id 
//             ? { ...file, publicUrl, status: 'uploaded' } 
//             : file
//         )
//       );
//     } catch (error) {
//       console.error('Upload failed:', error);
//       setMediaFiles(prev => 
//         prev.map(file => 
//           file.id === newDocument.id 
//             ? { ...file, status: 'error' } 
//             : file
//         )
//       );
//       alert('Failed to upload document');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const removeDocument = async (id: string) => {
//     if (!editable) return;
    
//     const fileToRemove = mediaFiles.find(file => file.id === id);
//     if (!fileToRemove) return;

//     try {
//       // Remove from Supabase if it was uploaded (⬅️ BUCKET UPDATED HERE)
//       if (fileToRemove.path && fileToRemove.status === 'uploaded') {
//         await supabase.storage
//           .from("image-bucket")
//           .remove([fileToRemove.path]);
//       }
      
//       // Remove from local state
//       setMediaFiles(prev => prev.filter(file => file.id !== id));
//     } catch (error) {
//       console.error('Failed to delete file:', error);
//       alert('Failed to remove document');
//     }
//   };

//   const getFileIcon = (type: string) => {
//     if (type.includes('pdf')) return 'document-text';
//     if (type.includes('word') || type.includes('msword')) return 'document-text';
//     return 'document';
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   return (
//     <View className="flex-1">
//       {/* Selected documents list */}
//       <View className="mb-4">
//         {mediaFiles.map((file) => (
//           <View key={file.id} className="flex-row items-center p-3 mb-2 bg-gray-100 rounded-md">
//             <Ionicons 
//               name={getFileIcon(file.type)} 
//               size={24} 
//               color="#3b82f6" 
//               className="mr-3"
//             />
            
//             <View className="flex-1">
//               <Text className="text-sm font-medium" numberOfLines={1}>{file.name}</Text>
//               <Text className="text-xs text-gray-500">
//                 {formatFileSize(file.size)} • {file.type.split('/').pop()?.toUpperCase()}
//               </Text>
              
//               {/* Upload status */}
//               {file.status !== 'uploaded' && (
//                 <View className="flex-row items-center mt-1">
//                   {file.status === 'uploading' ? (
//                     <>
//                       <ActivityIndicator size="small" color="#3b82f6" />
//                       <Text className="text-xs text-blue-500 ml-1">Uploading...</Text>
//                     </>
//                   ) : (
//                     <>
//                       <Ionicons name="warning" size={14} color="#ef4444" />
//                       <Text className="text-xs text-red-500 ml-1">Upload failed</Text>
//                     </>
//                   )}
//                 </View>
//               )}
//             </View>
            
//             {/* Remove button */}
//             {!hideRemoveButton && editable && (
//               <TouchableOpacity
//                 onPress={() => removeDocument(file.id)}
//                 className="ml-2"
//               >
//                 <Ionicons name="close" size={20} color="#ef4444" />
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}
//       </View>

//       {/* Add document button */}
//       {editable && mediaFiles.length < maxFiles && (
//         <TouchableOpacity
//           className="flex-row items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-md"
//           onPress={pickDocument}
//           disabled={isLoading}
//         >
//           <Ionicons name="add" size={20} color="#6b7280" className="mr-2" />
//           <Text className="text-gray-600">
//             {isLoading ? 'Processing...' : 'Add Document'}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }





import React from "react"
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import { Ionicons } from "@expo/vector-icons"
import { getMimeType } from "@/helpers/fileHandling" // Keep this if you want to detect MIME type

export interface DocumentItem {
  uri: string
  id: string
  name?: string
  type?: string
  file?: string // base64
}

interface DocumentPickerProps {
  selectedDocuments: DocumentItem[]
  setSelectedDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>
  multiple?: boolean
  maxDocuments?: number
}

export default function DocumentPickerComponent({
  selectedDocuments,
  setSelectedDocuments,
  multiple = false,
  maxDocuments = 5,
}: DocumentPickerProps) {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple,
      })

      if (result.assets && result.assets.length > 0) {
        const docs = result.assets

        const processedDocs = await Promise.all(
          docs.map(async (doc) => {
            try {
              const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
                encoding: FileSystem.EncodingType.Base64,
              })

              const mimeType = doc.mimeType || (await getMimeType(doc.uri)) || "application/octet-stream"

              return {
                uri: doc.uri,
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: doc.name,
                type: mimeType,
                file: base64Data,
              }
            } catch (err) {
              console.error("Error processing document:", err)
              return null
            }
          })
        )

        const validDocs = processedDocs.filter((d) => d !== null) as DocumentItem[]

        if (multiple) {
          setSelectedDocuments((prev) => {
            const merged = [...prev, ...validDocs]
            return merged.slice(0, maxDocuments)
          })
        } else {
          setSelectedDocuments(validDocs.slice(0, 1))
        }
      }
    } catch (error) {
      console.error("Document picking error:", error)
      Alert.alert("Error", "Failed to pick document.")
    }
  }

  const removeDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const removeAllDocuments = () => {
    setSelectedDocuments([])
    console.log("All documents cleared")
  }

  const canSelectMore = multiple && selectedDocuments.length < maxDocuments

  return (
    <View className="flex-1">
      {selectedDocuments.length > 0 ? (
        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View>
              {selectedDocuments.map((doc, index) => (
                <View
                  key={doc.id}
                  className="flex-row items-center justify-between bg-gray-100 p-3 mb-2 rounded-lg"
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="document-text" size={20} color="#666" />
                    <Text className="ml-2 flex-1 text-gray-800" numberOfLines={1}>
                      {doc.name || `document_${index + 1}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-red-500 rounded-full w-6 h-6 justify-center items-center ml-2"
                    onPress={() => removeDocument(index)}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <TouchableOpacity
          className="w-full h-[120px] bg-[#f0f2f5] justify-center items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
          onPress={pickDocument}
        >
          <View className="items-center">
            <Ionicons name="add" size={28} color="#1778F2" />
            <Text className="text-[#1778F2] text-[12px] mt-2 font-medium">
              {multiple ? "Add Documents" : "Add Document"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {multiple && selectedDocuments.length > 1 && (
        <TouchableOpacity
          className="mt-2 p-2 bg-red-500 rounded-lg justify-center items-center"
          onPress={removeAllDocuments}
        >
          <Text className="text-white font-medium">Clear All ({selectedDocuments.length})</Text>
        </TouchableOpacity>
      )}

      {multiple && selectedDocuments.length > 0 && canSelectMore && (
        <TouchableOpacity
          className="mt-2 p-3 bg-[#1778F2] rounded-lg justify-center items-center"
          onPress={pickDocument}
        >
          <Text className="text-white font-medium">
            Add More Documents ({selectedDocuments.length}/{maxDocuments})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
