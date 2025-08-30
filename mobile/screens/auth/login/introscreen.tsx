import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import StrokePop from "@/assets/animated/StrokePop.json"
import LottieView from "lottie-react-native";

interface IntroScreenProps {
  onAnimationFinish: () => void;
}

const IntroScreen = ({ onAnimationFinish }: IntroScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 4000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={StrokePop}
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});