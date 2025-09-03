
import { Camera, FileText } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Define the comprehensive Medicine type
export type Medicine = {
  id: number; // Mapped from minv_id (from backend)
  name: string; // Mapped from medicine_name (from backend)
  category: string; // Mapped from category_name (from backend)
  medicine_type: string; // Mapped from medicine_type (from backend, e.g., 'Prescription', 'Over-the-Counter')
  dosage: string; // Combined from minv_dsg and minv_dsg_unit (from backend)
  description?: string; // Optional: from backend if available
  minv_qty_avail: number; // Available stock from backend

  reason: string;
  uploadedFiles?: UploadedFile[]; // Array of uploaded files for prescription
};

// Type for uploaded files
type UploadedFile = {
  id: string;
  name: string;
  type: string;
  uri: string;
  size?: number;
};

const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
const [showUploadOptions, setShowUploadOptions] = useState(false);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Check if any medicine requires prescription
const requiresPrescription = cartItems.some(item => item.medicine_type === 'Prescription');

  const checkFileSize = (fileSize?: number, fileName?: string): boolean => {
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      Alert.alert(
        "File Too Large",
        `The file "${fileName || "selected file"}" is too large. Please select a file smaller than 15MB.`,
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const handleDocumentPicker = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
          copyToCacheDirectory: true,
        });
  
        if (!result.canceled && result.assets[0]) {
          const file = result.assets[0];
          if (!checkFileSize(file.size, file.name)) {
            return;
          }
  
          const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: file.name,
            type: file.mimeType || "unknown",
            uri: file.uri,
            size: file.size,
          };
          setUploadedFiles((prev) => [...prev, newFile]);
          setShowUploadOptions(false);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick document");
      }
    };
  
    const handleImagePicker = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.");
          return;
        }
  
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });
  
        if (!result.canceled && result.assets[0]) {
          const image = result.assets[0];
          const estimatedSize = image.fileSize || image.width * image.height * 3;
          if (!checkFileSize(estimatedSize, `gallery_image_${Date.now()}.jpg`)) {
            return;
          }
  
          const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: `prescription_${Date.now()}.jpg`,
            type: "image/jpeg",
            uri: image.uri,
            size: estimatedSize,
          };
          setUploadedFiles((prev) => [...prev, newFile]);
          setShowUploadOptions(false);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick image");
      }
    };
  
    const handleCameraPicker = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Please grant camera permissions to take photos.");
          return;
        }
  
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
        });
  
        if (!result.canceled && result.assets[0]) {
          const image = result.assets[0];
          const estimatedSize = image.fileSize || image.width * image.height * 3;
          if (!checkFileSize(estimatedSize, `camera_photo_${Date.now()}.jpg`)) {
            return;
          }
  
          const newFile: UploadedFile = {
            id: Date.now().toString(),
            name: `prescription_photo_${Date.now()}.jpg`,
            type: "image/jpeg",
            uri: image.uri,
            size: estimatedSize,
          };
          setUploadedFiles((prev) => [...prev, newFile]);
          setShowUploadOptions(false);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to take photo");
      }
    };
  
    const removeFile = (fileId: string) => {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };
  
    const getFileIcon = (type: string) => {
      if (type.includes("image")) {
        return <Camera size={20} color="#4F46E5" />;
      }
      return <FileText size={20} color="#4F46E5" />;
    };

    const handleConfirm = () => {
  if (cartItems.length === 0) {
    Alert.alert("Empty Cart", "Please add medicines to your bag before confirming.");
    return;
  }

  // Check if prescription is required but not uploaded
  if (requiresPrescription && uploadedFiles.length === 0) {
    Alert.alert(
      "Prescription Required",
      "Your cart contains prescription medicines. Please upload your doctor's prescription or consultation document to proceed.",
    );
    return;
  }

  const orderItems = cartItems.map(item => ({
    id: item.id,
    name: item.name,
    unit: "pc/s",
    reason: item.reason,
    medicine_type: item.medicine_type,
    hasPrescription: item.medicine_type === 'Prescription'
  }));

  console.log("Confirming order:", JSON.stringify(orderItems, null, 2));

  Alert.alert("Order Confirmed", "Your medicine request has been submitted successfully!", [
    {
      text: "OK",
      onPress: () => {
        clearCart();
        setUploadedFiles([]); // Clear uploaded files
        router.push({
          pathname: "/medicine-request/confirmation",
          params: { 
            orderItems: JSON.stringify(orderItems),
            uploadedFilesCount: uploadedFiles.length.toString()
          },
        });
      },
    },
  ]);
};
  
    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "";
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
    };
  
export type CartMedicineType = {
  id: number;
  name: string;
  category: string;
  medicine_type: string;
  dosage: string;
  description?: string;
  minv_qty_avail: number;
  reason: string;
  // Remove uploadedFiles from individual medicine
};

// Add this to track prescription requirements globally
export type PrescriptionRequirement = {
  medicineIds: number[];
  uploadedFiles: UploadedFile[];
  isFulfilled: boolean;
};

// Internal global state (not directly exposed, but managed by the hook)
interface CartState {
  items: Medicine[];
}

let _globalCartState: CartState = {
  items: [],
};

// Use a simple publisher-subscriber pattern for updates
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// Cart actions
export const addToCart = (medicine: Medicine): void => {
  const existingItemIndex = _globalCartState.items.findIndex(item => item.id === medicine.id);

  if (existingItemIndex !== -1) {
    // If item exists, update its quantity and reason
    _globalCartState.items[existingItemIndex] = {
      ..._globalCartState.items[existingItemIndex],
      reason: medicine.reason,
      uploadedFiles: medicine.uploadedFiles,
    };
  } else {
    // Add new item
    _globalCartState.items.push(medicine);
  }
  notifySubscribers();
};

export const removeFromCart = (id: number): void => {
  _globalCartState.items = _globalCartState.items.filter(item => item.id !== id);
  notifySubscribers();
};

// export const updateQuantity = (id: number, newQuantity: number): void => {
//   const item = _globalCartState.items.find(item => item.id === id);
//   if (item) {
//     // Ensure quantity doesn't exceed available stock
//     item.requestedQuantity = Math.min(newQuantity, item.minv_qty_avail);
//     notifySubscribers();
//   }
// };

export const clearCart = (): void => {
  _globalCartState.items = [];
  notifySubscribers();
};

// Custom hook to subscribe to global cart state changes
export const useGlobalCartState = () => {
  const [cartItems, setCartItems] = useState<Medicine[]>(_globalCartState.items);

  useEffect(() => {
    const updateLocalState = () => {
      setCartItems([..._globalCartState.items]);
    };

    subscribers.add(updateLocalState); // Subscribe
    updateLocalState(); // Initial sync

    return () => {
      subscribers.delete(updateLocalState); // Unsubscribe on unmount
    };
  }, []);

  return { cartItems, setCartItems: (items: Medicine[]) => { // Expose a setter to allow direct state manipulation for testing/initialization if needed
    _globalCartState.items = items;
    notifySubscribers();
  }};
};