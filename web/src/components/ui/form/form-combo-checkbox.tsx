// "use client"

// import React, { useRef, useState, useEffect } from "react"
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Button } from "@/components/ui/button/button"
// import { Check, ChevronsUpDown, X } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Badge } from "@/components/ui/badge"

// // Reusable Form Select Component with Checkbox support
// export const FormComboCheckbox = React.memo(
//   ({
//     control,
//     name,
//     label,
//     options,
//     readOnly,
//     placeholder = "Select options",
//     showBadges = false,
//     maxDisplayValues = 2,
//   }: {
//     control: any
//     name: string
//     label?: string
//     options: { id: string; name: string }[]
//     readOnly?: boolean
//     placeholder?: string
//     showBadges?: boolean
//     maxDisplayValues?: number
//   }) => {
//     const triggerRef = useRef<HTMLButtonElement>(null)
//     const [triggerWidth, setTriggerWidth] = useState<number>(0)

//     // Update width when component mounts and on window resize
//     useEffect(() => {
//       const updateWidth = () => {
//         if (triggerRef.current) {
//           setTriggerWidth(triggerRef.current.offsetWidth)
//         }
//       }

//       // Initial width
//       updateWidth()

//       // Update on resize
//       window.addEventListener("resize", updateWidth)

//       return () => {
//         window.removeEventListener("resize", updateWidth)
//       }
//     }, [])

//     return (
//       <FormField
//         control={control}
//         name={name}
//         render={({ field }) => {
//           // Convert field.value to array if it's not already
//           const selectedValues = Array.isArray(field.value) ? field.value : field.value ? [field.value] : []

//           // Handle checkbox toggle
//           const toggleOption = (optionId: string) => {
//             const newValues = selectedValues.includes(optionId.toLowerCase())
//               ? selectedValues.filter((val) => val !== optionId.toLowerCase())
//               : [...selectedValues, optionId.toLowerCase()]

//             field.onChange(newValues)
//           }

//           // Clear all selections
//           const clearSelections = (e: React.MouseEvent) => {
//             e.stopPropagation()
//             field.onChange([])
//           }

//           // Get selected options
//           const selectedOptions = options.filter((option) => selectedValues.includes(option.id.toLowerCase()))

//           // Format selected values for display
//           const getDisplayText = () => {
//             if (selectedOptions.length === 0) return ""

//             if (selectedOptions.length <= maxDisplayValues) {
//               return selectedOptions.map((opt) => opt.name).join(", ")
//             }

//             return `${selectedOptions
//               .slice(0, maxDisplayValues)
//               .map((opt) => opt.name)
//               .join(", ")} +${selectedOptions.length - maxDisplayValues} more`
//           }

//           return (
//             <FormItem className="w-full">
//               <FormLabel className="text-black/70">{label}</FormLabel>
//               <FormControl>
//                 {!readOnly ? (
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button
//                         ref={triggerRef}
//                         variant="outline"
//                         role="combobox"
//                         className={cn("w-full justify-between", !selectedValues.length && "text-muted-foreground")}
//                       >
//                         <div className="flex flex-wrap items-center gap-1 overflow-hidden">
//                           {showBadges && selectedOptions.length > 0 ? (
//                             <div className="flex flex-wrap gap-1 max-w-[90%]">
//                               {selectedOptions.slice(0, maxDisplayValues).map((option) => (
//                                 <Badge key={option.id} variant="secondary" className="text-xs">
//                                   {option.name}
//                                 </Badge>
//                               ))}
//                               {selectedOptions.length > maxDisplayValues && (
//                                 <Badge variant="secondary" className="text-xs">
//                                   +{selectedOptions.length - maxDisplayValues} more
//                                 </Badge>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="truncate">{getDisplayText() || placeholder}</span>
//                           )}
//                         </div>
//                         <div className="flex">
//                           {selectedValues.length > 0 && (
//                             <X
//                               className="mr-1 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
//                               onClick={clearSelections}
//                             />
//                           )}
//                           <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
//                         </div>
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent
//                       className="p-0"
//                       style={{ width: `${Math.max(triggerWidth, 200)}px` }}
//                       align="start"
//                       sideOffset={5}
//                     >
//                       <Command>
//                         <CommandInput placeholder="Search options..." />
//                         <CommandList>
//                           <CommandEmpty>No options found.</CommandEmpty>
//                           <CommandGroup className="max-h-64 overflow-auto">
//                             {options.map((option) => (
//                               <CommandItem
//                                 key={option.id}
//                                 onSelect={() => toggleOption(option.id)}
//                                 className="flex items-center gap-2"
//                               >
//                                 <Checkbox
//                                   checked={selectedValues.includes(option.id.toLowerCase())}
//                                   onCheckedChange={() => toggleOption(option.id)}
//                                   id={`${name}-${option.id}`}
//                                 />
//                                 <label htmlFor={`${name}-${option.id}`} className="flex-1 cursor-pointer">
//                                   {option.name}
//                                 </label>
//                                 {selectedValues.includes(option.id.toLowerCase()) && (
//                                   <Check className="ml-auto h-4 w-4" />
//                                 )}
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </CommandList>
//                       </Command>
//                     </PopoverContent>
//                   </Popover>
//                 ) : (
//                   <Input value={getDisplayText()} readOnly />
//                 )}
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )
//         }}
//       />
//     )
//   },
// )

// FormComboCheckbox.displayName = "FormComboCheckbox"

"use client"

import React, { useRef, useState, useEffect } from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button/button"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Reusable Form Select Component with Checkbox support
export const FormComboCheckbox   = React.memo(
  ({
    control,
    name,
    label,
    options,
    readOnly,
    placeholder = "Select options",
    showBadges = false,
    maxDisplayValues = 2,
  }: {
    control: any
    name: string
    label?: string
    options: OptionType[]
    readOnly?: boolean
    placeholder?: string
    showBadges?: boolean
    maxDisplayValues?: number
  }) => {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [triggerWidth, setTriggerWidth] = useState<number>(0)

    useEffect(() => {
      const updateWidth = () => {
        if (triggerRef.current) {
          setTriggerWidth(triggerRef.current.offsetWidth)
        }
      }

      updateWidth()
      window.addEventListener("resize", updateWidth)
      return () => {
        window.removeEventListener("resize", updateWidth)
      }
    }, [])

    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          const selectedValues = Array.isArray(field.value) ? field.value : field.value ? [field.value] : []

          const toggleOption = (optionId: string) => {
            const option = options.find((o) => o.id === optionId)
            if (option?.disabled) return

            const newValues = selectedValues.includes(optionId.toLowerCase())
              ? selectedValues.filter((val) => val !== optionId.toLowerCase())
              : [...selectedValues, optionId.toLowerCase()]

            field.onChange(newValues)
          }

          const clearSelections = (e: React.MouseEvent) => {
            e.stopPropagation()
            field.onChange([])
          }

          const selectedOptions = options.filter((option) => selectedValues.includes(option.id.toLowerCase()))

          const getDisplayText = () => {
            if (selectedOptions.length === 0) return ""

            if (selectedOptions.length <= maxDisplayValues) {
              return selectedOptions.map((opt) => opt.name).join(", ")
            }

            return `${selectedOptions
              .slice(0, maxDisplayValues)
              .map((opt) => opt.name)
              .join(", ")} +${selectedOptions.length - maxDisplayValues} more`
          }

          return (
            <FormItem className="w-full">
              <FormLabel className="text-black/70">{label}</FormLabel>
              <FormControl>
                {!readOnly ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        ref={triggerRef}
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !selectedValues.length && "text-muted-foreground")}
                      >
                        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                          {showBadges && selectedOptions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[90%]">
                              {selectedOptions.slice(0, maxDisplayValues).map((option) => (
                                <Badge key={option.id} variant="secondary" className="text-xs">
                                  {option.name}
                                </Badge>
                              ))}
                              {selectedOptions.length > maxDisplayValues && (
                                <Badge variant="secondary" className="text-xs">
                                  +{selectedOptions.length - maxDisplayValues} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="truncate">{getDisplayText() || placeholder}</span>
                          )}
                        </div>
                        <div className="flex">
                          {selectedValues.length > 0 && (
                            <X
                              className="mr-1 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                              onClick={clearSelections}
                            />
                          )}
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0"
                      style={{ width: `${Math.max(triggerWidth, 200)}px` }}
                      align="start"
                      sideOffset={5}
                    >
                      <Command>
                        <CommandInput placeholder="Search options..." />
                        <CommandList>
                          <CommandEmpty>No options found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                              <CommandItem
                                key={option.id}
                                onSelect={() => toggleOption(option.id)}
                                className={cn("flex items-center gap-2", option.disabled && "opacity-50 pointer-events-none")}
                              >
                                <Checkbox
                                  checked={selectedValues.includes(option.id.toLowerCase())}
                                  onCheckedChange={() => toggleOption(option.id)}
                                  id={`${name}-${option.id}`}
                                  disabled={option.disabled}
                                />
                                <label
                                  htmlFor={`${name}-${option.id}`}
                                  className={cn("flex-1 cursor-pointer", option.disabled && "cursor-not-allowed")}
                                >
                                  {option.name}
                                </label>
                                {selectedValues.includes(option.id.toLowerCase()) && !option.disabled && (
                                  <Check className="ml-auto h-4 w-4" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input value={getDisplayText()} readOnly />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  },
)

FormComboCheckbox.displayName = "FormComboCheckbox"
