import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select/select"

  interface Option{
    id: string,
    name: string
  }

  interface SelectProps{
    label: string,
    placeholder: string
    options: Option[],
    value: string,
    onChange: (value: string) => void
  }
   
  export function SelectLayout({label, placeholder, options, value, onChange}: SelectProps) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option)=>{
                return <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }