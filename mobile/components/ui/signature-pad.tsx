import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, PenTool } from 'lucide-react-native';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  value?: string;
}

// Simple signature input - user types their name as signature
export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, value }) => {
  const [signature, setSignature] = useState(value || '');

  const handleSignatureChange = (text: string) => {
    setSignature(text);
    onSignatureChange(text);
  };

  const clearSignature = () => {
    setSignature('');
    onSignatureChange('');
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <PenTool size={20} color="#6B7280" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Type your full name as signature"
          placeholderTextColor="#9CA3AF"
          value={signature}
          onChangeText={handleSignatureChange}
          autoCapitalize="words"
        />
        {signature.length > 0 && (
          <TouchableOpacity 
            style={styles.clearIconButton}
            onPress={clearSignature}
          >
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {signature.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Signature Preview:</Text>
          <Text style={styles.previewText}>{signature}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 50,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'cursive',
  },
  clearIconButton: {
    padding: 4,
  },
  previewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'cursive',
    fontStyle: 'italic',
  },
});
