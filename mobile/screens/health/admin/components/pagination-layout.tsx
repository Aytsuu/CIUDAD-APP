// components/ui/pagination-controls.tsx
import type React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 10) return null;
  // Calculate current entries being shown
  const startEntry = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endEntry = Math.min(currentPage * pageSize, totalItems)
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  return (
    <View className={`  bg-white border-t border-gray-200 shadow-lg rounded-lg ${className}`}>
      {/* Navigation Controls */}
      <View className="flex-row items-center justify-between px-4 py-3 gap-3">
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`flex-row items-center px-3 py-2 rounded-lg border ${
            !hasPrevious ? "bg-gray-50 border-gray-200" : "bg-white border-blue-500 shadow-sm active:bg-blue-50"
          }`}
        >
          <ChevronLeft size={16} color={!hasPrevious ? "#9CA3AF" : "#3B82F6"} />
        </TouchableOpacity>

        <View className="px-4 py-2 bg-gray-50 rounded-lg">
          <Text className="text-sm font-semibold text-gray-700">
            {currentPage} / {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex-row items-center px-3 py-2 rounded-lg border ${
            !hasNext ? "bg-gray-50 border-gray-200" : "bg-blue-600 border-blue-600 shadow-sm active:bg-blue-700"
          }`}
        >
          <ChevronRight size={16} color={!hasNext ? "#9CA3AF" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
