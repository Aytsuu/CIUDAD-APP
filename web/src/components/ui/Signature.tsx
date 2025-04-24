"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button/button"
import { RefreshCw } from "lucide-react"
import type { UseFormSetValue } from "react-hook-form"

interface SignaturePadProps {
  setValue: UseFormSetValue<any>
  name: string
  label?: string
  className?: string
}

export const SignaturePad = ({ setValue, name, label = "Signature", className = "" }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas styles
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000000"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"

    // Handle canvas resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Reset canvas styles after resize (canvas resets when dimensions change)
      ctx.lineWidth = 2
      ctx.strokeStyle = "#000000"
      ctx.lineJoin = "round"
      ctx.lineCap = "round"

      // Redraw the signature if it exists
      if (signatureDataURL) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = signatureDataURL
      }
    }

    resizeCanvas()

    // Add event listener for window resize
    window.addEventListener("resize", resizeCanvas)

    // Add passive: false to prevent scrolling on touch devices
    const preventDefaultTouch = (e: TouchEvent) => e.preventDefault()
    canvas.addEventListener("touchstart", preventDefaultTouch, { passive: false })
    canvas.addEventListener("touchmove", preventDefaultTouch, { passive: false })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("touchstart", preventDefaultTouch)
      canvas.removeEventListener("touchmove", preventDefaultTouch)
    }
  }, [signatureDataURL])

  // Get canvas coordinates from event
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | TouchEvent | MouseEvent,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as MouseEvent).clientX
      clientY = (e as MouseEvent).clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const position = getCanvasCoordinates(e)
    setLastPosition(position)
    setIsDrawing(true)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(position.x, position.y)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if ("touches" in e) {
      e.preventDefault()
    }

    const position = getCanvasCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(position.x, position.y)
    ctx.stroke()

    setLastPosition(position)
    setHasSignature(true)
  }

  const endDrawing = () => {
    setIsDrawing(false)
    if (hasSignature && canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL("image/png")
      setSignatureDataURL(signatureData)
      setValue(name, signatureData)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
        setSignatureDataURL(null)
        setValue(name, "")
      }
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="border border-gray-300 rounded-md w-full aspect-[4/1] md:aspect-[5/1] relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={clearSignature}
        size="sm"
        className="flex items-center gap-1 w-full sm:w-auto"
      >
        <RefreshCw className="w-4 h-4" />
        Clear Signature
      </Button>
    </div>
  )
}
