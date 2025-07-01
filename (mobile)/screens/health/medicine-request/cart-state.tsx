// Define the Medicine type
export type Medicine = {
  id: number
  name: string
  category: string
  description?: string
  quantity?: number
  reason?: string
}

// Create a global cart state that persists between component renders
export const globalCartState = {
  items: [] as Medicine[],
}

// Add to cart function
export const addToCart = (medicine: Medicine): void => {
  const existingItem = globalCartState.items.find((item) => item.id === medicine.id)
  if (existingItem) {
    existingItem.quantity = medicine.quantity || 1
    existingItem.reason = medicine.reason
  } else {
    globalCartState.items.push({
      ...medicine,
      quantity: medicine.quantity || 1,
    })
  }
}

// Remove from cart function
export const removeFromCart = (id: number): void => {
  globalCartState.items = globalCartState.items.filter((item) => item.id !== id)
}

// Update quantity function
export const updateQuantity = (id: number, quantity: number): void => {
  const item = globalCartState.items.find((item) => item.id === id)
  if (item) {
    item.quantity = quantity
  }
}

// Clear cart function
export const clearCart = (): void => {
  globalCartState.items = []
}

