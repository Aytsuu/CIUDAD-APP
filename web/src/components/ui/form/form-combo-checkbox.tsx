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

export const FormComboCheckbox = React.memo(
  ({
    control,
    name,
    label,
    options,
    readOnly,
    placeholder = "Select options",
    showBadges = false,
    maxDisplayValues = 2,
    exclusiveOptionId,
  }: {
    control: any
    name: string
    label?: string
    options: any[]
    readOnly?: boolean
    placeholder?: string
    showBadges?: boolean
    maxDisplayValues?: number
    exclusiveOptionId?: string // Option that excludes all others when selected
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
          
          // Filter out disabled options for "All" logic
          const enabledOptions = options.filter((option) => !option.disabled)
          const enabledOptionIds = enabledOptions.map((opt) => opt.id.toLowerCase())
          
          // Check if all enabled options (excluding exclusive option) are selected
          const selectableOptionIds = exclusiveOptionId
            ? enabledOptionIds.filter((id) => id !== exclusiveOptionId.toLowerCase())
            : enabledOptionIds
          const allSelected = selectableOptionIds.length > 0 && selectableOptionIds.every((id) => selectedValues.includes(id))

          const toggleOption = (optionId: string) => {
            const option = options.find((o) => o.id === optionId)
            if (option?.disabled) return

            const isExclusiveOption = exclusiveOptionId && optionId.toLowerCase() === exclusiveOptionId.toLowerCase()
            const hasExclusiveOption = exclusiveOptionId && selectedValues.includes(exclusiveOptionId.toLowerCase())

            // If toggling the exclusive option
            if (isExclusiveOption) {
              // If already selected, deselect it
              if (selectedValues.includes(optionId.toLowerCase())) {
                field.onChange([])
              } else {
                // Select only the exclusive option, clearing all others
                field.onChange([optionId.toLowerCase()])
              }
              return
            }

            // If toggling a regular option while exclusive option is selected
            if (hasExclusiveOption) {
              // Replace exclusive option with the new selection
              field.onChange([optionId.toLowerCase()])
              return
            }

            // Normal toggle behavior for non-exclusive options
            const newValues = selectedValues.includes(optionId.toLowerCase())
              ? selectedValues.filter((val) => val !== optionId.toLowerCase())
              : [...selectedValues, optionId.toLowerCase()]

            field.onChange(newValues)
          }

          const toggleAll = () => {
            if (allSelected) {
              // Deselect all
              field.onChange([])
            } else {
              // Select all enabled options except the exclusive option
              const optionsToSelect = exclusiveOptionId
                ? enabledOptionIds.filter((id) => id !== exclusiveOptionId.toLowerCase())
                : enabledOptionIds
              field.onChange(optionsToSelect)
            }
          }

          const clearSelections = (e: React.MouseEvent) => {
            e.stopPropagation()
            field.onChange([])
          }

          const selectedOptions = options.filter((option) => selectedValues.includes(option.id.toLowerCase()))

          const getDisplayText = () => {
            if (selectedOptions.length === 0) return ""
            
            if (allSelected) return "All"

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
                              {allSelected ? (
                                <Badge variant="secondary" className="text-xs">
                                  All
                                </Badge>
                              ) : (
                                <>
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
                                </>
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
                        <CommandList 
                          className="max-h-64 overflow-auto"
                        >
                          <CommandEmpty>No options found.</CommandEmpty>
                          <CommandGroup>
                            {/* Select All Option */}
                            <CommandItem
                              key="all"
                              onSelect={toggleAll}
                              className="flex items-center gap-2 font-semibold border-b"
                            >
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={toggleAll}
                                id={`${name}-all`}
                              />
                              <label
                                htmlFor={`${name}-all`}
                                className="flex-1 cursor-pointer"
                              >
                                All
                              </label>
                              {allSelected && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                            
                            {/* Individual Options */}
                            {options.map((option) => {
                              const isExclusiveOption = exclusiveOptionId && option.id.toLowerCase() === exclusiveOptionId.toLowerCase()
                              const hasExclusiveOption = exclusiveOptionId && selectedValues.includes(exclusiveOptionId.toLowerCase())
                              const isDisabled = option.disabled || (hasExclusiveOption && !isExclusiveOption)
                              
                              return (
                                <CommandItem
                                  key={option.id}
                                  onSelect={() => toggleOption(option.id)}
                                  className={cn("flex items-center gap-2", isDisabled && "opacity-50 pointer-events-none")}
                                >
                                  <Checkbox
                                    checked={selectedValues.includes(option.id.toLowerCase())}
                                    onCheckedChange={() => toggleOption(option.id)}
                                    id={`${name}-${option.id}`}
                                    disabled={isDisabled}
                                  />
                                  <label
                                    htmlFor={`${name}-${option.id}`}
                                    className={cn("flex-1 cursor-pointer", isDisabled && "cursor-not-allowed")}
                                  >
                                    {option.name}
                                  </label>
                                  {selectedValues.includes(option.id.toLowerCase()) && !isDisabled && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              )
                            })}
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