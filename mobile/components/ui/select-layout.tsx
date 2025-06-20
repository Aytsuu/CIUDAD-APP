import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, Dimensions, Animated } from "react-native"
import { ChevronDown, Check } from "lucide-react-native"
import { capitalize } from "@/helpers/capitalize"

export interface DropdownOption {
  label: string
  value: string
}

interface ModalSelectProps {
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
}

export const SelectLayout: React.FC<ModalSelectProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  maxHeight = 300,
  className,
  isInModal=false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const dropdownRef = useRef<View>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  const selectedOption = options.find((option) => option.value === selectedValue)
  const { height: screenHeight } = Dimensions.get("window")

  const openDropdown = () => {
    if (disabled) return

    dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownLayout({ x: pageX, y: pageY, width, height })
      setIsOpen(true)
    })
  }

  const closeDropdown = () => {
    setIsOpen(false)
  }

  const handleSelect = (option: DropdownOption) => {
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
  }, [isOpen])

  const calculateDropdownPosition = () => {
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height)
    const spaceAbove = dropdownLayout.y
    const dropdownHeight = Math.min(maxHeight, options.length * 50)

    // Use custom offset if provided, otherwise auto-detect context
    let gapAdjustment = isInModal ? 5 : -30;
    let top = dropdownLayout.y + dropdownLayout.height + gapAdjustment;

    // If not enough space below, show above
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

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between px-6 py-3 min-h-[44px] border-b border-gray-100`}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          className={`flex-1 text-sm ${isSelected ? "text-blue-600 font-medium" : "text-gray-900"}`}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {isSelected && <Check size={16} color="#3B82F6" />}
      </TouchableOpacity>
    )
  }

  return (
    <View className={className}>
      {label && <Text className="text-[12px] font-PoppinsRegular text-gray-700">{label}</Text>}

      <TouchableOpacity
        ref={dropdownRef}
        className={`flex-row items-center justify-between px-3 py-3 border rounded-md bg-white min-h-[45px] ${
          error ? "border-red-500" : disabled ? "border-gray-200 bg-gray-50" : "border-gray-300"
        }`}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text
          className={`flex-1 text-sm ${
            !selectedOption ? "text-gray-400" : disabled ? "text-gray-400" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {selectedOption ? capitalize(selectedOption.label) : placeholder}
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
            className="absolute bg-white rounded-lg border border-gray-200 shadow-lg"
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
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={{ maxHeight: calculateDropdownPosition().maxHeight }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}
