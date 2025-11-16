import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Video from "react-native-video";
import { Asset } from "expo-asset";

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

  const handleReadyForDisplay = () => {
    setPaused(false);
    // Fade in smoothly when video is ready
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleVideoEnd = () => {
    // Fade out before finishing
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      onAnimationFinish();
    });
  };

  return (
    <View style={styles.container}>
      {isReady && (
        <Animated.View style={{ opacity: fadeAnim, width: "100%", height: 250 }}>
          <Video
            source={require("@/assets/animated/ciudad_intro.mp4")}
            style={{ width: "100%", height: 250 }}
            controls={false}
            resizeMode="cover"
            paused={paused}
            onReadyForDisplay={handleReadyForDisplay}
            onEnd={handleVideoEnd}
            repeat={false}
          />
        </Animated.View>
      )}
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