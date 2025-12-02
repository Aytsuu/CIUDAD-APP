import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string; // For compatibility, though we'll use styles
  accessibilityLabel?: string;
}

const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, accessibilityLabel }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.checkbox,
          checked ? styles.checked : styles.unchecked,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
      >
        {checked && (
          <View style={styles.indicator}>
            <Check size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300 equivalent
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  unchecked: {
    backgroundColor: '#F3F4F6', // gray-100 equivalent
  },
  checked: {
    backgroundColor: '#07143F', // Your app's primary color
    borderColor: '#07143F',
  },
  disabled: {
    opacity: 0.5,
  },
  indicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { Checkbox };