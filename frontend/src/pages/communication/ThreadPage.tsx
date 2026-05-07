import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Send, Pin, Lock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { communicationService, type Post } from "@/services/communicationService";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

function PostCard({ post, onReply }: { post: Post; onReply: (id: number) => void }) {
  const { user } = useAuthStore();
  const isOwn = post.author === user?.id;

  return (
    <div className={`flex gap-3 ${post.parent ? "ml-10 pl-4 border-l-2 border-blue-100" : ""}`}>
      <div className="w-9 h-9 rounded-full bg-esatic-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {(post.author_name?.[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1">
        <div className={`rounded-2xl px-4 py-3 ${isOwn ? "bg-esatic-blue text-white" : "bg-gray-100 text-gray-800"}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-semibold ${isOwn ? "text-blue-200" : "text-gray-500"}`}>
              {post.author_name}
            </span>
            <span className={`text-xs ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
              {format(new Date(post.created_at), "dd MMM HH:mm", { locale: fr })}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
        </div>
        {!post.parent && (
          <button onClick={() => onReply(post.id)}
            className="text-xs text-gray-400 hover:text-esatic-blue mt-1 ml-2 transition">
            Répondre
          </button>
        )}
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const threadId = Number(id);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["posts", threadId],
    queryFn: () => communicationService.posts(threadId),
  });

  const postMutation = useMutation({
    mutationFn: () => communicationService.createPost(threadId, {
      content,
      ...(replyTo ? { parent: replyTo } : {}),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", threadId] });
      setContent(""); setReplyTo(null);
    },
  });

  const posts: Post[] = postsData?.results ?? [];
  const rootPosts = posts.filter((p) => !p.parent);
  const replies = (parentId: number) => posts.filter((p) => p.parent === parentId);

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-esatic-blue mb-6 transition">
        <ArrowLeft size={16} /> Retour aux forums
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <MessageSquare size={20} className="text-esatic-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Discussion</h1>
          <p className="text-sm text-gray-400">{posts.length} message{posts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-4 mb-8">
          {rootPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucun message. Soyez le premier à répondre !</p>
            </div>
          ) : (
            rootPosts.map((post) => (
              <div key={post.id} className="space-y-3">
                <PostCard post={post} onReply={(id) => setReplyTo(replyTo === id ? null : id)} />
                {replies(post.id).map((r) => (
                  <PostCard key={r.id} post={r} onReply={() => {}} />
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reply composer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {replyTo && (
          <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2 mb-3 text-sm">
            <span className="text-esatic-blue">Réponse à un message</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Votre message..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postMutation.mutate(); }}
          />
          <Button
            onClick={() => postMutation.mutate()}
            loading={postMutation.isPending}
            disabled={!content.trim()}
            className="flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Ctrl+Entrée pour envoyer</p>
      </div>
    </div>
  );
}
