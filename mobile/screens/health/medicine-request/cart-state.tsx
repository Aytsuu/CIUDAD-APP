import { useState, useEffect } from 'react';

// Define the comprehensive Medicine type
export type Medicine = {
  minv_id: number;  
  name: string; 
  category: string; 
  med_type: string; 
  dosage: string; 
  description?: string;  
  availableStock: number; 
  reason: string;
};

// Type for uploaded files
export type UploadedFile = {
  id: string;
  name: string;
  type: string;
  uri: string;
  size?: number;
};

// Internal global state (not directly exposed, but managed by the hook)
interface CartState {
  items: Medicine[];
  uploadedFiles: UploadedFile[]; // Store uploaded files at cart level
}

const _globalCartState: CartState = {
  items: [],
  uploadedFiles: [],
};

// Use a simple publisher-subscriber pattern for updates
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// Cart actions
export const addToCart = (medicine: Medicine): void => {
  const existingItemIndex = _globalCartState.items.findIndex(item => item.minv_id === medicine.minv_id);

  if (existingItemIndex !== -1) {
    // If item exists, update its reason
    _globalCartState.items[existingItemIndex] = {
      ..._globalCartState.items[existingItemIndex],
      reason: medicine.reason,
    };
  } else {
    // Add new item
    _globalCartState.items.push(medicine);
  }
  notifySubscribers();
};

export const removeFromCart = (id: number): void => {
  _globalCartState.items = _globalCartState.items.filter(item => item.minv_id !== id);
  notifySubscribers();
};

export const addUploadedFile = (file: UploadedFile): void => {
  _globalCartState.uploadedFiles.push(file);
  notifySubscribers();
};

export const removeUploadedFile = (fileId: string): void => {
  _globalCartState.uploadedFiles = _globalCartState.uploadedFiles.filter(file => file.id !== fileId);
  notifySubscribers();
};

// ADD THIS MISSING FUNCTION:
export const clearUploadedFiles = (): void => {
  _globalCartState.uploadedFiles = [];
  notifySubscribers();
};

export const clearCart = (): void => {
  _globalCartState.items = [];
  _globalCartState.uploadedFiles = [];
  notifySubscribers();
};

// Custom hook to subscribe to global cart state changes
export const useGlobalCartState = () => {
  const [cartItems, setCartItems] = useState<Medicine[]>(_globalCartState.items);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(_globalCartState.uploadedFiles);

  useEffect(() => {
    const updateLocalState = () => {
      setCartItems([..._globalCartState.items]);
      setUploadedFiles([..._globalCartState.uploadedFiles]);
    };

    subscribers.add(updateLocalState); // Subscribe
    updateLocalState(); // Initial sync

    return () => {
      subscribers.delete(updateLocalState); // Unsubscribe on unmount
    };
  }, []);

  return { 
    cartItems, 
    uploadedFiles,
    setCartItems: (items: Medicine[]) => {
      _globalCartState.items = items;
      notifySubscribers();
    },
    setUploadedFiles: (files: UploadedFile[]) => {
      _globalCartState.uploadedFiles = files;
      notifySubscribers();
    }
  };
};