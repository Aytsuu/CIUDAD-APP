import { Loader2 } from "lucide-react";

export const ActivityIndicator = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
)