import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import StrokePop from "@/assets/animated/StrokePop.json";
import Popup from "@/assets/animated/PopUp.json";
import CircletoMap from "@/assets/animated/CircletoMap.json";
import MaptoMap from "@/assets/animated/MaptoMap.json";
import SlideUpBrush from "@/assets/animated/SlideUpBrush.json";
import PaintBrush from "@/assets/animated/PaintBrush.json";
import LottieView from "lottie-react-native";

interface IntroScreenProps {
  onAnimationFinish: () => void;
}

const IntroScreen = ({ onAnimationFinish }: IntroScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 20000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={CircletoMap}
        autoPlay
        speed={0.5}
        loop={true}
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
