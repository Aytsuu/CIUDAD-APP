import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Video from "react-native-video";

interface IntroScreenProps {
  onAnimationFinish: () => void;
}

const IntroScreen = ({ onAnimationFinish }: IntroScreenProps) => {
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [paused, setPaused] = React.useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const preload = async () => {
      await Asset.loadAsync(require("@/assets/animated/ciudad_intro.mp4"));
      setIsReady(true);
    };
    preload();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [isReady]);

  const handleReadyForDisplay = () => {
    setPaused(false);
    // Fade in smoothly when video is ready
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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