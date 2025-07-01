import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "./button"
import { Text, View } from "react-native"

export const Confirmation = ({
  title, 
  description,
  onConfirm,
  onCancel
} : {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <SafeAreaView className="flex-1">
      <View>
        <Text>Confirmation</Text>
      </View>
      <View className="flex-1">
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
      <View>
        <Button onPress={onConfirm} className="bg-primaryBlue">
          <Text>Confirm</Text>
        </Button>
        <Button onPress={onCancel} variant={"outline"} className="bg-white">
          <Text>Cancel</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}