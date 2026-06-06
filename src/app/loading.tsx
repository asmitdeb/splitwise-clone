import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading workspace...</p>
    </div>
  );
}
