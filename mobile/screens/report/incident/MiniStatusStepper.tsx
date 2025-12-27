import { View, StyleSheet } from 'react-native';
import { FileText, CheckCircle2, Check, Activity } from 'lucide-react-native';

export const MiniStatusStepper = ({
  isVerified,
  isResolved,
}: {
  isVerified: boolean;
  isResolved: boolean;
}) => {
  // Determine current step index (0: Reported, 1: In Progress, 2: Resolved)
  let currentStep = 0;
  if (isVerified) currentStep = 1;
  if (isResolved) currentStep = 2;

  const steps = [
    { icon: FileText },
    { icon: Activity },
    { icon: CheckCircle2 },
  ];

  return (
    <View style={styles.stepperWrapper}>
      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCompleted = index < currentStep;
          const isFinal = index === steps.length - 1;

          // Color Logic
          let circleStyle = [styles.circle, styles.circleInactive];
          let iconColor = '#d1d5db';
          
          if (isActive) {
            circleStyle = [
              styles.circle,
              isResolved ? styles.circleGreen : styles.circleBlue,
            ];
            iconColor = '#ffffff';
          }
          
          if (isResolved && isFinal) {
            circleStyle = [styles.circle, styles.circleGreen];
            iconColor = '#ffffff';
          }

          return (
            <View 
              key={index} 
              style={[
                styles.stepContainer,
                index === 0 && styles.firstStep,
                index === steps.length - 1 && styles.lastStep,
              ]}
            >
              <View style={circleStyle}>
                {isCompleted || (isResolved && isFinal) ? (
                  <Check size={12} color={iconColor} />
                ) : (
                  <Icon size={12} color={iconColor} />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Line Container - positioned absolutely to sit behind circles */}
      <View style={styles.lineContainer}>
        <View style={styles.backgroundLine} />

        {/* Active Progress Line (Colored) */}
        <View
          style={[
            styles.progressLine,
            {
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              backgroundColor: isResolved ? '#16a34a' : '#0084F0',
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepperWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 120,
  },
  lineContainer: {
    position: 'absolute',
    left: 10, // Half of circle width (20px / 2)
    right: 10, // Half of circle width (20px / 2)
    top: 10, // Aligns with center of smaller circle (20px height / 2)
    height: 2,
  },
  backgroundLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
  },
  progressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 2,
    borderRadius: 9999,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  firstStep: {
    alignItems: 'flex-start', // Align first circle to the left edge
  },
  lastStep: {
    alignItems: 'flex-end', // Align last circle to the right edge
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  circleInactive: {
    borderColor: '#d1d5db',
  },
  circleBlue: {
    backgroundColor: '#0084F0',
    borderColor: '#0084F0',
  },
  circleGreen: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
});