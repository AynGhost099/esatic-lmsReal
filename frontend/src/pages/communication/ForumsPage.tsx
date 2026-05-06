import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import api from "@/services/api";

interface Forum {
  id: number;
  title: string;
  description: string;
  threads_count: number;
}

export default function ForumsPage() {
  const { data, isLoading } = useQuery<{ results: Forum[] }>({
    queryKey: ["forums"],
    queryFn: () => api.get("/communication/forums/").then((r) => r.data),
  });

  if (isLoading) return <div className="animate-pulse bg-white rounded-xl h-64" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Forums</h1>
      <div className="space-y-4">
        {data?.results.map((forum) => (
          <div key={forum.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare size={24} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{forum.title}</h3>
              <p className="text-sm text-gray-500">{forum.description}</p>
            </div>
            <span className="text-sm text-gray-400">{forum.threads_count} sujets</span>
          </div>
        ))}
      </div>
    </div>
  );
}
