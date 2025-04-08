import React from "react";
import { View, TextInput, Text, Button } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 
import * as z from "zod";

// Validation schema
const schema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email address"),
});

export default function Sample() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),  
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Name Input */}
      <Text>Name:</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Enter your name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text style={{ color: "red" }}>{errors.name.message}</Text>}

      {/* Email Input */}
      <Text>Email:</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}

      {/* Submit Button */}
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
