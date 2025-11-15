import { Spinner } from "@/components/ui/spinner";

export default function TableLoading() {
   return (
      <div className="flex items-center justify-center py-20">
         <Spinner size="md"/>
         <span className="ml-2 text-gray-600">Loading ...</span>
      </div>
   )
}