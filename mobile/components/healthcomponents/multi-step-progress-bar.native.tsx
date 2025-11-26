import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface MultiStepProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  variant?: "linear" | "dots" | "numbers";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MultiStepProgressBar({
  steps,
  currentStep,
  onStepClick,
  variant = "linear",
  size = "md",
}: MultiStepProgressBarProps) {
  const isCompleted = (index: number) => index < currentStep;
  const isCurrent = (index: number) => index === currentStep;
  const isClickable = (index: number) => index <= currentStep;

  const sizeConfig = {
    sm: { circle: 28, icon: 14, text: 11, label: 11 },
    md: { circle: 36, icon: 16, text: 13, label: 12 },
    lg: { circle: 44, icon: 18, text: 15, label: 14 },
  };

  const config = sizeConfig[size];

  // Dots Variant - Horizontal compact view
  if (variant === "dots") {
    return (
      <View style={styles.container}>
        <View style={styles.dotsWrapper}>
          {steps.map((step, index) => {
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const clickable = isClickable(index);

            return (
              <View key={step.id} style={styles.dotItem}>
                <TouchableOpacity
                  onPress={() => clickable && onStepClick?.(index)}
                  disabled={!clickable}
                  activeOpacity={clickable ? 0.7 : 1}
                  style={[
                    styles.dotCircle,
                    {
                      width: config.circle,
                      height: config.circle,
                      borderRadius: config.circle / 2,
                    },
                    completed && styles.completedCircle,
                    current && styles.currentCircle,
                    !completed && !current && styles.inactiveCircle,
                  ]}
                >
                  {completed ? (
                    <Check size={config.icon} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <Text
                      style={[
                        styles.circleNumber,
                        { fontSize: config.text },
                        (completed || current) && styles.activeNumber,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </TouchableOpacity>
                
                <Text
                  style={[
                    styles.dotLabel,
                    { fontSize: config.label },
                    current && styles.activeDotLabel,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Numbers Variant - With connecting lines
  if (variant === "numbers") {
    return (
      <View style={styles.container}>
        <View style={styles.numbersRow}>
          {steps.map((step, index) => {
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const clickable = isClickable(index);
            const showLine = index < steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <View style={styles.numberStepContainer}>
                  <TouchableOpacity
                    onPress={() => clickable && onStepClick?.(index)}
                    disabled={!clickable}
                    activeOpacity={clickable ? 0.7 : 1}
                    style={[
                      styles.numberCircle,
                      {
                        width: config.circle,
                        height: config.circle,
                        borderRadius: config.circle / 2,
                      },
                      completed && styles.completedCircle,
                      current && styles.currentCircle,
                      !completed && !current && styles.inactiveCircle,
                    ]}
                  >
                    {completed ? (
                      <Check size={config.icon} color="#fff" strokeWidth={2.5} />
                    ) : (
                      <Text
                        style={[
                          styles.circleNumber,
                          { fontSize: config.text },
                          (completed || current) && styles.activeNumber,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.numberLabelContainer}>
                    <Text
                      style={[
                        styles.numberLabel,
                        { fontSize: config.label },
                        current && styles.activeLabel,
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                    {step.description && (
                      <Text
                        style={[
                          styles.numberDescription,
                          { fontSize: config.label - 2 },
                        ]}
                        numberOfLines={1}
                      >
                        {step.description}
                      </Text>
                    )}
                  </View>
                </View>

                {showLine && (
                  <View style={styles.lineContainer}>
                    <View
                      style={[
                        styles.connectionLine,
                        completed && styles.completedLine,
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }

  // Linear Variant - Traditional progress bar
  return (
    <View style={styles.container}>
      <View style={styles.linearProgressBar}>
        <View
          style={[
            styles.linearProgressFill,
            {
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.linearStepsRow}>
        {steps.map((step, index) => {
          const completed = isCompleted(index);
          const current = isCurrent(index);
          const clickable = isClickable(index);

          return (
            <View key={step.id} style={styles.linearStepContainer}>
              <TouchableOpacity
                onPress={() => clickable && onStepClick?.(index)}
                disabled={!clickable}
                activeOpacity={clickable ? 0.7 : 1}
                style={[
                  styles.linearCircle,
                  {
                    width: config.circle,
                    height: config.circle,
                    borderRadius: config.circle / 2,
                  },
                  completed && styles.completedCircle,
                  current && styles.currentCircle,
                  !completed && !current && styles.inactiveCircle,
                ]}
              >
                {completed ? (
                  <Check size={config.icon} color="#fff" strokeWidth={2.5} />
                ) : (
                  <Text
                    style={[
                      styles.circleNumber,
                      { fontSize: config.text },
                      (completed || current) && styles.activeNumber,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.linearLabel,
                  { fontSize: config.label },
                  current && styles.activeLabel,
                ]}
                numberOfLines={2}
              >
                {step.label}
              </Text>

              {step.description && (
                <Text
                  style={[
                    styles.linearDescription,
                    { fontSize: config.label - 2 },
                  ]}
                  numberOfLines={2}
                >
                  {step.description}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  // Dots Variant
  dotsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 12,
  },
  dotItem: {
    alignItems: "center",
    maxWidth: 80,
  },
  dotCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  dotLabel: {
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
    color: "#6B7280",
  },
  activeDotLabel: {
    color: "#2563EB",
    fontWeight: "600",
  },

  // Numbers Variant
  numbersRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  numberStepContainer: {
    alignItems: "center",
    flex: 1,
    minWidth: 0, // Allow flex items to shrink below content size
  },
  numberCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  numberLabelContainer: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 2,
  },
  numberLabel: {
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
    width: "100%",
  },
  numberDescription: {
    marginTop: 2,
    textAlign: "center",
    color: "#9CA3AF",
    width: "100%",
  },
  lineContainer: {
    flex: 0.5,
    paddingTop: 18,
    paddingHorizontal: 2,
  },
  connectionLine: {
    height: 2,
    backgroundColor: "#E5E7EB",
  },

  // Linear Variant
  linearProgressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  linearProgressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },
  linearStepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  linearStepContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  linearCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  linearLabel: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
  },
  linearDescription: {
    marginTop: 2,
    textAlign: "center",
    color: "#9CA3AF",
  },

  // Shared Styles
  completedCircle: {
    backgroundColor: "#10B981",
  },
  currentCircle: {
    backgroundColor: "#2563EB",
    borderWidth: 3,
    borderColor: "#BFDBFE",
  },
  inactiveCircle: {
    backgroundColor: "#E5E7EB",
  },
  circleNumber: {
    fontWeight: "700",
    color: "#9CA3AF",
  },
  activeNumber: {
    color: "#FFFFFF",
  },
  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },
  completedLine: {
    backgroundColor: "#10B981",
  },
});