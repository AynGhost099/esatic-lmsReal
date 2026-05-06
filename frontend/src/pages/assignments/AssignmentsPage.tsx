import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Calendar, Upload, CheckCircle, Clock, Star } from "lucide-react";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { assignmentService, type Submission } from "@/services/assignmentService";
import type { Assignment, PaginatedResponse } from "@/types";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

function AssignmentCard({
  assignment,
  onOpen,
}: {
  assignment: Assignment;
  onOpen: (a: Assignment) => void;
}) {
  const deadline = new Date(assignment.deadline);
  const overdue = isPast(deadline);

  const { data: submission } = useQuery<Submission>({
    queryKey: ["submission", assignment.id],
    queryFn: () => assignmentService.mySubmission(assignment.id),
    retry: false,
  });

  const statusBadge = submission
    ? submission.grade !== null
      ? { label: `${submission.grade!.score}/${assignment.max_score} pts`, color: "bg-green-100 text-green-700" }
      : { label: "Soumis", color: "bg-blue-100 text-blue-700" }
    : overdue
    ? { label: "Expiré", color: "bg-red-100 text-red-600" }
    : { label: "En attente", color: "bg-orange-100 text-orange-700" };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg flex-shrink-0 ${overdue && !submission ? "bg-red-50" : "bg-blue-50"}`}>
            <FileText size={20} className={overdue && !submission ? "text-red-500" : "text-blue-500"} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{assignment.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{assignment.description}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className={`flex items-center gap-1 text-sm ${overdue ? "text-red-500" : "text-gray-400"}`}>
          {overdue ? <Clock size={14} /> : <Calendar size={14} />}
          <span>
            {overdue
              ? `Expiré ${formatDistanceToNow(deadline, { addSuffix: true, locale: fr })}`
              : `Dans ${formatDistanceToNow(deadline, { locale: fr })}`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Star size={14} />
          <span>{assignment.max_score} pts</span>
        </div>
      </div>

      {submission?.grade?.feedback && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
          <span className="font-medium">Feedback : </span>{submission.grade.feedback}
        </div>
      )}

      {!submission && !overdue && (
        <Button className="mt-4 w-full" onClick={() => onOpen(assignment)}>
          <Upload size={14} className="mr-2" /> Soumettre
        </Button>
      )}
      {submission?.submitted_at && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Soumis le {format(new Date(submission.submitted_at), "dd MMM yyyy à HH:mm", { locale: fr })}
        </p>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Assignment>>({
    queryKey: ["assignments"],
    queryFn: () => assignmentService.list(),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      assignmentService.submit(id, formData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      setSelected(null);
      setContent("");
      setFile(null);
    },
  });

  const handleSubmit = () => {
    if (!selected) return;
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (content.trim()) formData.append("content", content);
    submitMutation.mutate({ id: selected.id, formData });
  };

  if (isLoading) return <Spinner />;

  const assignments = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Devoirs</h1>
        <span className="text-sm text-gray-500">{assignments.length} devoir{assignments.length !== 1 ? "s" : ""}</span>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devoir"
          description="Vos devoirs apparaîtront ici lorsque vos enseignants en publieront."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onOpen={setSelected} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setContent(""); setFile(null); }}
        title={selected?.title ?? ""}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{selected.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(selected.deadline), "dd MMM yyyy à HH:mm", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} />
                {selected.max_score} pts
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Réponse écrite (optionnel)
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none"
                placeholder="Votre réponse..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier à joindre (optionnel)
              </label>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-esatic-blue transition"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-esatic-blue">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Cliquez pour choisir un fichier</p>
                    <p className="text-xs mt-1">PDF, DOC, DOCX, ZIP, TXT, PNG, JPG</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setSelected(null); setContent(""); setFile(null); }}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                loading={submitMutation.isPending}
                disabled={!file && !content.trim()}
              >
                Soumettre le devoir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
