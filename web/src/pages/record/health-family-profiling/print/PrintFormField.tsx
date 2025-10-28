// Print-specific form field component
interface PrintFormFieldProps {
  label: string
  value: string | null
  width?: string
}

const PrintFormField = ({
  label,
  value,
  width = "auto",
}: PrintFormFieldProps) => {
  const displayValue = value || ""

  return (
    <div className={`print-field ${width === "full" ? "w-full" : width === "half" ? "w-1/2" : "flex-1"}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium">{label}:</span>
        <div className="border-b border-gray-400 flex-1 min-h-[20px] text-xs px-1">{displayValue}</div>
      </div>
    </div>
  )
}

export default PrintFormField
