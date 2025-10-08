// components/personalizedCompo/staff_search_input.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface Staff {
  staff_id: string;
  full_name: string;
  position_title?: string;
}

interface StaffSelectProps {
  placeholder?: string;
  label?: string;
  className?: string;
  contentClassName?: string;
  staff: Staff[];
  selectedStaff: string | null | undefined;
  onSelect: (staffName: string) => void;
  error?: string;
}

export function StaffSelect({
  placeholder = 'Select distribution head...',
  label,
  className,
  contentClassName,
  staff = [],
  selectedStaff,
  onSelect,
  error,
}: StaffSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const filteredStaff = staff.filter(person =>
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            'flex-row items-center justify-between p-3 border rounded-xl h-12',
            error ? 'border-red-500' : 'border-gray-300',
            contentClassName
          )}
          onPress={() => setIsOpen(!isOpen)}
          onLayout={measureDropdownPosition}
        >
          <Text className="text-[12px] font-PoppinsRegular flex-1">
            {selectedStaff || placeholder}
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
            <View className="p-2 border-b rounded-xl border-gray-200">
              <TextInput
                placeholder="Search staff..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="p-2 border border-gray-300 rounded-md font-PoppinsRegular"
                autoFocus
              />
            </View>

            {/* Staff list */}
            <FlatList
              data={filteredStaff}
              keyExtractor={item => item.staff_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-3 border-b border-gray-100"
                  onPress={() => handleSelect(item.full_name)}
                >
                  <Check
                    size={16}
                    color={selectedStaff === item.full_name ? 'green' : 'transparent'}
                    className="mr-2"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-PoppinsRegular">{item.full_name}</Text>
                    {item.position_title && (
                      <Text className="text-sm text-gray-500 mt-1 font-PoppinsRegular">
                        {item.position_title}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-4 items-center">
                  <Text className="text-gray-500 font-PoppinsRegular">No staff found</Text>
                </View>
              }
            />
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