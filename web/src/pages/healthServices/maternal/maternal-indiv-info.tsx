import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { MapPinHouse, PhoneCall } from "lucide-react"

export default function MedicalChartCard() {
  return (
    <Card className="w-full border-l-4 border-l-[#2563EB] font-poppins">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="border rounded-xl pt-1 px-5 pb-1 bg-[#2563EB] shadow-sm text-white">
            <CardTitle className="text-lg">Caballes, Katrina Shin Dayuja</CardTitle>
            <div className="text-sm text-gray-600 mt-1">Patient ID: P-2024-001</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">ACTIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-r pr-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">AGE</div>
            <div className="text-lg font-bold">27</div>
          </div>
          <div className="border-r pr-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">SEX</div>
            <div className="text-lg font-bold">F</div>
          </div>
          <div className="border-r pr-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">DATE OF BIRTH</div>
            <div className="text-lg font-bold">Jan 15, 1997</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">BLOOD TYPE</div>
            <div className="text-lg font-bold">O+</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="text-xs font-semibold text-gray-500 mb-3">CONTACT INFORMATION</div>
          <div className="text-sm">
            <div className="flex gap-2"> <MapPinHouse size={16}/> Bonsai Bolinawan, Carcar City, Cebu</div>
            <div className="flex gap-2 mt-2"> <PhoneCall size={16}/> +63 912 345 6789</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
