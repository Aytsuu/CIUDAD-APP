// components/ui/simple-pagination.tsx
import { View, Text, TouchableOpacity } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"

export const PaginationControls = ({ currentPage, totalPages, onPageChange }:any) => {
  if (totalPages <= 1) return null

  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white' }}>
      <TouchableOpacity
        onPress={() => hasPrevious && onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 8, 
          borderRadius: 8,
          backgroundColor: hasPrevious ? 'white' : '#f3f4f6',
          borderWidth: 1,
          borderColor: hasPrevious ? '#3b82f6' : '#d1d5db',
          opacity: hasPrevious ? 1 : 0.5
        }}
      >
        <ChevronLeft size={16} color={hasPrevious ? "#3B82F6" : "#9CA3AF"} />
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9fafb', borderRadius: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
          {currentPage} / {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 8, 
          borderRadius: 8,
          backgroundColor: hasNext ? '#3b82f6' : '#f3f4f6',
          borderWidth: 1,
          borderColor: hasNext ? '#3b82f6' : '#d1d5db',
          opacity: hasNext ? 1 : 0.5
        }}
      >
        <ChevronRight size={16} color={hasNext ? "white" : "#9CA3AF"} />
      </TouchableOpacity>
    </View>
  )
}