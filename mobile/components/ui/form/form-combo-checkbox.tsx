import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, Dimensions } from 'react-native';
import { Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

type Option = { id: string; name: string };

const FormComboCheckbox = ({
  control,
  name,
  label,
  options,
  readOnly,
  placeholder = 'Select options',
}: {
  control: any;
  name: string;
  label?: string;
  options: Option[];
  readOnly?: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.measure((
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        setTriggerWidth(width);
      });
    }
    const updateWidth = () => {
      if (triggerRef.current) {
        triggerRef.current.measure((
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setTriggerWidth(width);
        });
      }
    };
    const subscription = Dimensions.addEventListener('change', updateWidth);
    return () => {
      subscription.remove();
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

        const toggleOption = (optionId: string) => {
          const newValues = selectedValues.includes(optionId)
            ? selectedValues.filter((val: string) => val !== optionId)
            : [...selectedValues, optionId];
          onChange(newValues);
        };

        const clearSelections = () => {
          onChange([]);
        };

        const selectedOptions = options.filter(option =>
          selectedValues.includes(option.id),
        );

        const getDisplayText = () => {
          if (selectedOptions.length === 0) return placeholder;
          return selectedOptions.map(opt => opt.name).join(', ');
        };

        return (
          <View className="w-full">
            {label && <Text className="text-black/70 text-sm mb-2">{label}</Text>}
            {!readOnly ? (
              <>
                <TouchableOpacity
                  ref={triggerRef}
                  onPress={() => setIsOpen(true)}
                  className={cn(
                    'w-full border border-gray-300 rounded-md px-3 py-2 flex-row justify-between items-center',
                    !selectedValues.length && 'text-gray-500',
                  )}
                >
                  <Text className="flex-1 truncate">{getDisplayText()}</Text>
                  <View className="flex-row">
                    {selectedValues.length > 0 && (
                      <TouchableOpacity onPress={clearSelections} className="mr-2">
                        <MaterialIcons name="clear" size={16} color="gray" />
                      </TouchableOpacity>
                    )}
                    <MaterialIcons name="arrow-drop-down" size={20} color="gray" />
                  </View>
                </TouchableOpacity>
                <Modal
                  visible={isOpen}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setIsOpen(false)}
                >
                  <View className="flex-1 bg-black/50 justify-end">
                    <View
                      className="bg-white rounded-t-lg p-4"
                      style={{ width: '100%', maxHeight: '50%' }}
                    >
                      <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={() => setIsOpen(false)}>
                          <Text className="text-blue-500 text-base font-medium">Done</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold">{label}</Text>
                        <TouchableOpacity onPress={() => setIsOpen(false)}>
                          <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        placeholder="Search"
                        value={search}
                        onChangeText={setSearch}
                        className="border border-gray-300 rounded-md px-3 py-2 mb-4"
                      />
                      <FlatList
                        data={filteredOptions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => toggleOption(item.id)}
                            className="flex-row items-center py-2"
                          >
                            <View
                              className={cn(
                                'w-5 h-5 border border-gray-400 rounded mr-2',
                                selectedValues.includes(item.id) && 'bg-blue-500 border-blue-500',
                              )}
                            >
                              {selectedValues.includes(item.id) && (
                                <MaterialIcons name="check" size={14} color="white" className="m-auto" />
                              )}
                            </View>
                            <Text className="text-sm">{item.name}</Text>
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                          <Text className="text-center text-gray-500">No options found</Text>
                        )}
                      />
                    </View>
                  </View>
                </Modal>
              </>
            ) : (
              <Text className="border border-gray-300 rounded-md px-3 py-2">{getDisplayText()}</Text>
            )}
            {error && <Text className="text-red-500 text-sm mt-1">{error.message}</Text>}
          </View>
        );
      }}
    />
  );
};

export default FormComboCheckbox;