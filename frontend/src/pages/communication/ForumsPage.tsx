import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Pin, Lock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { communicationService, type Forum, type Thread } from "@/services/communicationService";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

function ThreadList({ forum }: { forum: Forum }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["threads", forum.id],
    queryFn: () => communicationService.threads(forum.id),
  });

  const createMutation = useMutation({
    mutationFn: () => communicationService.createThread(forum.id, { title, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads", forum.id] });
      setShowNew(false); setTitle(""); setContent("");
    },
  });

  if (isLoading) return <Spinner size="sm" />;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} className="mr-1" /> Nouveau sujet</Button>
      </div>
      {data?.results.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun sujet. Soyez le premier à poster !</p>
      ) : (
        <div className="space-y-2">
          {data?.results.map((thread: Thread) => (
            <div key={thread.id} onClick={() => navigate(`/forums/threads/${thread.id}`)}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-esatic-blue hover:bg-blue-50/30 cursor-pointer transition">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <MessageSquare size={16} className="text-esatic-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {thread.is_pinned && <Pin size={12} className="text-esatic-orange flex-shrink-0" />}
                  {thread.is_locked && <Lock size={12} className="text-gray-400 flex-shrink-0" />}
                  <p className="font-medium text-gray-800 truncate">{thread.title}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{thread.content}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{format(new Date(thread.created_at), "dd MMM", { locale: fr })}</p>
                <p className="text-xs text-gray-500 mt-0.5">{thread.posts_count ?? 0} réponse{(thread.posts_count ?? 0) !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Nouveau sujet" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sujet de votre question..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
              placeholder="Décrivez votre question ou sujet..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNew(false)}>Annuler</Button>
            <Button className="flex-1" loading={createMutation.isPending}
              disabled={!title.trim() || !content.trim()} onClick={() => createMutation.mutate()}>
              Publier
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ForumsPage() {
  const [openForum, setOpenForum] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["forums"],
    queryFn: () => communicationService.forums(),
  });

  if (isLoading) return <Spinner />;
  const forums: Forum[] = data?.results ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Forums de discussion</h1>
      {forums.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Aucun forum disponible"
          description="Les forums apparaîtront ici quand vos enseignants en créeront." />
      ) : (
        <div className="space-y-4">
          {forums.map((forum) => (
            <div key={forum.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenForum(openForum === forum.id ? null : forum.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition">
                <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                  <MessageSquare size={22} className="text-esatic-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{forum.title}</h3>
                  {forum.description && <p className="text-sm text-gray-500 mt-0.5">{forum.description}</p>}
                </div>
                <span className="text-sm text-gray-400">{openForum === forum.id ? "▲" : "▼"}</span>
              </button>
              {openForum === forum.id && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                  <ThreadList forum={forum} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
