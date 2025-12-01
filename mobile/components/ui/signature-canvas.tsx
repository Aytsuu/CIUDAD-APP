import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Trash2 } from 'lucide-react-native';

interface Point {
  x: number;
  y: number;
}

interface SignatureCanvasComponentProps {
  onSignatureChange: (signature: string) => void;
  value?: string;
}

export const SignatureCanvasComponent: React.FC<SignatureCanvasComponentProps> = ({ 
  onSignatureChange, 
  value 
}) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [hasSigned, setHasSigned] = useState(false);
  
  // Use refs to avoid stale closure in PanResponder
  const currentPathRef = useRef<Point[]>([]);
  const pathsRef = useRef<string[]>([]);

  // Initialize from value prop if provided
  React.useEffect(() => {
    if (value && value !== '') {
      setHasSigned(true);
      // If value contains SVG paths, restore them
      if (value.startsWith('data:image/svg+xml')) {
        try {
          // Extract paths from SVG data URL
          const svgData = decodeURIComponent(value.split(',')[1]);
          // Parse and restore paths (simplified - just mark as signed)
          setHasSigned(true);
        } catch (e) {
          console.log('Could not parse SVG value');
        }
      }
    }
  }, [value]);

  // Keep refs in sync with state
  React.useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  React.useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  // Generate SVG data URL from paths
  const generateSignatureData = () => {
    if (pathsRef.current.length === 0) {
      return '';
    }

    // Create SVG string
    const svgPaths = pathsRef.current.map(path => 
      `<path d="${path}" stroke="black" stroke-width="2" fill="none"/>`
    ).join('');
    
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">${svgPaths}</svg>`;
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    
    console.log('SignatureCanvas - Generated SVG data URL');
    return dataUrl;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = [{ x: locationX, y: locationY }];
        setCurrentPath(newPath);
        currentPathRef.current = newPath;
        console.log('SignatureCanvas - Started drawing at:', locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => {
          const updated = [...prev, { x: locationX, y: locationY }];
          currentPathRef.current = updated;
          return updated;
        });
      },
      onPanResponderRelease: async () => {
        console.log('SignatureCanvas - Release, currentPath length:', currentPathRef.current.length);
        
        if (currentPathRef.current.length > 0) {
          const pathString = pointsToSvgPath(currentPathRef.current);
          setPaths(prev => {
            const updated = [...prev, pathString];
            pathsRef.current = updated;
            return updated;
          });
          setCurrentPath([]);
          currentPathRef.current = [];
          setHasSigned(true);
          
          // Generate signature data after a small delay to ensure state is updated
          setTimeout(() => {
            const signatureData = generateSignatureData();
            if (signatureData) {
              onSignatureChange(signatureData);
            }
          }, 100);
        } else {
          console.log('SignatureCanvas - No path drawn, currentPathRef length:', currentPathRef.current.length);
        }
      },
    })
  ).current;

  const pointsToSvgPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    setHasSigned(false);
    console.log('SignatureCanvas - Clearing signature, calling onChange with empty string');
    onSignatureChange('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Signature (Draw your signature below)</Text>
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg width="100%" height={200}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="black"
              strokeWidth={2}
              fill="none"
            />
          ))}
          {currentPath.length > 0 && (
            <Path
              d={pointsToSvgPath(currentPath)}
              stroke="black"
              strokeWidth={2}
              fill="none"
            />
          )}
        </Svg>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Draw your signature in the box above using your finger
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Trash2 size={18} color="#FFFFFF" />
          <Text style={styles.clearButtonText}>Clear Signature</Text>
        </TouchableOpacity>
      </View>

      {hasSigned && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Signature saved ✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  canvasContainer: {
    height: 200,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  instructionContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  previewLabel: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
    textAlign: 'center',
  },
});
