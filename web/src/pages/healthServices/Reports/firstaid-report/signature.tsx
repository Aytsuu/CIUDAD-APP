import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import SignatureCanvas from "react-signature-canvas";

interface SignatureFieldProps {
  title: string;
  onSignatureChange?: (signature: string | null) => void;
  initialSignature?: string;
  required?: boolean;
  className?: string;
}

export interface SignatureFieldRef {
  clearSignature: () => void;
  getSignature: () => string | null;
  setSignature: (signature: string) => void;
  getName: () => string;
}

export const SignatureField = forwardRef<SignatureFieldRef, SignatureFieldProps>(
  (
    {
      title,
      onSignatureChange,
      initialSignature = "",
      required = false,
      className = "",
    },
    ref
  ) => {
    const sigRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name] = useState(title);

    // Initialize signature from props
    useEffect(() => {
      if (initialSignature) {
        const dataURL = initialSignature.startsWith('data:') 
          ? initialSignature 
          : `data:image/png;base64,${initialSignature}`;
        setSignatureData(dataURL);
      }
    }, [initialSignature]);

    const handleClear = () => {
      if (sigRef.current) {
        sigRef.current.clear();
      }
      setSignatureData(null);
      setIsEditing(false);
      console.log("Signature cleared - notifying parent");
      onSignatureChange?.(null);
    };

    const handleSave = () => {
      if (!sigRef.current) return;
      
      try {
        const isEmpty = sigRef.current.isEmpty();
        
        if (isEmpty) {
          setSignatureData(null);
          onSignatureChange?.(null);
        } else {
          let dataURL: string;
          try {
            dataURL = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
          } catch (trimError) {
            console.warn("getTrimmedCanvas failed, using regular toDataURL:", trimError);
            dataURL = sigRef.current.toDataURL("image/png");
          }
          
          setSignatureData(dataURL);
          setIsEditing(false);
          
          // Extract only the base64 part for the callback
          const base64Only = dataURL.split(',')[1];
          onSignatureChange?.(base64Only);
        }
      } catch (error) {
        console.error("Failed to save signature:", error);
        onSignatureChange?.(null);
      }
    };

    const handleEdit = () => {
      setIsEditing(true);
      // If there's existing signature data, load it into the canvas
      if (signatureData && sigRef.current) {
        try {
          sigRef.current.fromDataURL(signatureData);
        } catch (error) {
          console.error("Failed to load signature for editing:", error);
        }
      }
    };

    const handleCancel = () => {
      if (sigRef.current) {
        sigRef.current.clear();
      }
      setIsEditing(false);
    };

    useImperativeHandle(ref, () => ({
      clearSignature: () => {
        if (sigRef.current) {
          sigRef.current.clear();
        }
        setSignatureData(null);
        setIsEditing(false);
        onSignatureChange?.(null);
      },
      getSignature: () => {
        if (!signatureData) return null;
        try {
          // Return only base64 part
          return signatureData.split(',')[1];
        } catch (error) {
          console.error("Failed to get signature:", error);
          return null;
        }
      },
      getName: () => name,
      setSignature: (signature: string) => {
        if (signature) {
          try {
            const dataURL = signature.startsWith('data:') ? signature : `data:image/png;base64,${signature}`;
            setSignatureData(dataURL);
            setIsEditing(false);
          } catch (error) {
            console.error("Failed to set signature:", error);
          }
        }
      }
    }));

    return (
      <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
        <div className="mt-2">
          <Label className="flex items-center gap-1 mb-2">
            {title}
            {required && <span className="text-red-500">*</span>}
          </Label>
          
          <div className="relative border border-gray-300 h-32 bg-white">
            {!isEditing && signatureData ? (
              // Display signature as image
              <div className="w-full h-full flex items-center justify-center p-2">
                <img 
                  src={signatureData} 
                  alt="Signature" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : isEditing ? (
              // Show signature canvas for editing
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  className: "w-full h-full bg-white",
                }}
                penColor="black"
              />
            ) : (
              // Show placeholder when no signature
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>Click "Add Signature" to sign</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            {!isEditing && !signatureData && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                Add Signature
              </Button>
            )}
            
            {!isEditing && signatureData && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  Edit Signature
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-destructive hover:text-destructive"
                >
                  Clear Signature
                </Button>
              </>
            )}
            
            {isEditing && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                >
                  Save Signature
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SignatureField.displayName = "SignatureField";