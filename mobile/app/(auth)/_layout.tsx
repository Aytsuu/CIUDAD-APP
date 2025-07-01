import { Stack } from "expo-router";
import { useForm } from "react-hook-form";
import { RegistrationFormSchema } from '@/form-schema/registration-schema';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { RegistationFormProvider } from "@/contexts/RegistrationFormContext";
import { AuthProvider } from "@/contexts/AuthContext";

type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
const defaultValues = generateDefaultValues(RegistrationFormSchema)

export default () => {

  const methods = useForm<RegistrationForm>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues
  })

  return (
    <AuthProvider>
      <RegistationFormProvider methods={methods}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="verify-age" options={{ headerShown: false }} />
          <Stack.Screen name="validate-resident-id" options={{ headerShown: false }} />
          <Stack.Screen name="personal-information" options={{ headerShown: false }} />
          <Stack.Screen name="upload-id" options={{ headerShown: false }} />
          <Stack.Screen name="take-a-photo" options={{ headerShown: false }} />
          <Stack.Screen name="account-details" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }}  />
          <Stack.Screen name="verifyemail" options={{ headerShown: false }}  />
        </Stack>
      </RegistationFormProvider>
    </AuthProvider>
  );
};
