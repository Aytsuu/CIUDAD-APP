import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { cn } from "@/lib/utils"

interface Step {
  id: string | number
  label: string
  description?: string
}

interface MultiStepProgressBarProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  variant?: "linear" | "dots" | "numbers"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MultiStepProgressBar({
  steps,
  currentStep,
  onStepClick,          
  variant = "linear",
  size = "md",
  className,
}: MultiStepProgressBarProps) {
  const isCompleted = (index: number) => index < currentStep
  const isCurrent = (index: number) => index === currentStep

  // Size configurations - using numeric values for React Native
  const sizeConfig = {
    sm: {
      dotSize: 24,
      fontSize: 12,
      lineHeight: 4,
      gap: 4,
      numberSize: 20,
    },
    md: {
      dotSize: 40,
      fontSize: 14,
      lineHeight: 8,
      gap: 8,
      numberSize: 32,
    },
    lg: {
      dotSize: 56,
      fontSize: 16,
      lineHeight: 10,
      gap: 12,
      numberSize: 40,
    },
  }

  const config = sizeConfig[size]

  if (variant === "dots") {
    return (
      <View style={styles.container}>
        <View style={[styles.dotsContainer, { gap: config.gap }]}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.dotStep}>
              <TouchableOpacity
                onPress={() => onStepClick?.(index)}
                style={[
                  styles.dot,
                  {
                    height: config.dotSize,
                    width: config.dotSize,
                    borderRadius: config.dotSize / 2,
                  },
                  isCompleted(index) && styles.completedDot,
                  isCurrent(index) && styles.currentDot,
                  !isCompleted(index) && !isCurrent(index) && styles.inactiveDot,
                ]}
              >
                <Text style={[
                  styles.dotText,
                  { fontSize: config.fontSize },
                  (isCompleted(index) || isCurrent(index)) && styles.activeDotText,
                ]}>
                  {isCompleted(index) ? "✓" : index + 1}
                </Text>
              </TouchableOpacity>
              {step.label && (
                <Text style={[
                  styles.label,
                  { fontSize: config.fontSize, marginTop: 8 },
                  isCurrent(index) && styles.currentLabel,
                ]}>
                  {step.label}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  if (variant === "numbers") {
    return (
      <View style={[styles.container, styles.paddedContainer]}>
        <View style={styles.numbersContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.numberStep}>
              <View style={styles.numberStepRow}>
                <TouchableOpacity
                  onPress={() => onStepClick?.(index)}
                  style={[
                    styles.numberCircle,
                    {
                      height: config.numberSize,
                      width: config.numberSize,
                      borderRadius: config.numberSize / 2,
                    },
                    isCompleted(index) && styles.completedNumber,
                    isCurrent(index) && styles.currentNumber,
                    !isCompleted(index) && !isCurrent(index) && styles.inactiveNumber,
                  ]}
                >
                  <Text style={[
                    styles.numberText,
                    { fontSize: config.fontSize },
                    (isCompleted(index) || isCurrent(index)) && styles.activeNumberText,
                  ]}>
                    {isCompleted(index) ? "✓" : index + 1}
                  </Text>
                </TouchableOpacity>
                {index < steps.length - 1 && (
                  <View 
                    style={[
                      styles.line,
                      { height: config.lineHeight, marginLeft: 8 },
                      index < currentStep && styles.completedLine,
                      index >= currentStep && styles.inactiveLine,
                    ]}
                  />
                )}
              </View>
              {step.label && (
                <Text style={[styles.numberLabel, { fontSize: config.fontSize, marginTop: 12 }]}>
                  {step.label}
                </Text>
              )}
              {step.description && (
                <Text style={[styles.description, { marginTop: 4 }]}>
                  {step.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    )
  }

  // Default: Linear variant
  return (
    <View style={styles.container}>
      {/* Progress bar background */}
      <View style={[styles.progressBarBg, { height: config.lineHeight, marginBottom: 24 }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              height: config.lineHeight,
            },
          ]}
        />
      </View>

      {/* Step labels */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.step}>
            <View style={[styles.stepCircleContainer, { marginBottom: 8 }]}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    height: config.numberSize,
                    width: config.numberSize,
                    borderRadius: config.numberSize / 2,
                  },
                  isCompleted(index) && styles.completedStep,
                  isCurrent(index) && styles.currentStep,
                  !isCompleted(index) && !isCurrent(index) && styles.inactiveStep,
                ]}
              >
                <Text style={[
                  styles.stepText,
                  { fontSize: config.fontSize },
                  (isCompleted(index) || isCurrent(index)) && styles.activeStepText,
                ]}>
                  {isCompleted(index) ? "✓" : index + 1}
                </Text>
              </View>
            </View>
            {step.label && (
              <Text style={[styles.stepLabel, { fontSize: config.fontSize }]}>
                {step.label}
              </Text>
            )}
            {step.description && (
              <Text style={[styles.stepDescription, { marginTop: 4 }]}>
                {step.description}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paddedContainer: {
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotStep: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dot: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedDot: {
    backgroundColor: '#2563EB',
  },
  currentDot: {
    backgroundColor: '#2563EB',
    borderWidth: 4,
    borderColor: '#BFDBFE',
  },
  inactiveDot: {
    backgroundColor: '#E5E7EB',
  },
  dotText: {
    fontWeight: '600',
  },
  activeDotText: {
    color: '#FFFFFF',
  },
  label: {
    textAlign: 'center',
    fontWeight: '500',
  },
  currentLabel: {
    color: '#2563EB',
  },
  numbersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  numberStep: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  numberStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  numberCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  completedNumber: {
    backgroundColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentNumber: {
    backgroundColor: '#2563EB',
    borderWidth: 4,
    borderColor: '#BFDBFE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  inactiveNumber: {
    backgroundColor: '#D1D5DB',
  },
  numberText: {
    fontWeight: '600',
  },
  activeNumberText: {
    color: '#FFFFFF',
  },
  numberLabel: {
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
  },
  description: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    maxWidth: 96,
  },
  line: {
    flex: 1,
  },
  completedLine: {
    backgroundColor: '#16A34A',
  },
  inactiveLine: {
    backgroundColor: '#D1D5DB',
  },
  progressBarBg: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#2563EB',
    borderRadius: 9999,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  step: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: '#2563EB',
  },
  currentStep: {
    backgroundColor: '#2563EB',
    borderWidth: 4,
    borderColor: '#BFDBFE',
  },
  inactiveStep: {
    backgroundColor: '#D1D5DB',
  },
  stepText: {
    fontWeight: '600',
  },
  activeStepText: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
  },
  stepDescription: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    maxWidth: 96,
  },
})
