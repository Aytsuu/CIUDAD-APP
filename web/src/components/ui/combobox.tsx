import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"

export const Combobox = 
({
  options,
  value,
  onChange,
  placeholder,
  customTrigger,
  contentClassName,
  triggerClassName,
  emptyMessage,
  staticVal = false,
  align,
  size,
  variant = "popover",
  modalTitle,
  modalTitleClassName,
  onSearchChange
}: {
  options: { id: string; name: React.ReactNode }[] 
  value: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  contentClassName?: string
  customTrigger?: React.ReactNode
  triggerClassName?: string
  emptyMessage?: React.ReactNode
  staticVal?: boolean;
  align?: "start" | "center" | "end"
  size?: number
  variant?: "popover" | "modal",
  modalTitleClassName?: string
  modalTitle?: string
  onSearchChange?: (value: string) => void
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

  // Handle selection with proper event handling
  const handleSelect = React.useCallback((currentValue: string) => {
    // Prevent event bubbling that might interfere with Dialog
    const newValue = currentValue === value ? undefined : currentValue
    onChange?.(newValue)
    setOpen(false)
  }, [value, onChange])

  const triggerButton = customTrigger ? (
    <div
      role="combobox"
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(true)
      }}
    >
      {customTrigger}
    </div>
    ) : (
    <Button
      ref={triggerRef}
      variant="outline"
      role="combobox"
      type="button"
      aria-expanded={open}
      className={cn("h-15 justify-between text-black/80", triggerClassName)}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(true)
      }}
    > 
      {!staticVal ? (
        <>
          <div className="truncate text-left flex-1">
            {value && value !== "undefined" ? options.find((option) => option.id === value)?.name : placeholder}
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
      <CommandInput placeholder={placeholder} className="w-full" onValueChange={onSearchChange}/>
      <CommandList className={cn("max-h-[300px] overflow-auto", variant === "modal" && "max-h-[60vh]")}>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options?.map((option) => (
            <CommandItem
              key={option.id}
              value={option.id}
              onSelect={handleSelect}
              className="flex items-center cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
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
          <DialogTitle hidden>    
          </DialogTitle>
          <DialogContent 
            className={cn("sm:max-w-[425px] p-0", contentClassName)}
            style={{
              width: width ? `${width}px` : "min(100vw - 16px, 30rem)",
              maxWidth: "calc(100vw - 16px)",
              zIndex: 100, // Higher z-index than parent dialog
            }}
            onPointerDownOutside={(e) => {
              const target = e.target as HTMLElement
              if (target.closest('[cmdk-root]')) {
                e.preventDefault()
              }
            }}
            onEscapeKeyDown={() => setOpen(false)}
          >
            {modalTitle && (
              <DialogHeader className="px-4 py-3 border-b">
                <DialogTitle className={cn("text-lg font-semibold", modalTitleClassName)}>{modalTitle}</DialogTitle>
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

  // Default popover variant with improved event handling for dialogs
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
          zIndex: 100, // Higher z-index to appear above dialogs
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement
          if (target.closest('[cmdk-root]')) {
            e.preventDefault()
          }
        }}
        onFocusOutside={(e) => {
          const target = e.target as HTMLElement
          if (target.closest('[cmdk-root]')) {
            e.preventDefault()
          }
        }}
        // Prevent auto-focus that might conflict with dialog
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {commandContent}
      </PopoverContent>
    </Popover>
  )
}