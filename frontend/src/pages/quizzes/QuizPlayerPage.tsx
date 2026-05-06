import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { quizService, type QuizQuestion } from "@/services/quizService";
import { useTimer } from "@/hooks/useTimer";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function QuizPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizId = Number(id);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => quizService.detail(quizId),
  });

  const timeLimit = (quiz?.time_limit_minutes ?? 30) * 60;
  const { display, percentage, start } = useTimer(timeLimit, () => handleSubmit());

  useEffect(() => {
    if (quiz) {
      quizService.startAttempt(quizId);
      start();
    }
  }, [quiz]);

  const submitMutation = useMutation({
    mutationFn: (payload: { question_id: number; selected_choices: number[] }[]) =>
      quizService.submit(quizId, payload),
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
    },
  });

  const handleSubmit = () => {
    if (submitted) return;
    const payload = Object.entries(answers).map(([qid, choices]) => ({
      question_id: Number(qid),
      selected_choices: choices,
    }));
    submitMutation.mutate(payload);
  };

  const toggleChoice = (questionId: number, choiceId: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(choiceId)
            ? current.filter((c) => c !== choiceId)
            : [...current, choiceId],
        };
      }
      return { ...prev, [questionId]: [choiceId] };
    });
  };

  if (isLoading) return <Spinner />;
  if (!quiz) return <p className="text-center text-gray-500">Quiz introuvable</p>;

  const questions: QuizQuestion[] = quiz.questions ?? [];
  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const timerColor = percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-orange-500" : "bg-red-500";

  if (submitted && result) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? "bg-green-100" : "bg-red-100"}`}>
          <CheckCircle size={48} className={result.passed ? "text-green-500" : "text-red-500"} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {result.passed ? "Félicitations !" : "Quiz terminé"}
        </h2>
        <p className="text-gray-500 mb-6">
          {result.passed ? "Vous avez réussi ce quiz." : "Vous n'avez pas atteint le score requis."}
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <p className="text-5xl font-bold text-esatic-blue">{result.score.toFixed(1)}%</p>
          <p className="text-gray-400 mt-1">Score obtenu</p>
          <p className="text-sm text-gray-500 mt-3">Score requis : {quiz.pass_score}%</p>
        </div>
        <Button onClick={() => navigate("/quizzes")}>Retour aux quiz</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
          <p className="text-sm text-gray-500">Question {current + 1} / {questions.length}</p>
        </div>
        {quiz.time_limit_minutes && (
          <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2">
            <Clock size={16} className={percentage <= 20 ? "text-red-500" : "text-gray-400"} />
            <span className={`font-mono font-bold text-lg ${percentage <= 20 ? "text-red-500" : "text-gray-700"}`}>
              {display}
            </span>
          </div>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div className="bg-esatic-blue h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {quiz.time_limit_minutes && (
        <div className="w-full bg-gray-100 rounded-full h-1 mb-6">
          <div className={`${timerColor} h-1 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
        </div>
      )}

      {question && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-esatic-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
              {current + 1}
            </span>
            <p className="text-gray-800 text-lg leading-relaxed">{question.text}</p>
          </div>

          <div className="space-y-3">
            {question.choices.map((choice) => {
              const selected = (answers[question.id] ?? []).includes(choice.id);
              return (
                <button
                  key={choice.id}
                  onClick={() => toggleChoice(question.id, choice.id, question.question_type === "mcq")}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition ${
                    selected
                      ? "border-esatic-blue bg-blue-50 text-esatic-blue font-medium"
                      : "border-gray-100 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          <ChevronLeft size={16} className="mr-1" /> Précédent
        </Button>

        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition ${
                i === current ? "bg-esatic-blue text-white" :
                answers[questions[i]?.id]?.length ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)}>
            Suivant <ChevronRight size={16} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitMutation.isPending}>
            Soumettre
          </Button>
        )}
      </div>
    </div>
  );
}
