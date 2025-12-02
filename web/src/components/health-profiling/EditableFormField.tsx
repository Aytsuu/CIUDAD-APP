import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox'

interface EditableFormFieldProps {
  label: string;
  value: any;
  isEditing: boolean;
  onChange?: (value: any) => void;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'combobox';
  options?: { value: string; label: string }[] | { id: string; name: string | React.ReactNode }[];
  className?: string;
  placeholder?: string;
  emptyMessage?: string;
}

export const EditableFormField = ({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  options = [],
  className = '',
  placeholder = '',
  emptyMessage = 'No options found',
}: EditableFormFieldProps) => {
  // Read-only mode
  if (!isEditing) {
    return (
      <div className={`space-y-1 ${className}`}>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-sm text-gray-800">
          {value || <span className="text-gray-400">Not provided</span>}
        </p>
      </div>
    );
  }

  // Edit mode
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || label}
            className="min-h-[80px]"
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value || option.id} value={option.value || option.id}>
                  {option.label || option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'combobox':
        return (
          <Combobox
            options={options as { id: string; name: string | React.ReactNode }[]}
            value={value || ''}
            onChange={(newValue: string | undefined) => onChange?.(newValue || '')}
            placeholder={placeholder || `Search ${label.toLowerCase()}...`}
            emptyMessage={emptyMessage}
            triggerClassName="w-full h-10"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || label}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || label}
          />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {renderInput()}
    </div>
  );
};
