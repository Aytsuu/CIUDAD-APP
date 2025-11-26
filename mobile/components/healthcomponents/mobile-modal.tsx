import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

export type ModalType = 'default' | 'confirmation' | 'alert' | 'bottom-sheet';
export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: boolean;
}

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ModalAction[];
  type?: ModalType;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  icon?: ReactNode;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export function MobileModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  type = 'default',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  icon,
}: MobileModalProps) {
  const handleBackdropPress = () => {
    if (closeOnBackdropClick) onClose();
  };

  const getModalHeight = () => {
    switch (size) {
      case 'sm':
        return 'auto'; // Auto height for small modals
      case 'md':
        return SCREEN_HEIGHT * 0.6;
      case 'lg':
        return SCREEN_HEIGHT * 0.8;
      case 'full':
        return SCREEN_HEIGHT;
      default:
        return SCREEN_HEIGHT * 0.6;
    }
  };

  const getModalWidth = () => {
    switch (size) {
      case 'sm':
        return SCREEN_WIDTH * 0.8;
      case 'md':
        return SCREEN_WIDTH * 0.9;
      case 'lg':
        return SCREEN_WIDTH * 0.95;
      case 'full':
        return SCREEN_WIDTH;
      default:
        return SCREEN_WIDTH * 0.9;
    }
  };

  const getActionButtonStyle = (variant: string = 'default') => {
    const baseStyle = {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    switch (variant) {
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: '#EF4444',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#F3F4F6',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#3B82F6',
        };
    }
  };

  const getActionTextStyle = (variant: string = 'default', disabled?: boolean) => {
    const baseStyle = {
      fontSize: 14,
      fontWeight: '600' as const,
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: '#9CA3AF',
      };
    }

    switch (variant) {
      case 'destructive':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: '#374151',
        };
      default:
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
    }
  };

  const isBottomSheet = type === 'bottom-sheet';
  const modalHeight = getModalHeight();
  const modalWidth = getModalWidth();
  const isSmallModal = size === 'sm';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType={isBottomSheet ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleBackdropPress}
      >
        <Pressable
          style={[
            styles.modalContainer,
            isBottomSheet ? styles.bottomSheet : styles.centered,
            {
              height: isBottomSheet || isSmallModal ? 'auto' : modalHeight,
              width: isBottomSheet ? SCREEN_WIDTH : modalWidth,
              maxHeight: isBottomSheet ? SCREEN_HEIGHT * 0.9 : undefined,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {showCloseButton && (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Header */}
          {(icon || title || description) && (
            <View style={styles.header}>
              {icon && (
                <View style={styles.iconContainer}>
                  {icon}
                </View>
              )}

              {title && (
                <Text style={styles.title}>
                  {title}
                </Text>
              )}

              {description && (
                <Text style={styles.description}>
                  {description}
                </Text>
              )}
            </View>
          )}

          {/* Content */}
          {children && (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <View style={styles.actionsContainer}>
              <View style={styles.actionsWrapper}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onClick}
                    disabled={action.disabled}
                    style={[
                      getActionButtonStyle(action.variant),
                      action.disabled && styles.disabledButton,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={getActionTextStyle(action.variant, action.disabled)}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centered: {
    borderRadius: 16,
    marginHorizontal: 16,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  actionsWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default MobileModal;
