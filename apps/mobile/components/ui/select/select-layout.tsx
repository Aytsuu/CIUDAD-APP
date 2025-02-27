import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';

type Option = {
  value: string
  label: string
}

type SelectLayoutProps = {
  className: string;
  contentClassName: string;
  options: Option[];
  selected: Option | undefined;
  onValueChange: (value: Option | undefined) => void;
};

export default function SelectLayout({ className, contentClassName, options, selected, onValueChange } : SelectLayoutProps) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <Select value={{value: selected?.value || '', label: selected?.label || ''}} onValueChange={onValueChange}>
      <SelectTrigger className={cn('native:h-[57px]', className)}>
        <SelectValue
          className='text-black text-sm native:text-lg'
          placeholder={selected?.value || ''}
        />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className={contentClassName}>
        <SelectGroup>
            {options.map((option) => (
                <SelectItem key={option.value} label={option.label} value={option.value}>
                    {option.label}
                </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}