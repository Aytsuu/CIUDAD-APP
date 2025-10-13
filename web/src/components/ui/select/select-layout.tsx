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
import { RotateCcw } from "lucide-react"

interface Option{
  id: string,
  name: string
}

interface SelectProps{
  placeholder: string
  label?: string,
  className?: string,
  options: Option[],
  value?: string,
  onChange: (value: string) => void
}
 
export function SelectLayout({ placeholder, label, className, options, value, onChange }: SelectProps) {

  return (
      <Select value={value && value.length > 0 ? value : undefined} onValueChange={onChange}>
          <SelectTrigger className={cn("w-full", className)}>
              <SelectValue placeholder={placeholder} />
          </SelectTrigger> 
          <SelectContent>
              <SelectGroup>
                  <SelectLabel className="flex justify-between">
                    <p>{label}</p>
                    <div className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-black/90"
                      onClick={() => onChange("")}
                    >
                      <RotateCcw size={14}/>
                      Reset
                    </div>
                  </SelectLabel>
                  {options.map((option) => {
                      return <SelectItem key={option?.id} value={option?.id} className="cursor-pointer">{option?.name}</SelectItem>
                  })}
              </SelectGroup>
          </SelectContent>
      </Select>
  )
}
