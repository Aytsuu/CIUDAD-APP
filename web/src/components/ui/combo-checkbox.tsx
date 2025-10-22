import React, { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button/button"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ComboCheckboxStandaloneProps {
  value?: string[]
  onChange?: (value: string[]) => void
  label?: string
  options: { id: string; name: string; disabled?: boolean }[]
  readOnly?: boolean
  placeholder?: string
  showBadges?: boolean
  maxDisplayValues?: number
}

export const ComboCheckboxStandalone = React.memo(
  ({
    value = [],
    onChange,
    label,
    options,
    readOnly = false,
    placeholder = "Select options",
    showBadges = false,
    maxDisplayValues = 2,
  }: ComboCheckboxStandaloneProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [triggerWidth, setTriggerWidth] = useState<number>(0)
    const [open, setOpen] = useState(false)

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

    const selectedValues = Array.isArray(value) ? value : value ? [value] : []

    const toggleOption = (optionId: string) => {
      const option = options.find((o) => o.id === optionId)
      if (option?.disabled) return

      const newValues = selectedValues.includes(optionId.toLowerCase())
        ? selectedValues.filter((val) => val !== optionId.toLowerCase())
        : [...selectedValues, optionId.toLowerCase()]

      onChange?.(newValues)
    }

    const clearSelections = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.([])
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
      <div className="w-full">
        {label && <label className="text-sm font-medium text-black/70 mb-2 block">{label}</label>}
        {!readOnly ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
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
                <CommandList 
                  className="max-h-64 overflow-auto"
                  onWheel={(e) => {
                    e.stopPropagation()
                    const el = e.currentTarget
                    if (e.deltaY > 0 && el.scrollTop >= el.scrollHeight - el.clientHeight) {
                      return
                    }
                    if (e.deltaY < 0 && el.scrollTop <= 0) {
                      return
                    }
                    e.preventDefault()
                    el.scrollTop += e.deltaY
                  }}
                >
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        onSelect={() => toggleOption(option.id)}
                        className={cn("flex items-center gap-2", option.disabled && "opacity-50 pointer-events-none")}
                      >
                        <Checkbox
                          checked={selectedValues.includes(option.id.toLowerCase())}
                          onCheckedChange={() => toggleOption(option.id)}
                          id={`combo-${option.id}`}
                          disabled={option.disabled}
                        />
                        <label
                          htmlFor={`combo-${option.id}`}
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
      </div>
    )
  },
)

ComboCheckboxStandalone.displayName = "ComboCheckboxStandalone"