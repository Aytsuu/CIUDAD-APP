"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"

export const Combobox = React.memo(
  ({
    options,
    value,
    onChange,
    placeholder,
    customTrigger,
    contentClassName,
    triggerClassName,
    emptyMessage,
    staticVal,
    align,
    size,
    variant = "popover",
    modalTitle,
  }: {
    options: { id: string; name: React.ReactNode }[] 
    value: string
    onChange?: (value: string) => void
    placeholder?: string
    contentClassName?: string
    customTrigger?: React.ReactNode
    triggerClassName?: string
    emptyMessage?: React.ReactNode
    staticVal?: boolean;
    align?: "start" | "center" | "end"
    size?: number
    variant?: "popover" | "modal"
    modalTitle?: string
  }) => {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const [width, setWidth] = React.useState<number | null>(null)

    // Update width when popover opens or window resizes (only for popover variant)
    React.useEffect(() => {
      if (variant !== "popover") return

      const updateWidth = () => {
        if (triggerRef.current) {
          setWidth(triggerRef.current.getBoundingClientRect().width)
          if (size) setWidth(size)
        }
      }

      updateWidth()
      window.addEventListener("resize", updateWidth)

      return () => {
        window.removeEventListener("resize", updateWidth)
      }
    }, [open, variant, size])

    const triggerButton = customTrigger ? (
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {customTrigger}
      </div>
      ) : (
      <Button
        ref={triggerRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("h-15 justify-between text-black/80", triggerClassName)}
        onClick={() => setOpen(true)}
      > 
        {!staticVal ? (
          <>
            <div className="truncate text-left flex-1">
              {value ? options.find((option) => option.id === value)?.name : placeholder}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
          </>
        ) : (
          <div className="truncate text-left flex-1">
            {value}
          </div>
        )}
      </Button>
    )

    const commandContent = (
      <Command className="w-full">
        <CommandInput placeholder={placeholder} className="w-full" />
        <CommandList className={cn("max-h-[300px] overflow-auto", variant === "modal" && "max-h-[60vh]")}>
          <CommandEmpty>{emptyMessage}.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.id}
                onSelect={(currentValue) => {
                  onChange && onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className="flex items-center"
              >
                <Check
                  className={cn("mr-2 h-4 w-4 flex-shrink-0", value === option.id ? "opacity-100" : "opacity-0")}
                />
                <div className="flex-1 min-w-0">
                  {React.isValidElement(option.name)
                    ? React.cloneElement(option.name as React.ReactElement, {
                        className: cn(
                          "flex flex-wrap gap-2 items-center",
                          (option.name as React.ReactElement).props.className,
                        ),
                      })
                    : option.name}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    )

    if (variant === "modal") {
      return (
        <>
          {triggerButton}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTitle>
              
            </DialogTitle>
            <DialogContent 
              className={cn("sm:max-w-[425px] p-0", contentClassName)}
              style={{
                width: width ? `${width}px` : "min(100vw - 16px, 30rem)",
                maxWidth: "calc(100vw - 16px)",
              }}
            >
              {modalTitle && (
                <DialogHeader className="px-4 py-3 border-b">
                  <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
                </DialogHeader>
              )}
              <div className="p-0">
                {commandContent}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    }

    // Default popover variant
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent
          align={align || "center"}
          className={cn("p-0 w-full", contentClassName)}
          style={{
            width: width ? `${width}px` : "min(100vw - 16px, 30rem)",
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          {commandContent}
        </PopoverContent>
      </Popover>
    )
  },
)
