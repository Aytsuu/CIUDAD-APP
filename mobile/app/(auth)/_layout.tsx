import { Stack } from "expo-router";
import { useForm } from "react-hook-form";
import { RegistrationFormSchema } from '@/form-schema/registration-schema';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { RegistationFormProvider } from "@/contexts/RegistrationFormContext";
// import { AuthProvider } from "@/contexts/AuthContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { RegistrationTypeProvider } from "@/contexts/RegistrationTypeContext";
import { ToastProvider } from "@/components/ui/toast";
import React from "react";
import { KeychainService } from "@/services/keychainService";

type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
const defaultValues = generateDefaultValues(RegistrationFormSchema)

export default () => {

  const methods = useForm<RegistrationForm>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues
  })
  // React.useEffect(() => {
  //   (async () => {
  //     await KeychainService.removeRefreshToken();
  //     console.log("✅ Keychain cleared manually");
  //   })();
  // }, []);

  return (
      <ProgressProvider>
        <RegistrationTypeProvider>
          <RegistationFormProvider methods={methods}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="loginscreen" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/register-new" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/account-reg-new" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/respondent" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/father" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/mother" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/guardian" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/dependent" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/family/scan" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/link/verification" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/link/account-registration" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/individual/information" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/individual/scan" options={{ headerShown: false, animation: 'none' }} />
              <Stack.Screen name="registration/individual/account-reg" options={{ headerShown: false, animation: 'none' }} />     
            </Stack>
          </RegistationFormProvider>
        </RegistrationTypeProvider>
      </ProgressProvider>
  );
};