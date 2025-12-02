import * as React from 'react';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from './radio-group';

export default function RadioButton({
  value,
  onLabelPress,
}: {
  value: string;
  onLabelPress: () => void;
}) {
  return (
    <View className={'flex-row gap-3 items-center'}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label 
        className="text-black font-PoppinsRegular"
        nativeID={`label-for-${value}`}
        onPress={onLabelPress}
      >
        {value}
      </Label>
    </View>
  );
}