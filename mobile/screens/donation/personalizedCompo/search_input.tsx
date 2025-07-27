import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface Person {
  per_id: number;
  full_name: string;
}

interface DonorSelectProps {
  placeholder?: string;
  label?: string;
  className?: string;
  contentClassName?: string;
  people: Person[];
  selectedDonor: string;
  onSelect: (donorName: string) => void;
  error?: string;
}

export function DonorSelect({
  placeholder = 'Select...',
  label,
  className,
  contentClassName,
  people,
  selectedDonor,
  onSelect,
  error,
}: DonorSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Add Anonymous option at the beginning of filtered people
  const filteredOptions = [
    { per_id: -1, full_name: 'Anonymous' },
    ...people.filter(person =>
      person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ];

  const measureDropdownPosition = (event: any) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setDropdownPosition({
        top: pageY + height,
        left: pageX,
        width,
      });
    });
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-[16px] font-PoppinsRegular mb-2">
          {label}
        </Text>
      )}
      
      <View className={cn('relative', className)}>
        <TouchableOpacity
          className={cn(
            'flex-row items-center justify-between p-3 border rounded-md h-12',
            error ? 'border-red-500' : 'border-gray-300',
            contentClassName
          )}
          onPress={() => setIsOpen(!isOpen)}
          onLayout={measureDropdownPosition}
        >
          <Text className="text-base font-PoppinsRegular">
            {selectedDonor || placeholder}
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
            className="absolute bg-white rounded-md border border-gray-200 shadow-lg"
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
                placeholder="Search or enter donor name..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="p-2 border border-gray-300 rounded-md font-PoppinsRegular"
                autoFocus
              />
            </View>

            {/* Options list with Anonymous first */}
            <FlatList
              data={filteredOptions}
              keyExtractor={item => item.per_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-3 border-b border-gray-100"
                  onPress={() => handleSelect(item.full_name)}
                >
                  <Check
                    size={16}
                    color={selectedDonor === item.full_name ? 'green' : 'transparent'}
                    className="mr-2"
                  />
                  <Text className="text-base font-PoppinsRegular">{item.full_name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-4 items-center">
                  <Text className="text-gray-500 font-PoppinsRegular">No matching people found</Text>
                </View>
              }
            />

            {/* Manual entry option */}
            {searchTerm.trim() && !filteredOptions.some(
              person => person.full_name.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <TouchableOpacity
                className="flex-row items-center p-3 border-t border-gray-200 bg-blue-50"
                onPress={() => handleSelect(searchTerm)}
              >
                <Text className="text-blue-500 font-PoppinsRegular">
                  Use "{searchTerm}" as donor name
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      </View>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1 font-PoppinsRegular">
          {error}
        </Text>
      )}
    </View>
  );
}