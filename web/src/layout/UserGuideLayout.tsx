import { Label } from "@/components/ui/label";
// import { useAuth } from "@/context/AuthContext";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { ChevronLeft } from "lucide-react";

export default function UserGuideLayout() {
  // const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate()
  
  // const barangayItem = []
  // const healthItem = []
  // const baseItem = []
  return(
    <div className="w-screen h-screen bg-primary flex">
      <div className="flex flex-col">
        <div className="flex items-center"
          onClick={() => safeNavigate.back()}
        >
          <ChevronLeft className="text-white"/>
          <Label className="text-white text-lg">Docs</Label>
        </div>
        
      </div>
      <div>

      </div>
    </div>
  )
}