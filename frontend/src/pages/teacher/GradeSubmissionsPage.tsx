import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Star, CheckCircle, Clock, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { assignmentService, type Submission } from "@/services/assignmentService";
import type { Assignment, PaginatedResponse } from "@/types";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

export default function GradeSubmissionsPage() {
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data: assignments, isLoading } = useQuery<PaginatedResponse<Assignment>>({
    queryKey: ["teacher-assignments"],
    queryFn: () => api.get("/assignments/").then((r) => r.data),
  });

  const { data: submissions, isLoading: subsLoading } = useQuery<PaginatedResponse<Submission>>({
    queryKey: ["submissions", selectedAssignment?.id],
    queryFn: () => assignmentService.listSubmissions(selectedAssignment!.id),
    enabled: !!selectedAssignment,
  });

  const gradeMutation = useMutation({
    mutationFn: () => assignmentService.grade(gradingSubmission!.id, Number(score), feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", selectedAssignment?.id] });
      setGradingSubmission(null);
      setScore(""); setFeedback("");
    },
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notation des devoirs</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Devoirs</h2>
          {assignments?.results.length === 0 ? (
            <EmptyState icon={FileText} title="Aucun devoir" />
          ) : (
            assignments?.results.map((a) => (
              <button key={a.id} onClick={() => setSelectedAssignment(a)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedAssignment?.id === a.id
                    ? "border-esatic-blue bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
                }`}>
                <p className="font-medium text-sm text-gray-800 truncate">{a.title}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Star size={11} /> {a.max_score} pts
                </p>
              </button>
            ))
          )}
        </div>

        {/* Submissions */}
        <div className="lg:col-span-2">
          {!selectedAssignment ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
              <p className="text-gray-400 text-sm">Sélectionnez un devoir</p>
            </div>
          ) : subsLoading ? (
            <Spinner />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">{selectedAssignment.title}</h2>
                <p className="text-sm text-gray-400">{submissions?.count ?? 0} soumission{(submissions?.count ?? 0) !== 1 ? "s" : ""}</p>
              </div>
              {submissions?.results.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucune soumission pour ce devoir.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {submissions?.results.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-9 h-9 rounded-full bg-esatic-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {sub.student_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{sub.student_name ?? `Étudiant #${sub.student}`}</p>
                        {sub.submitted_at && (
                          <p className="text-xs text-gray-400">
                            {format(new Date(sub.submitted_at), "dd MMM yyyy HH:mm", { locale: fr })}
                            {sub.is_late && <span className="text-red-500 ml-1">(en retard)</span>}
                          </p>
                        )}
                        {sub.content && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{sub.content}</p>}
                      </div>
                      {sub.file && (
                        <a href={sub.file} target="_blank" rel="noreferrer"
                          className="text-xs text-esatic-blue hover:underline flex items-center gap-1">
                          <Download size={12} /> Fichier
                        </a>
                      )}
                      {sub.grade ? (
                        <div className="text-right flex-shrink-0">
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <CheckCircle size={14} /> {sub.grade.score}/{selectedAssignment.max_score}
                          </span>
                          <p className="text-xs text-gray-400">Noté</p>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => { setGradingSubmission(sub); setScore(""); setFeedback(""); }}>
                          <Star size={13} className="mr-1" /> Noter
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grade modal */}
      <Modal isOpen={!!gradingSubmission} onClose={() => setGradingSubmission(null)} title="Attribuer une note" size="sm">
        {gradingSubmission && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (sur {selectedAssignment?.max_score})
              </label>
              <input type="number" min={0} max={selectedAssignment?.max_score} value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3}
                placeholder="Feedback pour l'étudiant..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-esatic-blue resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setGradingSubmission(null)}>Annuler</Button>
              <Button className="flex-1" loading={gradeMutation.isPending}
                disabled={!score} onClick={() => gradeMutation.mutate()}>
                Valider la note
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
