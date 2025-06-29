"use client";
import { useEffect, useState, useRef } from "react";
import {
  subscribeToQuizState,
  broadcastQuizState,
  QuizState,
} from "../supabaseRealtime";

export default function BlueTeam() {
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

  // Only lock out if lockoutTeam is 'blue'
  useEffect(() => {
    if (quizState && quizState.lockoutTeam === "blue") {
      if (lockoutTimeout.current) clearTimeout(lockoutTimeout.current);
      lockoutTimeout.current = setTimeout(async () => {
        await broadcastQuizState({
          ...quizState,
          lockoutTeam: null,
        });
      }, 3000);
    } else if (quizState && quizState.lockoutTeam !== "blue") {
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
      buzzerTeam: "blue",
    });
    setLoading(false);
  };

  const isBuzzDisabled =
    !quizState ||
    quizState.buzzerTeam !== null ||
    loading ||
    quizState.questionNumber === 0 ||
    quizState.lockoutTeam === "blue";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 p-8">
      {/* Hidden audio element for buzzer */}
      <audio src="/buzzer.mp3" ref={buzzerAudioRef} style={{ display: 'none' }} />
      <div className="flex flex-col items-center bg-white/80 dark:bg-blue-900/80 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-3xl font-bold mb-4 text-blue-700">
          Équipe Bleue
        </div>
        <div className="text-6xl font-extrabold mb-8 text-blue-600 drop-shadow-lg">
          {quizState?.bluePoints ?? 0}
        </div>
        <button
          className="w-full py-8 text-5xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isBuzzDisabled}
          onClick={handleBuzz}
        >
          Buzz !
        </button>
        {quizState?.buzzerTeam && (
          <div className="mt-6 text-xl font-semibold text-center">
            {quizState.buzzerTeam === "blue"
              ? "Vous avez buzzé !"
              : "L'autre équipe a déjà buzzé."}
          </div>
        )}
      </div>
    </div>
  );
}
