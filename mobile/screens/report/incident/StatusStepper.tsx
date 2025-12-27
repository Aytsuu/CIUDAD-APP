import { View, Text, StyleSheet } from 'react-native';
import { FileText, CheckCircle2, Check, Activity } from 'lucide-react-native';

export const StatusStepper = ({
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
    { label: "Reported", icon: FileText },
    { label: "In Progress", icon: Activity },
    { label: "Resolved", icon: CheckCircle2 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepperWrapper}>
        {/* Steps Container - positioned first to establish layout */}
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
              <View key={step.label} style={styles.stepContainer}>
                <View style={circleStyle}>
                  {isCompleted || (isResolved && isFinal) ? (
                    <Check size={16} color={iconColor} />
                  ) : (
                    <Icon size={16} color={iconColor} />
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isResolved && styles.labelGreen,
                  ]}
                  className='text-xs'
                >
                  {step.label}
                </Text>
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
      {/* Spacer for labels */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    marginBottom: 8,
  },
  stepperWrapper: {
    position: 'relative',
    width: '100%',
  },
  lineContainer: {
    position: 'absolute',
    left: '16%', // Start from center of first circle (16px padding + half of flex space)
    right: '16%', // End at center of last circle
    top: 16, // Aligns with center of circle (32px height / 2)
    height: 4,
  },
  backgroundLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
  },
  progressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
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
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
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
  label: {
    marginTop: 8,
    fontFamily: 'GeneralSans-Medium',
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  labelActive: {
    color: '#1f2937',
  },
  labelGreen: {
    color: '#15803d',
  },
  spacer: {
    height: 8,
  },
});