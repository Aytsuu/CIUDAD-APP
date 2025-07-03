import { ScrollView, Text } from "react-native"
import ScreenLayout from "../_ScreenLayout"

export default () => {
  return (
    <ScreenLayout
      showBackButton={false}
      showExitButton={false}
      headerBetweenAction={<Text className="text-[13px]">Account</Text>}
    >
      <ScrollView>

      </ScrollView>
    </ScreenLayout>
  )
}