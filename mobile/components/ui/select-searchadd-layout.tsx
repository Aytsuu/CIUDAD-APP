import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { ChevronDown, X, Plus } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
}

interface SelectLayoutWithAddProps {
  placeholder: string;
  label: string;
  className?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onAdd?: (newValue: string) => void;
  onDelete?: (id: string) => void;
}

export function SelectLayoutWithAdd({
  placeholder,
  label,
  className,
  options,
  value,
  onChange,
  onAdd,
  onDelete,
}: SelectLayoutWithAddProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  const handleSelect = (selectedValue: string) => {
    if (!selectedValue.trim()) return;

    const existingOption = options.find(opt => opt.id === selectedValue);
    if (!existingOption && onAdd) {
      onAdd(selectedValue);
    } else {
      onChange(selectedValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const measureDropdownPosition = (event: any) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setDropdownPosition({
        top: pageY + height,
        left: pageX,
        width,
      });
    });
  };

  return (
    <View className={cn('relative', className)}>
      <TouchableOpacity
        className="flex-row items-center justify-between p-3 border border-gray-300 rounded-xl h-12"
        onPress={() => setIsOpen(!isOpen)}
        onLayout={measureDropdownPosition}
      >
        <Text className="text-sm">
          {selectedOption?.name || placeholder}
        </Text>
        <ChevronDown size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="absolute inset-0 bg-black/30"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        />
        
        <View
          className="absolute bg-white rounded-xl border border-gray-200 shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: 300,
          }}
        >
          {/* Search input */}
          <View className="p-2 border-b border-gray-200">
            <TextInput
              placeholder="Search or add..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="p-2 border border-gray-300 rounded-xl h-12"
              autoFocus
            />
          </View>

          {/* Options list */}
          <FlatList
            data={filteredOptions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between p-2 border-b border-gray-100">
                <TouchableOpacity
                  className="flex-1"
                  onPress={() => handleSelect(item.id)}
                >
                  <Text className="text-base">{item.name}</Text>
                </TouchableOpacity>
                {onDelete && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="p-1"
                  >
                    <X size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View className="p-4 items-center">
                <Text className="text-gray-500">No options found</Text>
              </View>
            }
          />

          {/* Add new option */}
          {searchTerm.trim() && !filteredOptions.some(
            option => option.name.toLowerCase() === searchTerm.toLowerCase()
          ) && (
            <TouchableOpacity
              className="flex-row items-center p-2 border-t border-gray-200"
              onPress={() => handleSelect(searchTerm)}
            >
              <Plus size={16} color="#3b82f6" className="mr-2" />
              <Text className="text-blue-500">Add "{searchTerm}"</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}