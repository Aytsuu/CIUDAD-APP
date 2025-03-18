import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<RadioGroupPrimitive.RootRef, RadioGroupPrimitive.RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root className={cn('web:grid gap-2', className)} {...props} ref={ref} />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<RadioGroupPrimitive.ItemRef, RadioGroupPrimitive.ItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'aspect-square h-6 w-6 native:h-6 native:w-6 rounded-full justify-center items-center border border-gray-300 bg-white text-primary web:ring-offset-background web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.disabled && 'web:cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
          <View className='aspect-square h-[13px] w-[13px] native:h-[13px] native:w-[13px] bg-primaryBlue rounded-full' />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

<<<<<<< HEAD
export { RadioGroup, RadioGroupItem };
=======
export { RadioGroup, RadioGroupItem };
>>>>>>> mobile/feature/landing-page
