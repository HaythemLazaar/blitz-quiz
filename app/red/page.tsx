"use client";
import { useEffect, useState, useRef } from "react";
import {
  subscribeToQuizState,
  broadcastQuizState,
  QuizState,
} from "../supabaseRealtime";

export default function RedTeam() {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(false);
  const lockoutTimeout = useRef<NodeJS.Timeout | null>(null);
  const buzzerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      setQuizState(state);
    });
    return unsubscribe;
  }, []);

  // Only lock out if lockoutTeam is 'red'
  useEffect(() => {
    if (quizState && quizState.lockoutTeam === "red") {
      if (lockoutTimeout.current) clearTimeout(lockoutTimeout.current);
      lockoutTimeout.current = setTimeout(async () => {
        await broadcastQuizState({
          ...quizState,
          lockoutTeam: null,
        });
      }, 3000);
    } else if (quizState && quizState.lockoutTeam !== "red") {
      if (lockoutTimeout.current) clearTimeout(lockoutTimeout.current);
    }
    return () => {
      if (lockoutTimeout.current) clearTimeout(lockoutTimeout.current);
    };
  }, [quizState?.lockoutTeam]);

  buzzerAudioRef.current = 
    typeof Audio !== "undefined" ? new Audio("/buzzer.mp3") : null;

  const handleBuzz = async () => {
    buzzerAudioRef.current?.play();
    if (!quizState || quizState.buzzerTeam !== null) return;
    setLoading(true);
    await broadcastQuizState({
      ...quizState,
      buzzerTeam: "red",
    });
    setLoading(false);
  };

  const isBuzzDisabled =
    !quizState ||
    quizState.buzzerTeam !== null ||
    loading ||
    quizState.questionNumber === 0 ||
    quizState.lockoutTeam === "red";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 p-8">
      {/* Hidden audio element for buzzer */}
      <audio
        src="/buzzer.mp3"
        ref={buzzerAudioRef}
        style={{ display: "none" }}
      />
      <div className="flex flex-col items-center bg-white/80 dark:bg-red-900/80 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-3xl font-bold mb-4 text-red-700">Équipe Rouge</div>
        <div className="text-6xl font-extrabold mb-8 text-red-600 drop-shadow-lg">
          {quizState?.redPoints ?? 0}
        </div>
        <button
          className="w-full py-8 text-5xl font-bold rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isBuzzDisabled}
          onClick={handleBuzz}
        >
          Buzz !
        </button>
        {quizState?.buzzerTeam && (
          <div className="mt-6 text-xl font-semibold text-center">
            {quizState.buzzerTeam === "red"
              ? "Vous avez buzzé !"
              : "L'autre équipe a déjà buzzé."}
          </div>
        )}
      </div>
    </div>
  );
}
