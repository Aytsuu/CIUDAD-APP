import { Stack } from "expo-router";
import { useForm } from "react-hook-form";
import { RegistrationFormSchema } from '@/form-schema/registration-schema';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { RegistationFormProvider } from "@/contexts/RegistrationFormContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { RegistrationTypeProvider } from "@/contexts/RegistrationTypeContext";
import React from "react";

type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
const defaultValues = generateDefaultValues(RegistrationFormSchema)

export default () => {

  const methods = useForm<RegistrationForm>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues
  })

  return (
      <ProgressProvider>
        <RegistrationTypeProvider>
          <RegistationFormProvider methods={methods}>
            <Stack>
              <Stack.Screen name="settings/index" options={{ headerShown: false}}/>
              <Stack.Screen name="settings/change-phone" options={{ headerShown: false, animation: 'fade'}}/>
              <Stack.Screen name="settings/change-email" options={{ headerShown: false, animation: 'fade'}}/>
              <Stack.Screen name="settings/change-password" options={{ headerShown: false, animation: 'fade'}}/>
              <Stack.Screen name="settings/personal-info" options={{ headerShown: false}}/>
              <Stack.Screen name="about" options={{ headerShown: false}}/>
              <Stack.Screen name="support" options={{ headerShown: false}}/>
              <Stack.Screen name="app-rating" options={{ headerShown: false}}/>
            </Stack>
          </RegistationFormProvider>
        </RegistrationTypeProvider>
      </ProgressProvider>
  );
};
