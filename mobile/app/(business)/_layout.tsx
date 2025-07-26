import { BusinessFormProvider } from "@/contexts/BusinessFormContext"
import { BusinessFormSchema } from "@/form-schema/business-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { zodResolver } from "@hookform/resolvers/zod"
import { Stack } from "expo-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

export type BusinessFormType = z.infer<typeof BusinessFormSchema> 
export default () => {
  const form = useForm<BusinessFormType>({
    resolver: zodResolver(BusinessFormSchema),
    defaultValues: generateDefaultValues(BusinessFormSchema)
  })

  return (
    <BusinessFormProvider methods={form}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="add-business" options={{ headerShown: false }} />
      </Stack>
    </BusinessFormProvider>
  )
}