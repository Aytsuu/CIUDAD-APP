import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, Dimensions, Animated, TextInput } from "react-native"
import { ChevronDown, Check, X, Search } from "lucide-react-native"

export interface DropdownOption {
  label: string | React.ReactNode
  value: string
  disabled?: boolean
  data?: any
}

interface SearchableSelectProps {
  options: DropdownOption[]
  selectedValue?: string
  onSelect: (option: DropdownOption) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  maxHeight?: number
  className?: string
  isInModal?: boolean
  searchPlaceholder?: string
}

/**
 * SearchableSelect Component
 * 
 * A specialized version of SelectLayout with search functionality.
 * Use this only when you need search capabilities (e.g., resident selection).
 * For regular dropdowns, use SelectLayout directly.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  maxHeight = 300,
  className,
  isInModal = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const dropdownRef = useRef<View>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  const selectedOption = options.find((option) => option.value === selectedValue)
  const { height: screenHeight } = Dimensions.get("window")

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options

    const lowerQuery = searchQuery.toLowerCase()
    return options.filter((option) => {
      if (typeof option.label === "string") {
        return option.label.toLowerCase().includes(lowerQuery)
      }
      if (option.data?.name) {
        return option.data.name.toLowerCase().includes(lowerQuery)
      }
      return false
    })
  }, [options, searchQuery])

  const openDropdown = () => {
    if (disabled) return

    dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownLayout({ x: pageX, y: pageY, width, height })
      setIsOpen(true)
      setSearchQuery("")
    })
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return
    onSelect(option)
    closeDropdown()
  }

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isOpen, fadeAnim, scaleAnim])

  const calculateDropdownPosition = () => {
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height)
    const spaceAbove = dropdownLayout.y
    const dropdownHeight = Math.min(maxHeight, filteredOptions.length * 50 + 60)

    const gapAdjustment = isInModal ? 5 : -30
    let top = dropdownLayout.y + dropdownLayout.height + gapAdjustment

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      top = dropdownLayout.y - dropdownHeight - (isInModal ? 0 : 30)
    }

    return {
      top,
      left: dropdownLayout.x,
      width: dropdownLayout.width,
      maxHeight: Math.min(maxHeight, Math.max(spaceBelow, spaceAbove) - 20),
    }
  }

  const renderOption = ({ item }: { item: DropdownOption }) => {
    const isSelected = item.value === selectedValue
    const isDisabled = item.disabled

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between px-6 py-3 min-h-[44px] border-b border-gray-100 ${
          isDisabled ? "bg-gray-50 opacity-50" : ""
        }`}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <View className="flex-1">
          <Text
            className={`text-sm ${
              isSelected ? "text-blue-600 font-medium" : isDisabled ? "text-gray-400" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
        {isSelected && <Check size={16} color="#3B82F6" />}
      </TouchableOpacity>
    )
  }

  return (
    <View className={className}>
      {label && <Text className="text-sm mb-2">{label}</Text>}

      <TouchableOpacity
        ref={dropdownRef}
        className={`flex-row items-center justify-between px-3 py-3 border rounded-xl bg-white h-[45px] ${
          error ? "border-red-500" : disabled ? "border-gray-200 bg-gray-50" : "border-gray-300"
        }`}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Search size={18} color={disabled ? "#9CA3AF" : "#6B7280"} />
        <Text
          className={`flex-1 text-sm ml-2 ${
            !selectedOption ? "text-gray-400" : disabled ? "text-gray-400" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {selectedOption
            ? typeof selectedOption.label === "string"
              ? selectedOption.label
              : selectedOption.data?.name || "Selected"
            : placeholder}
        </Text>

        <Animated.View
          style={{
            transform: [
              {
                rotate: isOpen ? "180deg" : "0deg",
              },
            ],
          }}
        >
          <ChevronDown size={18} color={disabled ? "#9CA3AF" : "#6B7280"} />
        </Animated.View>
      </TouchableOpacity>

      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}

      <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeDropdown}>
        <TouchableOpacity className="flex-1 bg-black/10" activeOpacity={1} onPress={closeDropdown}>
          <Animated.View
            className="absolute bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
            style={[
              calculateDropdownPosition(),
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                zIndex: 1000,
              },
            ]}
          >
            {/* Search Input */}
            <View className="px-4 py-3 border-b border-gray-100 bg-white">
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <Search size={20} color="#808080"/>
                <TextInput
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-sm text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
                {searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Options List */}
            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                renderItem={renderOption}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={true}
                bounces={false}
                style={{ maxHeight: calculateDropdownPosition().maxHeight - 60 }}
              />
            ) : (
              <View className="px-6 py-8 items-center">
                <Text className="text-sm text-gray-500">No results found</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}