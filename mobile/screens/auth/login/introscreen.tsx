import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
// import Video from "react-native-video";

interface IntroScreenProps {
  onAnimationFinish: () => void;
}

const IntroScreen = ({ onAnimationFinish }: IntroScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/Logo.png")}
        style={{ width: "100%", height: 250 }}
        resizeMode="contain"
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
