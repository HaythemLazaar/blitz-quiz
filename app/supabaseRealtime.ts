import { createClient } from '@supabase/supabase-js';

// You should set these with your actual Supabase project credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type QuizState = {
  questionNumber: number;
  redPoints: number;
  bluePoints: number;
  buzzerTeam: 'red' | 'blue' | null;
  lockoutTeam?: 'red' | 'blue' | null;
};

const CHANNEL_NAME = 'quiz_channel';

// Broadcast the current quiz state to all subscribers
export async function broadcastQuizState(state: QuizState) {
  await supabase.channel(CHANNEL_NAME).send({
    type: 'broadcast',
    event: 'quiz_state',
    payload: state,
  });
}

// Subscribe to quiz state updates
export function subscribeToQuizState(onStateUpdate: (state: QuizState) => void) {
  const channel = supabase.channel(CHANNEL_NAME);
  channel.on('system', { event: 'sync' }, (payload) => {
    onStateUpdate(payload.payload as QuizState);
  });
  channel.on('broadcast', { event: 'quiz_state' }, (payload) => {
    onStateUpdate(payload.payload as QuizState);
  });
  channel.subscribe();
  return () => {
    channel.unsubscribe();
  };
} 