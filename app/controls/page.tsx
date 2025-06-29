"use client";
import { useEffect, useState } from "react";
import { questions } from "../questions";
import {
  broadcastQuizState,
  subscribeToQuizState,
  QuizState,
} from "../supabaseRealtime";

const STATUS_WAITING = "waiting";
const STATUS_ACTIVE = "active";

const initialState: QuizState = {
  questionNumber: 0,
  redPoints: 0,
  bluePoints: 0,
  buzzerTeam: null,
  lockoutTeam: null,
};

export default function ControleQuiz() {
  const [quizState, setQuizState] = useState<QuizState>(initialState);
  const [status, setStatus] = useState<string>(STATUS_WAITING);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      setQuizState(state);
      setStatus(state.questionNumber === 0 ? STATUS_WAITING : STATUS_ACTIVE);
    });
    return unsubscribe;
  }, []);

  // Helpers
  const currentQuestion =
    quizState.questionNumber > 0 && quizState.questionNumber <= questions.length
      ? questions[quizState.questionNumber - 1]
      : null;

  // Actions
  const updateState = async (newState: Partial<QuizState>) => {
    setLoading(true);
    const nextState = { ...quizState, ...newState };
    if (typeof newState.lockoutTeam === "undefined") {
      nextState.lockoutTeam = quizState.lockoutTeam ?? null;
    }
    setQuizState(nextState);
    await broadcastQuizState(nextState);
    setLoading(false);
  };

  const handleStartQuiz = async () => {
    await updateState({ ...initialState, questionNumber: 1 });
  };

  const handleEndQuiz = async () => {
    await updateState(initialState);
  };

  const handleNextQuestion = async () => {
    if (quizState.questionNumber < questions.length) {
      await updateState({
        questionNumber: quizState.questionNumber + 1,
        buzzerTeam: null,
      });
    }
  };

  const handleGivePoints = async (team: "red" | "blue", tryNumber: 1 | 2) => {
    if (!currentQuestion) return;
    const points =
      tryNumber === 1
        ? currentQuestion.pointsFirstTry
        : currentQuestion.pointsSecondTry;
    await updateState({
      redPoints:
        team === "red" ? quizState.redPoints + points : quizState.redPoints,
      bluePoints:
        team === "blue" ? quizState.bluePoints + points : quizState.bluePoints,
      buzzerTeam: null,
    });
  };

  const handlePenalty = async () => {
    if (!currentQuestion || !quizState.buzzerTeam) return;
    const penalty = currentQuestion.penalty;
    if (quizState.buzzerTeam === "red") {
      await updateState({
        redPoints: quizState.redPoints + penalty,
        buzzerTeam: null,
      });
    } else if (quizState.buzzerTeam === "blue") {
      await updateState({
        bluePoints: quizState.bluePoints + penalty,
        buzzerTeam: null,
      });
    }
  };

  // UI
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="flex flex-col items-center w-full max-w-3xl bg-white/80 dark:bg-black/40 rounded-2xl shadow-lg p-8">
        <div className="w-full text-center mb-8">
          <div className="text-2xl font-semibold mb-2">
            {currentQuestion ? (
              <>
                Question {currentQuestion.number} : {currentQuestion.text}
              </>
            ) : (
              <span className="italic text-gray-500">
                Aucune question en cours
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between w-full mb-6 divide-x divide-gray-300">
          <div className="flex flex-col items-center text-3xl font-bold text-red-600 pr-2">
            Équipe Rouge
            <span className="text-4xl">{quizState.redPoints}</span>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-base py-2 px-4 rounded disabled:opacity-50"
                disabled={status !== STATUS_ACTIVE || loading}
                onClick={() => handleGivePoints("red", 1)}
              >
                +{currentQuestion?.pointsFirstTry ?? 10} pts Rouge (1ère
                tentative)
              </button>
              <button
                className="bg-red-400 hover:bg-red-500 text-white font-bold text-base py-2 px-4 rounded disabled:opacity-50"
                disabled={status !== STATUS_ACTIVE || loading}
                onClick={() => handleGivePoints("red", 2)}
              >
                +
                {currentQuestion
                  ? Math.floor(currentQuestion.pointsSecondTry)
                  : 5}{" "}
                pts Rouge (2ème tentative)
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center text-3xl font-bold text-blue-600 pl-2">
            Équipe Bleue
            <span className="text-4xl">{quizState.bluePoints}</span>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-2 px-4 rounded disabled:opacity-50"
                disabled={status !== STATUS_ACTIVE || loading}
                onClick={() => handleGivePoints("blue", 1)}
              >
                +{currentQuestion?.pointsFirstTry ?? 10} pts Bleu (1ère
                tentative)
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-500 text-white font-bold text-base py-2 px-4 rounded disabled:opacity-50"
                disabled={status !== STATUS_ACTIVE || loading}
                onClick={() => handleGivePoints("blue", 2)}
              >
                +
                {currentQuestion
                  ? Math.floor(currentQuestion.pointsSecondTry)
                  : 5}{" "}
                pts Bleu (2ème tentative)
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 justify-center">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={
                status !== STATUS_ACTIVE || !quizState.buzzerTeam || loading
              }
              onClick={handlePenalty}
            >
              {quizState.buzzerTeam
                ? `- ${currentQuestion?.penalty ?? 0} pts ${
                    quizState.buzzerTeam === "red" ? "Rouge" : "Bleu"
                  } (Pénalité)`
                : "Pénalité (personne n'a buzzé)"}
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              disabled={
                status !== STATUS_ACTIVE ||
                loading ||
                quizState.questionNumber >= questions.length
              }
              onClick={handleNextQuestion}
            >
              Question suivante
            </button>
          </div>
          <div className="w-full text-center mb-4">
            {quizState.buzzerTeam === "red" && (
              <div className="inline-block bg-red-600 text-white text-xl font-bold py-2 px-6 rounded-lg shadow mb-2 animate-pulse">
                🚨 Équipe Rouge a buzzé !
              </div>
            )}
            {quizState.buzzerTeam === "blue" && (
              <div className="inline-block bg-blue-600 text-white text-xl font-bold py-2 px-6 rounded-lg shadow mb-2 animate-pulse">
                🚨 Équipe Bleue a buzzé !
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-center mt-4">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
              disabled={loading}
              onClick={async () => {
                await updateState({
                  buzzerTeam: null,
                  lockoutTeam: quizState.buzzerTeam ?? null,
                });
              }}
            >
              Réinitialiser le buzzer
            </button>
          </div>
          <div className="flex gap-4 justify-center mt-4">
            {status === STATUS_WAITING ? (
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                disabled={loading}
                onClick={handleStartQuiz}
              >
                Démarrer le quiz
              </button>
            ) : (
              <button
                className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                disabled={loading}
                onClick={handleEndQuiz}
              >
                Terminer le quiz
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Toutes les actions sont synchronisées en temps réel.
        </div>
      </div>
    </div>
  );
}
