import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { CheckCircle2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button/button"

interface SignatureCanvasProps {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  width?: number
  height?: number
  className?: string
  disabled?: boolean
}

export interface SignatureCanvasRef {
  clear: () => void
  getSignature: () => string
  isEmpty: () => boolean
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ value, onChange, onClear, width = 300, height = 150, className = "", disabled = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
    const [hasSignature, setHasSignature] = useState(false)

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      clear: clearSignature,
      getSignature: () => {
        const canvas = canvasRef.current
        if (!canvas) return ""
        return canvas.toDataURL("image/png")
      },
      isEmpty: () => !hasSignature
    }), [hasSignature])

    // Load existing signature when value changes
    useEffect(() => {
      if (value && canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            setHasSignature(true)
          }
          img.src = value
          img.crossOrigin = "anonymous"
        }
      }
    }, [value])

    const clearSignature = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
      
      if (onChange) {
        onChange("")
      }
      
      if (onClear) {
        onClear()
      }
    }

    // Get mouse/touch position relative to canvas
    const getPos = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if (e.type.includes('touch')) {
        const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      } else {
        const mouse = e as MouseEvent
        return {
          x: (mouse.clientX - rect.left) * scaleX,
          y: (mouse.clientY - rect.top) * scaleY,
        }
      }
    }

    // Start drawing
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      if (disabled) return
      
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      setIsDrawing(true)
      const pos = getPos(e)
      setLastPos(pos)

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    // Draw on canvas
    const draw = (e: MouseEvent | TouchEvent) => {
      if (disabled) return
      
      e.preventDefault()
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const pos = getPos(e)

      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.strokeStyle = "#000000"

      ctx.beginPath()
      ctx.moveTo(lastPos.x, lastPos.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      setLastPos(pos)
    }

    // Stop drawing and save signature
    const endDrawing = (e: MouseEvent | TouchEvent) => {
      if (disabled) return
      
      e.preventDefault()
      if (!isDrawing) return

      setIsDrawing(false)
      setHasSignature(true)
      
      const canvas = canvasRef.current
      if (!canvas) return

      // Convert canvas to base64 and notify parent
      const dataURL = canvas.toDataURL("image/png")
      if (onChange) {
        onChange(dataURL)
      }
    }

    // Add event listeners to canvas
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || disabled) return

      // Mouse events
      const handleMouseDown = (e: MouseEvent) => startDrawing(e)
      const handleMouseMove = (e: MouseEvent) => draw(e)
      const handleMouseUp = (e: MouseEvent) => endDrawing(e)
      const handleMouseLeave = (e: MouseEvent) => endDrawing(e)

      // Touch events
      const handleTouchStart = (e: TouchEvent) => startDrawing(e)
      const handleTouchMove = (e: TouchEvent) => draw(e)
      const handleTouchEnd = (e: TouchEvent) => endDrawing(e)

      // Add event listeners
      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("mouseleave", handleMouseLeave)

      canvas.addEventListener("touchstart", handleTouchStart)
      canvas.addEventListener("touchmove", handleTouchMove)
      canvas.addEventListener("touchend", handleTouchEnd)

      // Cleanup function
      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mouseleave", handleMouseLeave)

        canvas.removeEventListener("touchstart", handleTouchStart)
        canvas.removeEventListener("touchmove", handleTouchMove)
        canvas.removeEventListener("touchend", handleTouchEnd)
      }
    }, [isDrawing, lastPos, disabled])

    return (
      <div className={`border rounded-md p-2 bg-white ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Pencil className="h-4 w-4 mr-1 text-primary" />
            <span className="text-sm text-muted-foreground">
              {disabled ? "Signature (Read-only)" : "Sign below"}
            </span>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="h-8 px-2 text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="border rounded-md border-dashed border-gray-300 bg-gray-50">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`w-full touch-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'}`}
            style={{
              touchAction: "none",
              background: "white",
            }}
          />
        </div>

        {hasSignature && (
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Signature captured
          </p>
        )}
      </div>
    )
  }
)

SignatureCanvas.displayName = "SignatureCanvas"

export default SignatureCanvas
