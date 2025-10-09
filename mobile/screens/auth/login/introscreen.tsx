import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Video from "react-native-video";

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
      <Video
        source={require("@/assets/animated/ciudad_intro.mp4")}
        style={{ width: "100%", height: 250 }}
        controls={false}
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
