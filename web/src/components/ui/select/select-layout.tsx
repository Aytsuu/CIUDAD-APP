import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select/select"
import { cn } from "@/lib/utils"

interface Option{
  id: string,
  name: string
}

interface SelectProps{
  placeholder: string
  label?: string,
  className?: string,
  options: Option[],
  value: string,
  onChange: (value: string) => void
}
 
export function SelectLayout({ placeholder, label, className, options, value, onChange }: SelectProps) {

  return (
      <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cn("w-full", className)}>
              <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
              <SelectGroup>
                  <SelectLabel>{label}</SelectLabel>
                  {options.map((option) => {
                      return <SelectItem key={option.id} value={option.id} className="cursor-pointer">{option.name}</SelectItem>
                  })}
              </SelectGroup>
          </SelectContent>
      </Select>
  )
}
