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
<<<<<<< HEAD
    name: string
=======
    name: React.ReactNode
>>>>>>> frontend/feature/treasurer
  }

  interface SelectProps{
    placeholder: string
<<<<<<< HEAD
    label?: string,
    className?: string,
=======
    label: string,
    className: string,
>>>>>>> frontend/feature/treasurer
    options: Option[],
    value: string,
    onChange: (value: string) => void
  }
   
<<<<<<< HEAD
  export function SelectLayout({ placeholder, label, className, options, value, onChange }: SelectProps) {

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn("w-[180px]", className)}>
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
=======
  export function SelectLayout({placeholder, label, className, options, value, onChange}: SelectProps) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-[180px]", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup> 
            <SelectLabel>{label}</SelectLabel>
            {options.map((option)=>{
                return <SelectItem key={option.id} value={option.id} className="cursor-pointer">{option.name}</SelectItem>
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
>>>>>>> frontend/feature/treasurer
