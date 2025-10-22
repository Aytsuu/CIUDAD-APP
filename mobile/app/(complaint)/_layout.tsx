import { Stack } from "expo-router";
import { useForm } from "react-hook-form";
import { complaintFormSchema } from "@/form-schema/complaint-schema";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { ComplaintFormProvider } from "@/contexts/ComplaintFormContext";

type ComplaintForm = z.infer<typeof complaintFormSchema>;
const defaultValues = generateDefaultValues(complaintFormSchema)

export default () => {
  const methods = useForm<ComplaintForm>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues
  })

  return (
    <ComplaintFormProvider methods={methods}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false}} />
          <Stack.Screen name="complaint-form" options={{ headerShown: false}} />
          <Stack.Screen name="complaint/[id]" options={{ headerShown: false}} />
          <Stack.Screen name="summon-payment" options={{ headerShown: false}} />
          <Stack.Screen name="summon-details" options={{ headerShown: false}} />
        </Stack>
    </ComplaintFormProvider>
  )
}