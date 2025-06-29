// // Define the Medicine type
// export type Medicine = {
//   id: number
//   name: string
//   category: string
//   description?: string
//   quantity?: number
//   reason?: string
// }

// // Create a global cart state that persists between component renders
// export const globalCartState = {
//   items: [] as Medicine[],
// }

// // Add to cart function
// export const addToCart = (medicine: Medicine): void => {
//   const existingItem = globalCartState.items.find((item) => item.id === medicine.id)
//   if (existingItem) {
//     existingItem.quantity = medicine.quantity || 1
//     existingItem.reason = medicine.reason
//   } else {
//     globalCartState.items.push({
//       ...medicine,
//       quantity: medicine.quantity || 1,
//     })
//   }
// }

// // Remove from cart function
// export const removeFromCart = (id: number): void => {
//   globalCartState.items = globalCartState.items.filter((item) => item.id !== id)
// }

// // Update quantity function
// export const updateQuantity = (id: number, quantity: number): void => {
//   const item = globalCartState.items.find((item) => item.id === id)
//   if (item) {
//     item.quantity = quantity
//   }
// }

// // Clear cart function
// export const clearCart = (): void => {
//   globalCartState.items = []
// }


// cart-state.tsx
import { useState, useEffect } from 'react';

// Define the comprehensive Medicine type
export type Medicine = {
  id: number; // Mapped from minv_id (from backend)
  name: string; // Mapped from medicine_name (from backend)
  category: string; // Mapped from category_name (from backend)
  medicine_type: string; // Mapped from medicine_type (from backend, e.g., 'Prescription', 'Over-the-Counter')
  dosage: string; // Combined from minv_dsg and minv_dsg_unit (from backend)
  description?: string; // Optional: from backend if available
  minv_qty_avail: number; // Available stock from backend

  // Fields for the cart item (specific to the request)
  requestedQuantity: number;
  reason: string;
  uploadedFiles?: UploadedFile[]; // Array of uploaded files for prescription
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
      requestedQuantity: medicine.requestedQuantity,
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

export const updateQuantity = (id: number, newQuantity: number): void => {
  const item = _globalCartState.items.find(item => item.id === id);
  if (item) {
    // Ensure quantity doesn't exceed available stock
    item.requestedQuantity = Math.min(newQuantity, item.minv_qty_avail);
    notifySubscribers();
  }
};

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