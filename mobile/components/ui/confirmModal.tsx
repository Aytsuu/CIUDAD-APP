// import React from 'react';
// import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
// import { Button } from '@/components/ui/button';

// interface ConfirmationDialogProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   onConfirm: () => void;
//   title?: string;
//   description?: string;
//   confirmText?: string;
//   cancelText?: string;
// }

// export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
//   isOpen,
//   onOpenChange,
//   onConfirm,
//   title = "Are you sure?",
//   description = "This action cannot be undone.",
//   confirmText = "Confirm",
//   cancelText = "Cancel",
// }) => {
//   return (
//     <Modal
//       transparent
//       visible={isOpen}
//       animationType="fade"
//       onRequestClose={() => onOpenChange(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <View style={styles.content}>
//             <Text style={styles.title}>{title}</Text>
//             <Text style={styles.description}>{description}</Text>
//           </View>
          
//           <View style={styles.buttonsContainer}>
//             <Button 
//               variant="outline" 
//               onPress={() => onOpenChange(false)}
//               style={styles.button}
//             >
//               {cancelText}
//             </Button>
//             <Button 
//               onPress={() => {
//                 onConfirm();
//                 onOpenChange(false);
//               }}
//               style={styles.button}
//             >
//               {confirmText}
//             </Button>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   container: {
//     width: '100%',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   content: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textAlign: 'center',
//     color: '#1f2937', // gray-800
//   },
//   description: {
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#6b7280', // gray-500
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//   },
//   button: {
//     minWidth: 80,
//   },
// });





import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            {/* Cancel Button */}
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => onOpenChange(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                onConfirm();
                onOpenChange(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    textAlign: 'left',
    color: '#6b7280',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});