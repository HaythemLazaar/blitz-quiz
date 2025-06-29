"use client";
import { useEffect, useState } from "react";
import { subscribeToQuizState, QuizState } from "./supabaseRealtime";
import { questions } from "./questions";

// Statuts possibles du quiz
const STATUS_WAITING = "waiting";
const STATUS_ACTIVE = "active";

export default function GrandEcranQuiz() {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [status, setStatus] = useState<string>(STATUS_WAITING);
  const [buzzerCountdown, setBuzzerCountdown] = useState<number>(0);

  useEffect(() => {
    // Abonnement aux mises à jour en temps réel
    const unsubscribe = subscribeToQuizState((state) => {
      setQuizState(state);
      // Déduire le statut du quiz (exemple simplifié)
      if (state.questionNumber === 0) setStatus(STATUS_WAITING);
      else setStatus(STATUS_ACTIVE);
    });
    return unsubscribe;
  }, []);

  // Buzzer countdown effect (local, based on buzzerTeam)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (quizState?.buzzerTeam) {
      setBuzzerCountdown(10);
      interval = setInterval(() => {
        setBuzzerCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setBuzzerCountdown(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizState?.buzzerTeam, quizState?.questionNumber]);

  // Récupérer la question courante
  const questionIdx = quizState ? quizState.questionNumber - 1 : -1;
  const questionObj =
    questionIdx >= 0 && questionIdx < questions.length
      ? questions[questionIdx]
      : null;
  const questionTextFr = questionObj ? `${questionObj.shortQuestionFr}` : "";
  const questionTextAr = questionObj ? `${questionObj.text}` : "";

  // Styles dynamiques pour l'équipe qui a buzzé
  const redGlow =
    quizState?.buzzerTeam === "red"
      ? "shadow-[0_0_40px_10px_rgba(255,0,0,0.7)]"
      : "";
  const blueGlow =
    quizState?.buzzerTeam === "blue"
      ? "shadow-[0_0_40px_10px_rgba(0,0,255,0.7)]"
      : "";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      {status === STATUS_WAITING ? (
        <div className="flex-1 flex items-center justify-center text-6xl font-bold">En attente...</div>
      ) : (
        <>
          <div className="flex w-full justify-around mb-12 mt-8">
            <div
              className={`flex flex-col items-center text-7xl font-extrabold px-12 py-8 rounded-2xl bg-red-600 text-white ${redGlow} transition-shadow duration-300`}
            >
              Équipe Rouge
              <span className="text-8xl mt-4">{quizState?.redPoints ?? 0}</span>
            </div>
            <div
              className={`flex flex-col items-center text-7xl font-extrabold px-12 py-8 rounded-2xl bg-blue-600 text-white ${blueGlow} transition-shadow duration-300`}
            >
              Équipe Bleue
              <span className="text-8xl mt-4">{quizState?.bluePoints ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-8">
            <div className="text-5xl font-semibold mb-6">
              Question {quizState?.questionNumber ?? "-"}
              {quizState?.buzzerTeam && buzzerCountdown > 0 && (
                <span className="ml-4 text-yellow-600 font-bold">⏳ {buzzerCountdown}s</span>
              )}
            </div>
            <div className="text-4xl font-bold text-center max-w-4xl bg-black/5 dark:bg-white/10 rounded-t-xl px-10 py-8 border-b">
              {questionTextFr}
            </div>
            <div className="text-4xl font-bold text-center max-w-4xl bg-black/5 dark:bg-white/10 rounded-b-xl px-10 py-8">
              {questionTextAr}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
