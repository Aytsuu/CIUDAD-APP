import { ActivityIndicator, Text } from "react-native"
import { CheckCircle } from "@/lib/icons/CheckCircle"
import { Button } from "../button"

export const SubmitButton = ({
  submittingLabel = "Submitting...",
  buttonLabel = "Submit",
  isSubmitting,
  handleSubmit
} : {
  submittingLabel?: string
  buttonLabel?: string
  isSubmitting: boolean
  handleSubmit: () => void
}) => {
  return (
    <Button
      onPress={handleSubmit}
      disabled={isSubmitting}
      className={`min-h-[50px] rounded-full flex-row items-center justify-center ${
        isSubmitting ? "bg-gray-400" : "bg-primaryBlue"
      }`}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <CheckCircle size={20} className="text-white mr-2" />
      )}
      <Text className="text-white text-base font-semibold ml-2">
        {isSubmitting ? submittingLabel : buttonLabel}
      </Text>
    </Button>
  )
}