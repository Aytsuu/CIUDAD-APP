// components/ui/dropdown/dropdown-menu.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface DropdownMenuProps {
  children: React.ReactNode; // This will be the trigger
  content: React.ReactNode; // This will be the content of the dropdown
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, content }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const tw = useTailwind();

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        {children}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={tw('flex-1 justify-center items-center bg-black bg-opacity-50')}
          activeOpacity={1}
          onPress={() => setModalVisible(false)} // Close modal when clicking outside
        >
          <View style={tw('bg-white rounded-md shadow-lg p-2 min-w-[150px]')}>
            {React.Children.map(content, (child) => {
              if (React.isValidElement(child) && child.type === DropdownMenuItem) {
                return React.cloneElement(child as React.ReactElement<DropdownMenuItemProps>, {
                  onPress: () => {
                    child.props.onPress?.();
                    setModalVisible(false);
                  },
                });
              }
              return child;
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const DropdownMenuTrigger: React.FC<{ asChild: boolean; children: React.ReactNode }> = ({ children }) => {
  // This component is just a wrapper for the trigger, the TouchableOpacity in DropdownMenu handles the press
  return <>{children}</>;
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This component is just a wrapper for the content, rendered inside the Modal
  return <>{children}</>;
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, onPress }) => {
  const tw = useTailwind();
  return (
    <TouchableOpacity onPress={onPress} style={tw('py-2 px-3 active:bg-gray-100')}>
      <Text style={tw('text-base text-gray-800')}>{children}</Text>
    </TouchableOpacity>
  );
};
