import { Spinner } from "@/components/ui/spinner";

export default function TableLoading() {
   return (
      <div className="flex items-center justify-center py-12">
         <Spinner size="lg"/>
         <span className="ml-2 text-gray-600">Loading records...</span>
      </div>
   )
}