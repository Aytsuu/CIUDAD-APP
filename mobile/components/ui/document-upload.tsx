// import React from "react"
// import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
// import * as DocumentPicker from "expo-document-picker"
// import * as FileSystem from "expo-file-system"
// import { Ionicons } from "@expo/vector-icons"
// import { getMimeType } from "@/helpers/fileHandling" // Keep this if you want to detect MIME type

// export interface DocumentItem {
//   uri: string
//   id: string
//   name?: string
//   type?: string
//   file?: string // base64
// }

// interface DocumentPickerProps {
//   selectedDocuments: DocumentItem[]
//   setSelectedDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>
//   multiple?: boolean
//   maxDocuments?: number
// }

// export default function DocumentPickerComponent({
//   selectedDocuments,
//   setSelectedDocuments,
//   multiple = false,
//   maxDocuments = 5,
// }: DocumentPickerProps) {
//   const pickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: [
//           "application/pdf",
//           "application/msword",
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         ],
//         copyToCacheDirectory: true,
//         multiple,
//       })

//       if (result.assets && result.assets.length > 0) {
//         const docs = result.assets

//         const processedDocs = await Promise.all(
//           docs.map(async (doc) => {
//             try {
//               const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
//                 encoding: FileSystem.EncodingType.Base64,
//               })

//               const mimeType = doc.mimeType || (await getMimeType(doc.uri)) || "application/octet-stream"

//               return {
//                 uri: doc.uri,
//                 id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
//                 name: doc.name,
//                 type: mimeType,
//                 file: base64Data,
//               }
//             } catch (err) {
//               console.error("Error processing document:", err)
//               return null
//             }
//           })
//         )

//         const validDocs = processedDocs.filter((d) => d !== null) as DocumentItem[]

//         if (multiple) {
//           setSelectedDocuments((prev) => {
//             const merged = [...prev, ...validDocs]
//             return merged.slice(0, maxDocuments)
//           })
//         } else {
//           setSelectedDocuments(validDocs.slice(0, 1))
//         }
//       }
//     } catch (error) {
//       console.error("Document picking error:", error)
//       Alert.alert("Error", "Failed to pick document.")
//     }
//   }

//   const removeDocument = (index: number) => {
//     setSelectedDocuments((prev) => prev.filter((_, i) => i !== index))
//   }

//   const removeAllDocuments = () => {
//     setSelectedDocuments([])
//     console.log("All documents cleared")
//   }

//   const canSelectMore = multiple && selectedDocuments.length < maxDocuments

//   return (
//     <View className="flex-1">
//       {selectedDocuments.length > 0 ? (
//         <View className="flex-1">
//           <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
//             <View>
//               {selectedDocuments.map((doc, index) => (
//                 <View
//                   key={doc.id}
//                   className="flex-row items-center justify-between bg-gray-100 p-3 mb-2 rounded-lg"
//                 >
//                   <View className="flex-row items-center flex-1">
//                     <Ionicons name="document-text" size={20} color="#666" />
//                     <Text className="ml-2 flex-1 text-gray-800" numberOfLines={1}>
//                       {doc.name || `document_${index + 1}`}
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     className="bg-red-500 rounded-full w-6 h-6 justify-center items-center ml-2"
//                     onPress={() => removeDocument(index)}
//                   >
//                     <Ionicons name="close" size={14} color="white" />
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         </View>
//       ) : (
//         <TouchableOpacity
//           className="w-full h-[120px] bg-[#f0f2f5] justify-center items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
//           onPress={pickDocument}
//         >
//           <View className="items-center">
//             <Ionicons name="add" size={28} color="#1778F2" />
//             <Text className="text-[#1778F2] text-[12px] mt-2 font-medium">
//               {multiple ? "Add Documents" : "Add Document"}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       )}

//       {multiple && selectedDocuments.length > 1 && (
//         <TouchableOpacity
//           className="mt-2 p-2 bg-red-500 rounded-lg justify-center items-center"
//           onPress={removeAllDocuments}
//         >
//           <Text className="text-white font-medium">Clear All ({selectedDocuments.length})</Text>
//         </TouchableOpacity>
//       )}

//       {multiple && selectedDocuments.length > 0 && canSelectMore && (
//         <TouchableOpacity
//           className="mt-2 p-3 bg-[#1778F2] rounded-lg justify-center items-center"
//           onPress={pickDocument}
//         >
//           <Text className="text-white font-medium">
//             Add More Documents ({selectedDocuments.length}/{maxDocuments})
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   )
// }
















import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { getMimeType } from "@/helpers/fileHandling"; // Keep this if you want to detect MIME type

export interface DocumentItem {
  uri: string;
  id: string;
  name?: string;
  type?: string;
  file?: string; // base64
}

interface DocumentPickerProps {
  selectedDocuments: DocumentItem[];
  setSelectedDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  multiple?: boolean;
  maxDocuments?: number;
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
      });

      if (result.assets && result.assets.length > 0) {
        const docs = result.assets;

        const processedDocs = await Promise.all(
          docs.map(async (doc) => {
            try {
              // Read file as base64
              const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });

              // Detect MIME type
              const mimeType = doc.mimeType || (await getMimeType(doc.uri)) || "application/octet-stream";

              // ✅ Generate a unique file name
              const extension = doc.name.split(".").pop() || "file";
              const baseName = doc.name.replace(/\.[^/.]+$/, ""); // Remove extension
              const uniqueName = `${baseName}_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 6)}.${extension}`;

              return {
                uri: doc.uri,
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: uniqueName, // ✅ Use unique name here
                type: mimeType,
                file: base64Data,
              };
            } catch (err) {
              console.error("Error processing document:", err);
              return null;
            }
          })
        );

        const validDocs = processedDocs.filter((d) => d !== null) as DocumentItem[];

        if (multiple) {
          setSelectedDocuments((prev) => {
            const merged = [...prev, ...validDocs];
            return merged.slice(0, maxDocuments);
          });
        } else {
          setSelectedDocuments(validDocs.slice(0, 1));
        }
      }
    } catch (error) {
      console.error("Document picking error:", error);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllDocuments = () => {
    setSelectedDocuments([]);
    console.log("All documents cleared");
  };

  const canSelectMore = multiple && selectedDocuments.length < maxDocuments;

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
  );
}
