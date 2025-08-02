// import { View, Text } from 'react-native';
// import { Input } from '../input';
// import { Controller, Control } from 'react-hook-form';
// import { capitalize } from '@/helpers/capitalize';

// interface FormInputProps {
//   control: Control<any>;
//   name: string;
//   label?: string;
//   placeholder?: string;
//   secureTextEntry?: boolean;
//   keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
//   returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
//   submitBehavior?: 'submit' | 'newline' | 'blurAndSubmit';
//   editable?: boolean;
// }

// export const FormInput = ({
//   control,
//   name,
//   label,
//   placeholder,
//   secureTextEntry,
//   keyboardType = 'default',
//   returnKeyType = 'next',
//   submitBehavior = 'newline',
//   editable = true,
// }: FormInputProps) => {
//   return (
//     <Controller
//       control={control}
//       name={name}
//       render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
//         <View className="mb-4">
//           {label && <Text className="text-[12px] font-PoppinsRegular">{label}</Text>}
//           <Input
//             className={`
//               h-[45px]
//               font-PoppinsRegular
//               bg-white
//               text-black
//               ${error ? 'border-red-500' : 'border-gray-300'}
//             `}
//             placeholder={placeholder}
//             placeholderTextColor="#888"
//             value={value|| ""}
//             onChangeText={onChange}
//             onBlur={onBlur}
//             secureTextEntry={secureTextEntry}
//             keyboardType={keyboardType}
//             returnKeyType={returnKeyType}
//             submitBehavior={submitBehavior}
//             editable={editable}
//           />
//           {error && (
//             <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
//           )}
//         </View>
//       )}
//     />
//   );
// };

import { View, Text } from 'react-native';
import { Input } from '../input';
import { Controller, Control } from 'react-hook-form';
import { capitalize } from '@/helpers/capitalize';

interface FormInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  submitBehavior?: 'submit' | 'newline' | 'blurAndSubmit';
  editable?: boolean;
  maxInput?: number; // New optional prop
}

export const FormInput = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  returnKeyType = 'next',
  submitBehavior = 'newline',
  editable = true,
  maxInput, // New prop
}: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        // Handle maxInput logic
        const handleChange = (text: string) => {
          if (maxInput !== undefined && text.length > maxInput) {
            return; // Don't update if exceeds max length
          }
          onChange(text);
        };

        return (
          <View className="mb-4">
            {label && <Text className="text-[12px] font-PoppinsRegular">{label}</Text>}
            <Input
              className={`
                h-[45px]
                font-PoppinsRegular
                bg-white
                text-black
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder={placeholder}
              placeholderTextColor="#888"
              value={value || ""}
              onChangeText={handleChange} // Use the custom handler
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              returnKeyType={returnKeyType}
              submitBehavior={submitBehavior}
              editable={editable}
              maxLength={maxInput} // Pass to native input
            />
            {maxInput && (
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {value?.length || 0}/{maxInput}
              </Text>
            )}
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
};
