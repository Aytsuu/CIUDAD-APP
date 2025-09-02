import { cn } from "@/lib/utils"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Control } from "react-hook-form"

type OptionItem = {
  value: string
  title: string
  subtitle?: string
  description?: string
}

interface RadioCardGroupProps {
  name: string
  control: Control<any>
  options: OptionItem[]
  columns?: 1 | 2 | 3 | 4
  onChange?: (value: string) => void
}

export function RadioCardGroup({
  name,
  control,
  options,
  columns = 3,
  onChange,
}: RadioCardGroupProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value)
                onChange?.(value)
              }}
              value={field.value || ""} // Ensure there's always a default value
              className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "p-4 border rounded-md transition-all duration-200 cursor-pointer hover:shadow-md",
                    field.value === option.value && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${name}-${option.value}`} 
                      className="mt-1" 
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor={`${name}-${option.value}`} className="font-semibold cursor-pointer">
                        {option.title}
                        {option.subtitle && (
                          <>
                            <br />
                            {option.subtitle}
                          </>
                        )}
                      </Label>
                      {option.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}