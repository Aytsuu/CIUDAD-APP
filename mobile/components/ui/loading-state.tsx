import LottieView from "lottie-react-native"
import { View } from "react-native"

export const LoadingState = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <LottieView 
        source={require('@/assets/animated/loading.json')}
        autoPlay
        loop
        style={{ width: 70, height: 70 }}
      />
    </View>
  )
}